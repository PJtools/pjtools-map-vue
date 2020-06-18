## API

地图全局`ZoomInOut`拉框放大/缩小交互对象统一挂接在`iMapApi.Handlers`二级对象下，可控制地图交互操作 `启用` | `禁用`，示例代码如下：

```javascript
// 获取地图拉框放大/缩小交互对象
const zoomInOut = iMapApi.Handlers.zoomInOut;
```

在获取地图全局`ZoomInOut`拉框放大/缩小交互对象后，可以使用对象挂接的API接口：

- #### zoomInOut.enable(options)
	启用地图拉框放大/缩小交互。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| options | 地图放大/缩小交互的参数选项 | object | {} |

	`options`属性的选项如下：

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| mode | 激活拉框的模式，`in`为拉框放大，`out`为拉框缩小 | 'in' \| 'out' | 'in' |

- #### zoomInOut.disable()
	禁用地图拉框放大/缩小交互。

- #### zoomInOut.isEnabled()
	获取地图拉框放大/缩小交互是否已启用。

- #### zoomInOut.isActive()
	获取当前地图是否处于活动状态。

### 事件监听

> 地图`ZoomInOut`拉框放大/缩小交互对象可通过`iMapApi.Evented.on(name, listener)`、`iMapApi.Evented.off(name, listener)`监听事件。

| 事件名称 | 说明 |
| --- | --- |
| zoominout.end | 当拉框放大/缩小完成时触发 |
| zoominout.cancel | 当拉框放大/缩小取消时触发 |

示例代码如下：

```javascript
iMapApi.Evented.on('zoominout.end', function() {
	// Todo...
	// 自定义业务
});
```
