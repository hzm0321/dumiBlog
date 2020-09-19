---
group:
  order: 1
  title: 类型
title:
---

# 类型

## 基本数据类型

在 `ES6` 之后 JS 存在着 6 种基本数据类型，它们在 JS 内部以`栈`的形式进行存储。

- **boolean**
- **null**
- **undefined**
- **number**
- **string**
- **symbol`(ES6 新增)`**

## 引用数据类型

引用数据类型主要是对象(`Object`)类型，它们在 JS 内部以`堆`的形式进行存储。

- **Object(普通对象)**
- **Array(数组对象)**
- **RegExp(正则对象)**
- **Date(日期对象)**
- **Math(数学对象)**
- **Function(函数对象)**

## 类型判断

### typeof

```js
typeof 1; // 'number'
typeof '1'; // 'string'
typeof undefined; // 'undefined'
typeof true; // 'boolean'
typeof Symbol(); // 'symbol'
typeof null; // object(不要使用此方法判断null）
```

注：对于 `null` 类型的判断，由于历史遗留问题。在 JS 的最初版本中使用的是 32 位系统，为了性能考虑使用低位存储变量的类型信息，`000` 开头代表是对象然而 null 表示为全零，所以将它错误地判断为 object 。  
对于引用类型的判断，不能使用 typeof。使用 typeof 判断引用类型，除了函数会返回 `function`，其余都会返回 `object` 类型。

### instanceof

可以采用基于原型链检查的 `instanceof` 方法，判断引用类型。

```js
array instanceof Array; // true
date instanceof Date; // true
fn instanceof Function; // true
```

一个简单的 `instanceof` 手动实现。

```js
const instanceOfTest = (target, object) => {
  // 排除基本类型
  if (typeof target !== 'object' || target === null) return false;
  let prototype = Object.getPrototypeOf(target);
  while (true) {
    if (prototype === null) return false;
    if (prototype === object.prototype) return true;
    prototype = Object.getPrototypeOf(prototype);
  }
};

console.log(instanceOfTest([], Array)); // true;
```

### toString

`toString` 是 `Object` 的原型方法，调用该方法，默认返回当前对象的 `Class` 。这是一个内部属性，其格式为 `[object xxx]` ，其中 `xxx` 就是对象的类型。  
对于 Object 对象，直接调用 toString() 就能返回 `[object Object]` 。而对于其他对象，则需要通过 `call / apply` 来调用才能返回正确的类型信息。

```js
Object.prototype.toString.call(''); // [object String]
Object.prototype.toString.call(1); // [object Number]
Object.prototype.toString.call(true); // [object Boolean]
Object.prototype.toString.call(Symbol()); // [object Symbol]
Object.prototype.toString.call(undefined); // [object Undefined]
Object.prototype.toString.call(null); // [object Null]
Object.prototype.toString.call(new Function()); // [object Function]
Object.prototype.toString.call(new Date()); // [object Date]
Object.prototype.toString.call([]); // [object Array]
Object.prototype.toString.call(new RegExp()); // [object RegExp]
Object.prototype.toString.call(new Error()); // [object Error]
Object.prototype.toString.call(document); // [object HTMLDocument]
Object.prototype.toString.call(window); // [object global] window 是全局对象 global 的引用
```

## 类型转换

### boolean 转换规则

| 原始类型  | 结果                               |
| :-------- | :--------------------------------- |
| number    | `0、-0、NaN` 为 false，其余为 true |
| string    | `''(空串)`为 false，其余为 true    |
| undefined | `false`                            |
| null      | `false`                            |
| 引用类型  | `true`                             |

### number 转换规则

| 原始类型 | 结果                                                 |
| :------- | :--------------------------------------------------- |
| string   | '1' => 1，'a' => NaN                                 |
| Array    | `[](空数组)`为 0，存在一个则数字转数字，其余情况 NaN |
| null     | `0`                                                  |
| 引用类型 | `NaN`                                                |
| Symbol   | `报错`                                               |

### object 转换规则

对象转原始类型会调用内置的 `[ToPrimitive]` 函数，会优先调用存在的方法：

1. Symbol.toPrimitive()
2. valueOf()
3. toString()
4. 以上都没有，则报错

```js
let obj = {
  value: 3,
  valueOf() {
    return 4;
  },
  toString() {
    return '5';
  },
  [Symbol.toPrimitive]() {
    return 6;
  },
};
console.log(obj + 1); // 7
```

### == 和 ===

== 代表不严格相等(`不推荐平时使用`)，转换规则如下：

- 判断类型，相同则比较值大小
- String 和 Number 比较，都转为 Number 再进行比较
- 一方是 Boolean 值，把 Boolean 转为 Number 再进行比较
- 一方为 Object， 另一方为 String、Number 或 Symbol，将 Object 转为 String 再比较

注：`undefined` 和 `null` 进行比较， 返回 `true`。

=== 代表严格相等，表示左右两边不仅类型要相等，值也要相等。判断引用类型，则判断引用地址的指针是否相同。
