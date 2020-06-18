## API

地图全局`Keyboard`键盘快捷键交互对象统一挂接在`iMapApi.Handlers`二级对象下，可控制地图交互操作 `启用` | `禁用`，示例代码如下：

```javascript
// 获取地图键盘快捷键交互对象
const keyboard = iMapApi.Handlers.keyboard;
```

> **操作说明**：
> - +/= ：层级放大1级
> - -/— ：层级缩小1级
> - Shift + ：层级放大2级
> - Shift - ：层级缩小2级
> - 方向键上下左右：地图上下左右平移 100px 像素距离
> - Shift ↑ ：地图增加倾斜15度
> - Shift ↓ ：地图减少倾斜15度
> - Shift ← ：地图顺时针旋转10度
> - Shift → ：地图逆时针旋转10度

在获取地图全局`Keyboard`键盘快捷键交互对象后，可以使用对象挂接的API接口：

- #### keyboard.enable()
	启用地图键盘快捷键交互。

- #### keyboard.disable()
	禁用地图键盘快捷键交互。

- #### keyboard.isEnabled()
	获取地图键盘快捷键交互是否已启用。
