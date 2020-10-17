---
group:
  order: 2
  title: Hooks
title: useState
order: 4
---

# useState

### mountState 阶段

挂载阶段 `ReactCurrentDispatcher.current` 指向 `HooksDispatcherOnMount` 对象，故而调用 `useState` 执行 `mountState()` 方法。

`mountState` 的执行可以分为 3 个阶段：

1.  **获取 hooks 链上尾节点**
2.  **初始化参数**
3.  **设置参数更新的 dispatch**

**1. 获取 hooks 链上尾节点**

```js
function mountState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  // 1. 获取 hooks 链上尾节点
  // 获取当前 Hooks 节点,同时将当前 hook 添加到 hooks 链表中
  const hook = mountWorkInProgressHook();
  // ......
}
```

在挂载阶段执行的是 `mountWorkInProgressHook()` 方法，获取 Hooks 链上的尾节点。

```js
// 添加 hook 到链表的方法
function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,

    baseState: null,
    baseQueue: null,
    queue: null,

    next: null, // 指向下一个队列
  };

  // workInProgressHook 指向当前组件的 hooks 链表
  if (workInProgressHook === null) {
    // 如果链表为空,则把当前 hook 作为头结点
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    // 不为空,添加到末尾
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}
```

`workInProgressHook` 若为空则创建，不为空则向已存在的（`workInProgressHook`）添加初始化的 Hook 节点，并保持新添加的 Hook 始终在链表的末尾。因此，调用 `mountWorkInProgressHook()` 方法，就能获取 Hooks 链上的尾节点

生成的 Hooks 链表需要通过 `memoizedState` 属性挂载到当前渲染的 `Fiber` 节点上，从而保持 `React Fiber` 的任务调度机制。如下图所示：
![React Hooks 链](https://raw.githubusercontent.com/hzm0321/picgo/master/img/20201008151817.png)

**2. 初始化参数**

```js
function mountState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  // 1. 获取 hooks 链上尾节点
  // 获取当前 Hooks 节点,同时将当前 hook 添加到 hooks 链表中
  const hook = mountWorkInProgressHook();

  // 2. 初始化参数
  // 如果初始化参数接收的是一个方法, 那么接收该方法执行后的返回值
  if (typeof initialState === 'function') {
    initialState = initialState();
  }
  // 保存 state 初始化数据
  hook.memoizedState = hook.baseState = initialState;
  // ......
}
```

`useState(initialState)` 可以接收初始化参数，如果 `initialState` 接收的是一个函数，则会执行该函数，并把该函数的返回值作为初始值。

`注：initialState 参数建议用对象字面量或函数返回值的形式，因为这能保证每次初始化的时候 initialState 指向不同的内存地址`

初始化阶段时，当前 Hook 节点的 `memoizedState` 和 `baseState` 均指向初始值（更新阶段这两个值会有所区别）。

**3. 设置参数更新的 dispatch**

```js
function mountState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  // 1. 获取 hooks 链上尾节点
  // 获取当前 Hooks 节点,同时将当前 hook 添加到 hooks 链表中
  const hook = mountWorkInProgressHook();

  // 2. 初始化参数
  // 如果初始化参数接收的是一个方法, 那么接收该方法执行后的返回值
  if (typeof initialState === 'function') {
    initialState = initialState();
  }
  // 保存 state 初始化数据
  hook.memoizedState = hook.baseState = initialState;

  // 3. 设置参数更新的 dispatch
  // 创建单向循环链表更新队列
  const queue = (hook.queue = {
    pending: null, // 队列头指针
    dispatch: null, // 队列更新
    lastRenderedReducer: basicStateReducer, // 组件最近一次渲染时调用的 reducer
    lastRenderedState: (initialState: any), // 组件最近一次渲染订单 state
  });
  // dispatchAction 添加到更新队列中
  const dispatch: Dispatch<
    BasicStateAction<S>,
  > = (queue.dispatch = (dispatchAction.bind(
    null,
    currentlyRenderingFiber, // 当前正在渲染的 Fiber
    queue, // hoos 更新队列
  ): any));
  // 接收的初始值和更新方法
  // 实际上在调用 setXXX 的时候调用了 dispatchAction(currentlyRenderingFiber, queue, 即将更新的值)
  return [hook.memoizedState, dispatch];
}
```

初始化阶段需要创建一个队列用于之后的 Hook 更新操作。队列主要保存以下信息：

- `pending`：最近一个等待执行的更新。
- `dispatch`：更新 state 的方法。
- `lastRenderedReducer`：组件最近一次渲染时用的 reducer（useState 实际上是一个简化版的 useReducer，之所以用户在使用 useState 时不需要传入 reducer，是因为 useState 默认使用 react 官方写好的 reducer：`basicStateReducer`）。
- `lastRenderedState`：组件最近一次渲染的 state。

useState 返回数组的第二个参数 `dispatch` 实际上是调用了 `dispatchAction` 方法，并且使用 `bind` 语法预置了前两个参数（`currentlyRenderingFiber` 和 `queue`）。所以当我们在业务代码中调用 `setXXX('XXX')` 时，实际上调用的是 `dispatch(currentlyRenderingFiber, queue, 'XXX')`。

**解析 dispatchAction**  
我们再来看看 setState 的 `dispatch` 具体是怎么去更新的。  
`/packages/react-reconciler/src/ReactFiberHooks.js`

```js
function dispatchAction<S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  action: A,
) {
  // 忽略掉过期时间校验部分......

  // 为当前更新创建 update 对象
  const update: Update<S, A> = {
    expirationTime,
    suspenseConfig,
    action,
    eagerReducer: null,
    eagerState: null,
    next: (null: any),
  };

  // 保存旧的队列头节点
  const pending = queue.pending;
  if (pending === null) {
    // 如果循环队列为空, 创建循环队列,尾指针指向自己
    update.next = update;
  } else {
    // 如果不为空,当前更新的 update 作为循环队列的头结点
    update.next = pending.next;
    pending.next = update;
  }
  // 新队列的 pending 属性始终指向头结点
  queue.pending = update;

  // ......
}
```

第一次看这部分代码，我们先忽略掉过期时间校验部分的代码（主要和任务执行优先级相关），先理清楚 `update 链`是如何生成的。我们这里假设进行了 3 次 `setState` 操作。

```js
setName('update1');
setName('update2');
setName('update3');
```

**第一次 setState**  
此时 update 链表为空，pending 为 null。创建一个只有一个节点的链表，并且队尾指针指向自己，以此构成一个最简单的`单向循环链表`。  
`注：queue.pending 始终指向单向循环链表的队尾`
![第一次 setState](https://gitee.com/hzm0321/markdown-img/raw/master/img/20201008163756.png)

**第二次 setState**  
此时 update 链表不为空，新的 update 节点的 next 指向原有的 update 链表的头节点(`update.next = pending.next`)，构成链表的单向循环。update 链表的尾结点的 next 再指向当前 update 节点(`pending.next = update`)，使得新的 update 节点被添加到 update 链表中。新添加进来的 update 节点始终在队尾。
![第二次 setState](https://gitee.com/hzm0321/markdown-img/raw/master/img/20201008164224.png)

**第三次 setState**  
第三次的 setState 以此类推，继续往 update 链表的尾节点追加。
![第三次 setState](https://gitee.com/hzm0321/markdown-img/raw/master/img/20201008164554.png)

我们再把每个 Hook 自己的 queue 和之前 Hooks 链表的图结合一下，得到的图如下。
![](https://gitee.com/hzm0321/markdown-img/raw/master/img/20201008165717.png)

```js
function dispatchAction<S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  action: A,
) {
  ...
  // 生成 update 对象，并将 update 对象添加到更新队列链表中
  ...

  // 获取上一次渲染的 state （也就是此时正显示在屏幕上的 state）
  const currentState: S = (queue.lastRenderedState: any);

  // 获取当前最新计算出来的 state（待渲染）
  const eagerState = lastRenderedReducer(currentState, action); // 如果是 useState，这一句相当于是：const eagerState = action;
  update.eagerReducer = lastRenderedReducer;
  update.eagerState = eagerState;

  // 判断 eagerState（当前最新计算出来的 state）和 currentState （上一次渲染时 state） 的值是否相同，如果相同则直接跳过，不再安排 fiberNode 的更新工作（取消组件的重新渲染）
  if (is(eagerState, currentState)) {
    return;
  }

  ...

  // 触发 fiberNode 安排更新工作（组件重新渲染）
  scheduleWork(fiber, expirationTime);
}
```

构建完 update 链表后，会再进行完任务优先级判断，之后再通过 `Object.is` 判断当前即将渲染的 state 与 当前页面上已经渲染的 state (`lastRenderedState`) 进行比较。若值相同，则直接 return ，不安排更新。若值不同，调用 `scheduleWork()` 安排更新。另外，调用 `scheduleWork()` 不会马上进行 `Fiber` 的更新，它会首先进行`优先级判断`和`更新合并`。  
因此，我们在业务代码中多次 setState 相同的值，React 不会为我们进行重复渲染。如果是引用类型的值，引用地址不同还是会触发重复渲染。

### updateState 阶段

当第二次刷新组件的时候，就进入了 `update` 阶段。

```js
function updateState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  return updateReducer(basicStateReducer, (initialState: any));
}
```

不难发现，`updateState()` 实际调用的是 `updateReducer()` 方法，因为调用 useState 的时候不会传入 reducer ，所以默认传了 `basicStateReducer`。

```js
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
  // 如果传入的 action 是一个函数,获取他的返回值
  return typeof action === 'function' ? action(state) : action;
}
```

`basicStateReducer` 没有做太多事情，仅仅是做更新 `action` 的返回。我们最后看看本次更新的核心方法——`updateReducer`。

```js
function updateReducer<S, I, A>(
  reducer: (S, A) => S,
  initialArg: I,
  init?: I => S,
): [S, Dispatch<A>] {
  // 正在处于更新阶段的 hook 结点
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;
  invariant(
    queue !== null,
    'Should have a queue. This is likely a bug in React. Please file an issue.',
  );

  // 组件最后一次渲染的 reducer
  queue.lastRenderedReducer = reducer;

  const current: Hook = (currentHook: any);

  // 页面上已经更新的值的 update 队列
  let baseQueue = current.baseQueue;

  // 尚未更新的 hook 队列
  let pendingQueue = queue.pending;
  if (pendingQueue !== null) {
    // 有尚未处理的更新,我们将它添加到 baseQueue
    if (baseQueue !== null) {
      // 合并 queue 和 baseQueue
      let baseFirst = baseQueue.next;
      let pendingFirst = pendingQueue.next;
      baseQueue.next = pendingFirst;
      pendingQueue.next = baseFirst;
    }
    current.baseQueue = baseQueue = pendingQueue;
    queue.pending = null;
  }

  if (baseQueue !== null) {
    // We have a queue to process.
    let first = baseQueue.next;
    let newState = current.baseState;

    let newBaseState = null;
    let newBaseQueueFirst = null;
    let newBaseQueueLast = null;
    let update = first;
    do {
      const updateExpirationTime = update.expirationTime;
      if (updateExpirationTime < renderExpirationTime) {
        // Priority is insufficient. Skip this update. If this is the first
        // skipped update, the previous update/state is the new base
        // update/state.
        const clone: Update<S, A> = {
          expirationTime: update.expirationTime,
          suspenseConfig: update.suspenseConfig,
          action: update.action,
          eagerReducer: update.eagerReducer,
          eagerState: update.eagerState,
          next: (null: any),
        };
        if (newBaseQueueLast === null) {
          newBaseQueueFirst = newBaseQueueLast = clone;
          newBaseState = newState;
        } else {
          newBaseQueueLast = newBaseQueueLast.next = clone;
        }
        // Update the remaining priority in the queue.
        if (updateExpirationTime > currentlyRenderingFiber.expirationTime) {
          currentlyRenderingFiber.expirationTime = updateExpirationTime;
          markUnprocessedUpdateTime(updateExpirationTime);
        }
      } else {
        // This update does have sufficient priority.

        if (newBaseQueueLast !== null) {
          const clone: Update<S, A> = {
            expirationTime: Sync, // This update is going to be committed so we never want uncommit it.
            suspenseConfig: update.suspenseConfig,
            action: update.action,
            eagerReducer: update.eagerReducer,
            eagerState: update.eagerState,
            next: (null: any),
          };
          newBaseQueueLast = newBaseQueueLast.next = clone;
        }

        // Mark the event time of this update as relevant to this render pass.
        // TODO: This should ideally use the true event time of this update rather than
        // its priority which is a derived and not reverseable value.
        // TODO: We should skip this update if it was already committed but currently
        // we have no way of detecting the difference between a committed and suspended
        // update here.
        markRenderEventTimeAndConfig(
          updateExpirationTime,
          update.suspenseConfig,
        );

        // Process this update.
        if (update.eagerReducer === reducer) {
          // If this update was processed eagerly, and its reducer matches the
          // current reducer, we can use the eagerly computed state.
          newState = ((update.eagerState: any): S);
        } else {
          const action = update.action;
          newState = reducer(newState, action);
        }
      }
      update = update.next;
    } while (update !== null && update !== first);

    if (newBaseQueueLast === null) {
      newBaseState = newState;
    } else {
      newBaseQueueLast.next = (newBaseQueueFirst: any);
    }

    // Mark that the fiber performed work, but only if the new state is
    // different from the current state.
    if (!is(newState, hook.memoizedState)) {
      markWorkInProgressReceivedUpdate();
    }

    hook.memoizedState = newState;
    hook.baseState = newBaseState;
    hook.baseQueue = newBaseQueueLast;

    queue.lastRenderedState = newState;
  }
  // 返回更新后的值和更新的 dispatch
  const dispatch: Dispatch<A> = (queue.dispatch: any);
  return [hook.memoizedState, dispatch];
}
```

`updateReducer()` 会去遍历更新队列链表，执行每一个节点里面的更新操作，得到最新的状态并返回，以此来保证我们每次刷新组件都能拿到当前最新的状态。useState 的 reducer 是 `basicStateReducer`，因为传入的 `update.action` 是一个值，所以直接返回了 update.action 了，而 useReducer 的 reducer 是用户自定义的 reducer，所以会根据每次传入的 action 和每次循环得到的 newState 逐步计算出最新的状态。

### 简化版 useState

在理清楚了 `useState` 的基本原理后，实现了一个简化版的 `useState`。可拷贝代码到 HTML 文件直接运行。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>useState</title>
  </head>
  <body>
    <div id="count"></div>
    <div id="newCount"></div>
    <button onClick="func()">addCount</button>
  </body>
  <script>
    let workInProgressHook = null; // 指向当前正在工作的 hook
    let isMount = true; // 是否是挂载阶段
    let func;

    window.onload = () => {
      func = schedule().click;
    };

    // 简化的 fiber 节点
    const fiber = {
      memoizedState: null, // 指向 hook 链
      stateNode: App, // 任务节点
    };

    // 任务调度
    function schedule() {
      workInProgressHook = fiber.memoizedState; // 获取 fiber 上的 hook 链
      const app = fiber.stateNode(); // 执行页面渲染
      isMount = false;
      return app;
    }

    function dispatchAction(queue, action) {
      // 构建 update 链
      const update = {
        action,
        next: null,
      };
      const pending = queue.pending;
      if (pending === null) {
        update.next = update;
      } else {
        update.next = pending.next;
        pending.next = update;
      }
      queue.pending = update;
      // 发起 fiber 任务调度
      schedule();
    }

    function mountWorkInProgressHook() {
      const hook = {
        queue: { pending: null },
        memoizedState: null,
        next: null,
      };
      if (workInProgressHook === null) {
        fiber.memoizedState = workInProgressHook = hook;
      } else {
        workInProgressHook = workInProgressHook.next = hook;
      }
      return workInProgressHook;
    }

    function updateWorkInProgressHook() {
      const curWorkInProgressHook = workInProgressHook;
      // hook 链指针后移
      workInProgressHook = workInProgressHook.next;
      return curWorkInProgressHook;
    }

    // 调用入口
    function useState(initialState) {
      return isMount ? mountState(initialState) : updateState();
    }

    function mountState(initialState) {
      // 1. 获取 hooks 链上尾节点
      hook = mountWorkInProgressHook();
      // 2. 初始化参数
      if (typeof initialState === 'function') {
        initialState = initialState();
      }
      hook.memoizedState = initialState;
      // 3. 设置参数更新的 dispatch
      const dispatch = dispatchAction.bind(null, hook.queue);
      return [hook.memoizedState, dispatch];
    }

    function updateState() {
      // 1. 获取 hooks 链上头
      hook = updateWorkInProgressHook();

      // 2. 更新 state
      let baseState = hook.memoizedState;
      if (hook.queue.pending) {
        let firstUpdate = hook.queue.pending.next; // 单向循环链表头节点
        do {
          const action = firstUpdate.action;
          // 因为没有jsx,所以存在闭包,只支持传方法
          if (typeof action !== 'function') {
            throw new Error('需要接收一个方法');
          }
          baseState = action(baseState);
          firstUpdate = firstUpdate.next;
        } while (firstUpdate !== hook.queue.pending);
        hook.queue.pending = null;
      }
      hook.memoizedState = baseState;
      // 3. 设置参数更新的 dispatch
      const dispatch = dispatchAction.bind(null, hook.queue);
      return [hook.memoizedState, dispatch];
    }

    function App() {
      const [count, setCount] = useState(0);
      const [newCount, setNewCount] = useState(1);
      document.getElementById('count').innerHTML = count;
      document.getElementById('newCount').innerHTML = newCount;
      return {
        click() {
          setCount(count => count + 1);
          setNewCount(newCount => newCount + 2);
        },
      };
    }
  </script>
</html>
```
