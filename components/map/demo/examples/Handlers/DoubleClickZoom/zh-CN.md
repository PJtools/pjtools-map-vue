## API

地图全局`DoubleClickZoom`双击放大交互对象统一挂接在`iMapApi.Handlers`二级对象下，可控制地图交互操作 `启用` | `禁用`，示例代码如下：

```javascript
// 获取地图双击放大交互对象
const doubleClickZoom = iMapApi.Handlers.doubleClickZoom;
```

在获取地图全局`DoubleClickZoom`双击放大交互对象后，可以使用对象挂接的API接口：

- #### doubleClickZoom.enable()
	启用地图双击放大交互。

- #### doubleClickZoom.disable()
	禁用地图双击放大交互。

- #### doubleClickZoom.isEnabled()
	获取地图双击放大交互是否已启用。

- #### doubleClickZoom.isActive()
	获取当前地图是否处于活动状态。
