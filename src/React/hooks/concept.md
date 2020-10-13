---
group:
  order: 2
  title: Hooks
title: 概念
order: 1
---

# 概念

通过在 `Function` 组件中使用 `React Hooks` 的 API 方法，使得我们可以在 Function 组件中可以使用 state 等 React 特性。相比于 `Class` 组件通过 `componentWillXXX、componentDidXXX` 等方法对 React 运行时组件状态更上层抽象出`生命周期`的概念，`Hooks` 更加贴近 React 内部运行时的各种概念（`props， state，context，refs 以及生命周期`）。

在使用 Hooks 的过程中，我们应丢弃编写 Class 组件时的各种思维模式。从严格意义上来说，两者不管从渲染时机和生命周期的底层执行机制来看，都是完全不同的。
