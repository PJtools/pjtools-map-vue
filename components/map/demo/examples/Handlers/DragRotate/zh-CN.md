## API

地图全局`DragRotate`旋转倾斜交互对象统一挂接在`iMapApi.Handlers`二级对象下，可控制地图交互操作 `启用` | `禁用`，示例代码如下：

```javascript
// 获取地图旋转倾斜交互对象
const dragRotate = iMapApi.Handlers.dragRotate;
```

> **操作说明**：鼠标右键（反键）拖拽可直接操作地图旋转倾斜，同时，亦可以使用 `Ctrl + Drag`操作。

在获取地图全局`DragRotate`旋转倾斜交互对象后，可以使用对象挂接的API接口：

- #### dragRotate.enable()
	启用地图旋转倾斜交互。

- #### dragRotate.disable()
	禁用地图旋转倾斜交互。

- #### dragRotate.isEnabled()
	获取地图旋转倾斜交互是否已启用。

- #### dragRotate.isActive()
	获取当前地图是否处于活动状态。
