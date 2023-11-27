---
title: Button
nav:
  title: 组件
  path: /components
---

# Button

基本按钮组件。

## 代码演示

```jsx
/**
 * title: 按钮类型
 * description: 按钮由两种类型，分别为主按钮和次按钮。
 */

import { Button } from "fj-components";

export default () => {
  return (
    <div>
      <Button type="primary" label="primary" />
      <Button type="secondary" label="secondary" />
    </div>
  );
};
```

```jsx
/**
 * title: 按钮内容
 * description: 按钮中显示的文字。
 */

import { Button } from "fj-components";

export default () => {
  return (
    <div>
      <Button label="按钮 1" />
      <Button label="按钮 2" />
    </div>
  );
};
```

```jsx
/**
 * title: 按钮尺寸
 * description: 按钮有三种尺寸，分别为大、中、小。
 *
 */

import { Button } from "fj-components";

export default () => {
  return (
    <div>
      <Button size="large" label="large" />
      <Button size="medium" label="medium" />
      <Button size="small" label="small" />
    </div>
  );
};
```

```jsx
/**
 * title: 按钮等待状态
 * description: 添加 loading 属性即可让按钮处于加载状态。
 *
 */

import { Button } from "fj-components";

export default () => {
  return (
    <div>
      <Button loading label="loading" />
    </div>
  );
};
```

```jsx
/**
 * title: 按钮禁用状态
 * description: 添加 disabled 属性即可让按钮处于禁用状态。
 *
 */

import { Button } from "fj-components";

export default () => {
  return (
    <div>
      <Button disabled label="disabled" />
    </div>
  );
};
```

<API id="Button"></API>
