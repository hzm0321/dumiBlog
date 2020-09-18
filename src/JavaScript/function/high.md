---
group:
  title: 函数式编程
title: 高阶函数
order: 2
---

# 高阶函数

## 定义

> 高阶函数是接受函数作为参数并且/或者返回函数作为输出的函数。

## 抽象

一般而言，高阶函数通常用于抽象通用问题。换句话说，高阶函数就是定义抽象。  
例如，对于 `forEachObject` 函数的抽象。

```js
const forEachObject = (obj, fn) => {
  for (let property in obj) {
    if (obj.hasOwnProperty(property)) {
      fn && fn(property, obj[property]);
    }
  }
};
// 使用
let object = { a: 1, b: 2 };
forEachObject(object, (k, v) => console.log(k + ':' + v));
// a:1
// b:2
```

## 一些高阶函数举例

### tap 函数

接收参数并形成闭包，返回另一个包含参数的函数。

```js
const tap = value => {
  return fn => {
    typeof fn === 'function' && fn(value);
  };
};

// 使用
tap('hzm')(v => console.log(v));
// hzm
```

### unary 函数

接收一个给定的多参数函数，转换为接收一个参数的函数。

```js
const unary = fn => {
  return fn.length === 1 ? fn : arg => fn(arg);
};

// 使用
const numbers = ['1', '2', '3'];
numbers.map(parseInt);
// [1, NaN, NaN]
numbers.map(unary(parseInt));
// [1, 2, 3]
```

### once 函数

只允许运行一次给定函数。

```js
const once = fn => {
  let done = false;
  return (...rest) => {
    if (done) return undefined;
    done = true;
    fn(...rest);
  };
};

// 使用
const demo = once(test => {
  console.log(test);
});
demo('hello');
demo('hello');
// hello
```

### memoized 函数

使函数记住其计算结果。

```js
const memoized = fn => {
  // 记录结果
  const lookupTable = {};
  // 如果值没有记录，则执行方法，将方法的返回值记录
  return arg => lookupTable[arg] || (lookupTable[arg] = fn(arg));
};

// 使用
let factorial = memoized(n => {
  if (n === 0) return 1;
  return n * demo(n - 1);
});
console.log(factorial(20));
// 2432902008176640000
```
