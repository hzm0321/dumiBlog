---
group:
  order: 2
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

## Object 类型

| 属性/方法               | 描述                                                                       |
| :---------------------- | :------------------------------------------------------------------------- |
| `construct`             | 用于创建当前对象函数。                                                     |
| `hasOwnProperty`        | 判断当前对象实例上是否存在给定属性(传入字符串类型，不会检查原型链上属性)。 |
| `isPrototypeof`         | 判断当前对象是否是传入对象的原型。                                         |
| `propertyIsEnumberable` | 判断给定属性是否可枚举。                                                   |
| `toLocaleString`        | 返回对象的字符串本地化执行环境表现形式。                                   |
| `toString`              | 返回对象的字符串表现形式。                                                 |
| `valueOf`               | 返回对象对应的字符串。通常与 `toString` 相同。                             |

## Symbol 类型

> Symbol(符号)是 ECMAScript6 新增的数据类型。符号是原始值，且符号实例是唯一、不可变的。符号的用途是确保对象属性使用唯一标识符，不会发生属性冲突的危险。

没有字面量语法，只需创建 `Symbol()` 实例并将其作为对象的新属性。`Symbol()` 函数不能用于构造函数。

```js
let s1 = Symbol('s1');
let s2 = Symbol('s1');
console.log(s1 === s2); // false

let s3 = new Symbol(); // error
```

### Symbol.for 全局符号注册表

`Symbol.for()` 接收一个字符串作为键，在全局符号注册表中创建并`重用`符号。

```js
let s1 = Symbol.for('s1');
let s2 = Symbol.for('s1');
console.log(s1 === s2); // true
```

注：`Symbol.for` 和 `Symbol` 即使采用相同地符号描述，也并不相同。

```js
let s1 = Symbol('s1');
let s2 = Symbol.for('s1');
console.log(s1 === s2); // false
```

### Symbol.keyFor 查询全局注册表

接收`Symbol` 类型，返回该全局符号对应的字符串键值。没有则返回 `undefined`。

```js
let s1 = Symbol.for('s1');
let s2 = Symbol('s2');
console.log(Symbol.keyFor(s1)); // s1
console.log(Symbol.keyFor(s2)); // undefined
```

### 查询对象中符号属性

这里主要用到了对 Object 属性的查询方法。

| 方法名                               | 结果                                       |
| :----------------------------------- | :----------------------------------------- |
| `Object.getOwnPropertyNames()`       | 返回对象的`常规`属性数组，不会往原型链上查 |
| `Object.getOwnSymbols()`             | 返回对象的`符号`属性数组，不会往原型链上查 |
| `Object.getOwnPropertyDescriptors()` | 返回包含`常规和符号`属性的描述符对象       |
| `Reflect.ownKeys()`                  | 返回包含`常规和符号`的键                   |

### 内置符号

#### Symbol.asyncIterator

实现异步迭代器

```js
class Emitter {
  constructor(max) {
    this.max = max;
    this.asyncIndex = 0;
  }

  async *[Symbol.asyncIterator]() {
    while (this.asyncIndex < this.max) {
      yield new Promise(resolve => resolve(this.asyncIndex++));
    }
  }
}

async function asyncCount() {
  let emitter = new Emitter(5);
  // 异步迭代的时候会调用对象的 Symbol.asyncIterator 方法
  for await (let x of emitter) {
    console.log(x);
  }
}

asyncCount();
// 0
// 1
// 2
// 3
// 4
```

#### Symbol.hasInstance

决定一个构造器对象是否认可一个对象是它的实例。它被 `instanceof` 操作符使用。

```js
function Foo() {}
const f = new Foo();
console.log(Foo[Symbol.hasInstance](f)); // true
```

#### Symbol.isConcatSpreadable

一个布尔值，如果是 true ，表示用 `Array.prototype.concat()` 打平数组元素。

```js
let arr1 = ['arr1'];
let arr2 = ['arr2'];
let obj = { length: 1, 0: 'obj' };
arr2[Symbol.isConcatSpreadable] = false;
obj[Symbol.isConcatSpreadable] = true;
console.log(arr1.concat(arr2)); // [ 'arr1', [ 'arr2', [Symbol(Symbol.isConcatSpreadable)]: false ] ]
console.log(arr1.concat(obj)); // [ 'arr1', 'obj' ]
```

#### Symbol.iterator

返回对象默认的迭代器

```js
class Emitter {
  constructor(max) {
    this.max = max;
    this.index = 0;
  }

  *[Symbol.iterator]() {
    while (this.index < this.max) {
      yield this.index++;
    }
  }
}

async function count() {
  let emitter = new Emitter(5);
  for (let x of emitter) {
    console.log(x);
  }
}

count();
// 0
// 1
// 2
// 3
// 4
```

#### Symbol.match

用正则表达式去匹配字符串。

```js
class FooMatcher {
  static [Symbol.match](target) {
    return target.includes('foo');
  }
}

console.log('footest'.match(FooMatcher)); // true
```

#### Symbol.replace

一个正则表达式方法，替换一个字符串中的子串。

```js
class FooReplacer {
  static [Symbol.replace](target, replacement) {
    return target.split('foo').join(replacement);
  }
}

console.log('111footest'.replace(FooReplacer, 'hhh'));
// 111hhhtest
```

#### Symbol.search

一个正则表达式方法，返回字符串中匹配正则表达式的索引。

```js
class FooSeacher {
  static [Symbol.search](target) {
    return target.includes('foo');
  }
}

console.log('footest'.search(FooSeacher));
// true
```

#### Symbol.species

一个函数值，该函数作为创建派生对象的构造函数。

```js
class Foo extends Array {
  static get [Symbol.species]() {
    return Array;
  }
}

let foo = new Foo();
console.log(foo instanceof Array); // true
console.log(foo instanceof Foo); // true
foo = foo.concat('foo');
console.log(foo instanceof Array); // true
console.log(foo instanceof Foo); // false
```

#### Symbol.split

一个正则表达式方法，匹配正则表达式的索引位置拆分字符串。

```js
class FooSpliterator {
  static [Symbol.split](target) {
    return target.split('foo');
  }
}

console.log('footest'.split(FooSpliterator));
// [ '', 'test' ]
```

#### Symbol.toPrimitive

将对象转换为相应的原始值。

```js
let obj = {
  value: 1,
  [Symbol.toPrimitive]() {
    return 2;
  },
};
console.log(obj + 1); // 3
```

#### Symbol.toStringTag

创建对象的默认字符串描述。

```js
let s = new Set();
console.log(s.toString()); // [object Set]
console.log(s[Symbol.toStringTag]);
Set;
```

## Map 类型

> `Map` 对象保存键值对，并且能够记住键的原始插入顺序。任何值(对象或者原始值) 都可以作为一个键或一个值。

### 实例方法

| 方法名    | 作用                                         | 返回值类型     |
| :-------- | :------------------------------------------- | :------------- |
| get       | 返回键对应的值，如果不存在，则返回 undefined | any\|undefined |
| set       | `''(空串)`为 false，其余为 true              |
| undefined | `false`                                      |
| null      | `false`                                      |
| 引用类型  | `true`                                       |

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
