---
group:
  order: 2
  title: Hooks
title: Hooks 产生背景
order: 0
---

# Hooks 产生背景

在 React Hooks 出现以前，我们经常使用 `Class` 形式创建组件以调用 React 所提供的各种 API 特性，但是这种方式会带来一系列问题。正如 Dan Abramov（Redux 作者） 在 2018 年提案 React Hooks 时所言。Class 组件面临以下问题：

1. **Wrapper hell（包装地狱）**
2. **Huge components （组件变得庞大）**
3. **Confusing classses （class 中的用法令人困惑，例如 this 指向问题等）**

为此，大部分开发者采用 `Mixins` 的方式混合使用 Class 组件和 Function 组件，解决一部分组件嵌套复用的问题。但是 React 官方不推荐这样做，Mixins 带来的问题远比它解决的问题要多，具体的可以参考这篇博客——[Mixins Considered Harmful](https://react.docschina.org/blog/2016/07/13/mixins-considered-harmful.html)。

为解决此类问题，React 原生提供了一个比 Class 组件更简单、更小型、更轻量的方式来添加 state 和 生命周期，那就是 `React Hooks`。本文的目的就是分析 React Hooks 的底层实现，从而让我们 React Hooks 使用者了解我们为什么要遵循 hooks 的使用约定，Hooks 可以有哪些进阶用法。

文章中所指定的 React 源码版本是 `React 16.13.1` 版本，大家可以参考对应的版本阅读。
