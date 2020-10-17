---
group:
  order: 1
  title: 元素
title: JSX
order: 0
---

# JSX

> JSX 是 JavaScript 的一种语法扩展，它和模板语言很接近，但是它充分具备 JavaScript 的能力。

## 转化流程

`JSX` 语法经过 `babel-plugin-react-jsx` 转化为 `React.createElement` 形式，再被 `React` 所解析。

**babel-plugin-react-jsx 转换前**

```js
<div id="div">
  <span>hello</span>
  <span>world</span>
</div>
```

**babel-plugin-react-jsx 转换后**

```js
React.createElement(
  'div',
  {
    id: 'div',
  },
  React.createElement('span', null, 'hello'),
  React.createElement('span', null, 'world'),
);
```

`React.createElement` 形式结构的代码，最后会被转化成 React 元素的形式。

**React 转化 JSX 流程**  
`/packages/react/src/ReactElement.js`

```js
export function createElement(type, config, children) {
  let propName; // 存储后面需要用到的元素属性

  // 提取保留名称
  const props = {};

  let key = null;
  let ref = null;
  let self = null;
  let source = null;

  // config 对象
  if (config != null) {
    if (hasValidRef(config)) {
      ref = config.ref;
    }
    if (hasValidKey(config)) {
      key = '' + config.key;
    }

    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    //将剩余的属性添加到新的props对象
    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        props[propName] = config[propName];
      }
    }
  }

  // childrenLength 指的是当前元素的子元素的个数，减去的 2 是 type 和 config 两个参数占用的长度
  const childrenLength = arguments.length - 2;

  if (childrenLength === 1) {
    // 如果抛去 type 和 config，就只剩下一个参数，一般意味着文本节点出现了
    props.children = children;
  } else if (childrenLength > 1) {
    // 处理嵌套多个子元素的情况
    // 声明一个包含长度的子元素数组
    const childArray = Array(childrenLength);
    // 把子元素推进数组
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  // 处理 defaultProps
  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }

  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props,
  );
}
```

`ReactElement` 方法再对 `createElement` 收集的参数做一层数据格式化。

```js
const ReactElement = function(type, key, ref, self, source, owner, props) {
  const element = {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner,
  };

  return element;
};
```

## 简化版 JSX 格式化

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JSX</title>
  </head>
  <body></body>
  <script>
    // let ele = <div id="div"><span>hello</span><span>world</span></div>
    const REACT_ELEMENT_TYPE = Symbol.for('react.element');
    const RESERVED_PROPS = {
      key: true,
      ref: true,
      __self: true,
      __source: true,
    };

    const ReactElement = (type, key, ref, self, source, owner, props) => {
      const element = {
        $$typeof: REACT_ELEMENT_TYPE,
        type: type,
        key: key,
        ref: ref,
        props: props,
        _owner: owner,
      };
      return element;
    };

    const React = {
      createElement(type, config, ...children) {
        const props = {};

        let key = null;
        let ref = null;
        let self = null;
        let source = null;

        const hasOwnProperty = Object.prototype.hasOwnProperty;

        if (config !== null) {
          ref = config.ref === undefined ? null : config.ref;
          key = config.key === undefined ? null : '' + config.key;
          self = config.__self === undefined ? null : config.__self;
          source = config.__source === undefined ? null : config.__source;
        }

        // 添加剩余属性
        for (let propNme in config) {
          // in 会遍历到原型链上属性，所以用 hasOwnProperty 加了一层约束
          if (
            hasOwnProperty.call(config, propNme) &&
            !RESERVED_PROPS.hasOwnProperty(propNme)
          ) {
            props[propNme] = config[propNme];
          }
        }

        const childrenLengthen = children.length;
        props.children = childrenLengthen > 1 ? children : children[0];

        // 处理 type 的 defaultProps
        if (type && type.defaultProps) {
          const defaultProps = type.defaultProps;
          for (let propName in defaultProps) {
            if (props[propName] === undefined) {
              props[propName] = defaultProps[propName];
            }
          }
        }

        return ReactElement(type, key, ref, self, source, 'own', props);
      },
    };
    const ele = React.createElement(
      'div',
      {
        id: 'div',
      },
      React.createElement('span', null, 'hello'),
      React.createElement('span', null, 'world'),
    );
    console.log(ele);
  </script>
</html>
```
