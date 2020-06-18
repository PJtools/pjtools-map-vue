## API

地图全局`ScrollZoom`滚轮缩放交互对象统一挂接在`iMapApi.Handlers`二级对象下，可控制地图交互操作 `启用` | `禁用`，示例代码如下：

```javascript
// 获取地图滚轮缩放交互对象
const scrollZoom = iMapApi.Handlers.scrollZoom;
```

在获取地图全局`ScrollZoom`滚轮缩放交互对象后，可以使用对象挂接的API接口：

- #### scrollZoom.enable(options?)
	启用地图滚轮缩放交互。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| options | 可选项，滚轮缩放交互的参数选项，具体属性可参考`Mapbox GL`官网说明文档 | object | {} |

- #### scrollZoom.disable()
	禁用地图滚轮缩放交互。

- #### scrollZoom.isEnabled()
	获取地图滚轮缩放交互是否已启用。

- #### scrollZoom.setWheelZoomRate(wheelZoomRate)
	设置滚轮的缩放速率。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| wheelZoomRate | 滚轮缩放速率值 | number | 1/450 |

- #### scrollZoom.setZoomRate(zoomRate)
	设置地图层级的缩放速率。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| zoomRate | 地图层级缩放速率值 | number | 1/100 |
