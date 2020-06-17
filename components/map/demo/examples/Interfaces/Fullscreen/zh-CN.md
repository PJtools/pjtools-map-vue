## API

`Fullscreen`地图全屏功能主要以API接口的形式进行驱动实现，`Fullscreen`地图全屏的管理接口统一挂接在`iMapApi.Interfaces`二级对象下，示例代码如下：

```javascript
// 获取地图Fullscreen全屏实例对象
const instance = iMapApi.Interfaces.fullscreen();
```

通过`iMapApi.Interfaces.fullscreen()`方法接口可以获取一个**新的**地图`Fullscreen`全屏实例对象，但由于地图全屏驱动采用HTML5的全屏接口实现，因此，在同一个应用场景下，不要多次调用获取实例对象，以免浏览器全屏能力冲突。

**温馨提醒:** 由于地图全屏是以HTML5的`requestFullscreen`接口实现，因此，出于浏览器安全等原因，需要挂载DOM元素对象上以事件人为手动触发，不能采用模拟直接调取接口形式来触发全屏化，否则会出现报错。

在获取地图`Fullscreen`全屏实例`instance`变量对象后，可以使用实例对象挂接的API接口：

- #### instance.enable()

	激活地图全屏模式。

- #### instance.disable()

	退出地图全屏模式。

- #### instance.isFullscreen()

	判断地图是否在浏览器全屏状态下。

- #### instance.toggle()

	驱动切换地图全屏，浏览器未进入全屏时，将进入全屏模式，反之，则退出全屏模式。

	### 事件监听

	> 地图`Fullscreen`全屏实例对象可通过`instance.on(name, listener)`、`instance.off(name, listener)`事件监听。

	| 事件名称 | 说明 | 输出对象 |
	| --- | --- | --- |
	| change | 当地图进入浏览器全屏或退出全屏时触发 | null |

	示例代码如下：

	```javascript
	const instance = iMapApi.Interfaces.fullscreen();
	instance.on('change', function() {
		// Todo...
		// 自定义业务
	});
	```
