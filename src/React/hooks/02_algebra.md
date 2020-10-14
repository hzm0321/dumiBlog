---
group:
  order: 2
  title: Hooks
title: 代数效应
order: 2
---

# 代数效应

> 我们在 React 中做的就是践行代数效应——Sebastian Markbåge（React Hooks 发明者）

`代数效应`是函数式编程中的一个概念，用于将`副作用`从函数调用中分离。举一个简单的例子，当我们在执行一个函数的时候，这个函数中间要发起一个异步请求。那么这个函数就不能称之为 `纯函数`，因为它包含副作用。如果这时候有一个代数效应的方式，能够将副作用从中分离，也就能把这个函数再次变为纯函数。JS 语言中官方并没有提供一个执行代数效应的 API。Dan Abramov 在他的博客中举了一个[模拟代数效应](https://overreacted.io/algebraic-effects-for-the-rest-of-us/)的语法。

```js
function getName(user) {
  let name = user.name;
  if (name === null) {
    // 1. 我们在这里执行效应
  	name = perform 'ask_name';
  	// 4. ...最后回到这里（现在 name 是 'Arya Stark'）了
  }
  return name;
}

function makeFriends(user1, user2) {
  user1.friendNames.add(getName(user2));
  user2.friendNames.add(getName(user1));
}

const arya = { name: null };
const gendry = { name: 'Gendry' };
try {
  makeFriends(arya, gendry);
} handle (effect) {
  // 2. 我们进入处理程序（类似 try/catch）
  if (effect === 'ask_name') {
    // 3. 但是这里我们可以带一个值继续执行（与 try/catch 不同!）
    // 你的副作用执行逻辑
  	resume with 'Arya Stark';
  }
}
```

这里改造了一下 `try/catch` 语法，假设出了一个 `try/handle` 语法。`perform` 替换了一下 `throw` 的触发方式。当执行到 `perform` 会自动进入 `handle` 代码块并带出参数（模拟执行了一个 `effect`）。`resume with` 相当于恢复执行之前发生副作用的作用域继续执行代码。  
这种方式对比一下 JS 现有的 `async/await` 语法，最大的区别是`async/await` 相当于是一种 `染色语法`，因为调用它的函数必须也是采用 `async/await` 语法形式，才能获取其特性（像不像颜色的浸染？）。而我们通过模拟的一个代数效应的`效应处理器`，我们可以异步地调用 `resume with` 获取其特性而无需修改 `getName` 或 `makeFriends`。
