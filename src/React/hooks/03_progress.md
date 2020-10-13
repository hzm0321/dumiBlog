---
group:
  order: 2
  title: Hooks
title: Hooks 执行流程
order: 3
---

# Hooks 执行流程

**首先我们找到最上层引入 Hooks 所在的源码位置。**  
`/packages/react/src/ReactHooks.js`  
在这个目录中导出了 `React 16.13.1` 版本目前所支持的所有 `useXXX` 方法。`ReactHooks.js` 这个文件中并没有具体写 Hooks 的实现，仅作为 Hooks 的任务调度。可以理解为是 Hooks 任务与 `React Dispatcher` 的桥梁。每个 Hook 的执行都会生成一个调度器（见 `resolveDispatcher` 方法）。这个调度器最终是由 `ReactFiberHooks.js` 这个文件所生成。

```js
function resolveDispatcher() {
  // 生成一个调度器
  const dispatcher = ReactCurrentDispatcher.current;
  invariant(
    dispatcher !== null,
    'Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for' +
      ' one of the following reasons:\n' +
      '1. You might have mismatching versions of React and the renderer (such as React DOM)\n' +
      '2. You might be breaking the Rules of Hooks\n' +
      '3. You might have more than one copy of React in the same app\n' +
      'See https://fb.me/react-invalid-hook-call for tips about how to debug and fix this problem.',
  );
  return dispatcher;
}
```

**再来看看 Hooks 的调度器都做了什么。**  
`/packages/react-reconciler/src/ReactFiberHooks.js`  
首先看看这个导出的类型 `Dispatcher`。 `Dispatcher` 定义了各个 Hooks 类型，也就是前面 `ReactHooks.js` 中 `resolveDispatcher` 方法返回的 `dispatcher`。  
再来介绍一下每个 Hook 的基本结构，这也是每个 Hook 任务的最小数据结构单元。

```js
export type Hook = {|
  memoizedState: any,
  baseState: any,
  baseQueue: Update<any, any> | null,
  queue: UpdateQueue<any, any> | null,
  next: Hook | null,
|};
```

- `memoizedState`：保存了 hook 当前的状态值（页面上最新显示的）。
- `baseState`：hook 在比较新值的时候所要对比的状态（ state 的计算过程需要考虑`优先级`，可能有些 `update` 优先级不够被跳过。所以这里区分开 `memoizedState` 和 `baseState` 。）
- `baseQueue`：本次更新开始时已有的 update 队列。
- `queue`：该 hook 自身维护的更新队列
- `next`：指向下一个 hook 。

**Hook 的挂载和更新**  
 每个 Hook 主要分为两个阶段——挂载（`mount`）和更新（`update`）。在 Hooks 渲染（`renderWithHooks`）的时候，会通过判断传入 `renderWithHooks` 方法的 `current` 参数判断是否存在 `Fiber` 节点，再选择是执行 Hook 的挂载（`HooksDispatcherOnMount`）还是更新（`HooksDispatcherOnUpdate`）。

```js
ReactCurrentDispatcher.current =
  current === null || current.memoizedState === null
    ? HooksDispatcherOnMount
    : HooksDispatcherOnUpdate;
```

`HooksDispatcherOnMount`和`HooksDispatcherOnUpdate`方法内保存着不同 hooks 在挂载和更新时所对应执行的方法。

不同 Hooks 的 挂载和更新阶段所做的事情是不一样的，下面章节通过介绍几个常用的 Hooks，来理清楚 Hooks 挂载和更新阶段所做的事情。
