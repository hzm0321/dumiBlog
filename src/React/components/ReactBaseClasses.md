---
group:
  order: 2
  title: 组件
title: ReactBaseClasses
order: 1
---

# ReactBaseClasses

`ReactBaseClasses` 中主要定义了 `Component` 和 `PureComponent` 两种 React 类组件的基类。并在其原型上抽象了一些操作方法（`注：该类中只做抽象，不做具体实现。`）

## Component

接收三个参数：

1.  **props**
2.  **context**
3.  **updater**
