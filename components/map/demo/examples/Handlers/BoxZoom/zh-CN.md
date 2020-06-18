## API

地图全局`BoxZoom`Shift拉框放大交互对象统一挂接在`iMapApi.Handlers`二级对象下，可控制地图交互操作 `启用` | `禁用`，示例代码如下：

```javascript
// 获取地图Shift拉框放大交互对象
const boxZoom = iMapApi.Handlers.boxZoom;
```

> **操作说明**：`Shift + Drag拉框`。

在获取地图全局`BoxZoom`Shift拉框放大交互对象后，可以使用对象挂接的API接口：

- #### boxZoom.enable()
	启用地图Shift拉框放大交互。

- #### boxZoom.disable()
	禁用地图Shift拉框放大交互。

- #### boxZoom.isEnabled()
	获取地图Shift拉框放大交互是否已启用。

- #### boxZoom.isActive()
	获取当前地图是否处于活动状态。
