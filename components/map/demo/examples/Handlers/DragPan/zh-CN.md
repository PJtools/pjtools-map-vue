## API

地图全局`DragPan`漫游交互对象统一挂接在`iMapApi.Handlers`二级对象下，可控制地图交互操作 `启用` | `禁用`，示例代码如下：

```javascript
// 获取地图漫游交互对象
const dragPan = iMapApi.Handlers.dragPan;
```

在获取地图全局`DragPan`漫游交互对象后，可以使用对象挂接的API接口：

- #### dragPan.enable(options?)
	启用地图漫游交互。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| options | 可选项，漫游交互的参数选项，具体属性可参考`Mapbox GL`官网说明文档 | object | {} |

- #### dragPan.disable()
	禁用地图漫游交互。

- #### dragPan.isEnabled()
	获取地图漫游交互是否已启用。

- #### dragPan.isActive()
	获取当前地图是否处于活动状态。
