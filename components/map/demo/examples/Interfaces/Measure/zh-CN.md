## API

地图`Measure`测量功能主要以API接口的形式进行驱动实现，`Measure`测量的管理接口统一挂接在`iMapApi.Interfaces`二级对象下，示例代码如下：

```javascript
// 获取地图Measure测量实例对象
const instance = iMapApi.Interfaces.measure();
```

通过`iMapApi.Interfaces.measure()`方法接口可以获取一个**新的**地图`Measure`测量实例对象，因此，在同一个应用场景下，不要多次调用获取实例对象，然而它们每次都是不同的。

在获取地图`Measure`测量实例`instance`变量对象后，可以使用实例对象挂接的API接口：

- #### instance.enable(mode)

	激活指定地图测量模式。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| mode | 地图测量的模式，可选参数：`line` \| `polygon` \| `rectangle` \| `circle` \| | string | 'line' |

- #### instance.disable()

	取消当前激活的地图测量模式。

- #### instance.isEnabled()

	获取地图测量交互实例是否激活量算模式。

- #### instance.isActive()

	获取地图测量交互实例是否在量算的活动状态下。

- #### instance.destroy()

	销毁地图测量，其中包括：激活的量算数据、图层、节点、量算信息等。

- #### instance.getAllData()

	获取当前在地图上绘制的所有量算数据对象。

- #### instance.getDataById(id)

	获取指定测量唯一Id的数据对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 地图测量的唯一Id名称 | string |

- #### instance.deleteById(id)

	删除指定测量唯一Id的绘制要素、节点、量算信息等。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 地图测量的唯一Id名称 | string |

	### 事件监听

	> 地图`Measure`测量实例对象可通过`instance.on(name, listener)`、`instance.off(name, listener)`事件监听。

	| 事件名称 | 说明 | 输出对象 |
	| --- | --- | --- |
	| complete | 当前地图测量绘制完成时触发 | { data: object } |
	| cancel | 当前地图测量取消时触发 | null |

	示例代码如下：

	```javascript
	const instance = iMapApi.Interfaces.measure();
	instance.on('complete', function({ data }) {
		// Todo...
		// 自定义业务
	});
	```
