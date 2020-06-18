## API

地图全局`Cursor`光标Tip提示框交互对象统一挂接在`iMapApi.Handlers`二级对象下，可控制地图交互操作 `启用` | `禁用`，示例代码如下：

```javascript
// 获取地图光标Tip提示框交互对象
const cursor = iMapApi.Handlers.cursor;
```

在获取地图全局`Cursor`光标Tip提示框交互对象后，可以使用对象挂接的API接口：

- #### cursor.enable(options)
	启用地图光标Tip提示框交互。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| options | 地图光标Tip提示框的参数选项 | object | {} |

	`options`属性的选项如下：

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| cursor | 地图容器的cursor样式属性值，当设置`null`时，则还原默认光标样式 | string | null |
	| tip | 光标Tip提示框的参数选项，当设置`false`时，则无Tip提示框渲染 | false \| object | false |
	| offset | Tip提示框相对光标的偏移量，参考格式：`[0, 0]` | number[] | null |

	`tip`二级属性的选项如下：

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| className | 设置光标Tip提示框的容器Class类名 | string |
	| icon | 设置光标Tip提示框的Icon图标，可直接设置`Ant Design Vue`UI库的`Icon`组件的图标名，如不满足，则采用Vue模板插槽进行自定义 | string |
	| content | 设置光标Tip提示框的Content文本内容，如简单文本不满足，则采用Vue模板插槽进行自定义 | string |

	> **温馨提示**：如`tip.icon`和`tip.content`准备采用Vue模板插槽模式，插槽名称的前缀需是固定`mousetooltip.`名，在传入插槽名称时只需要前缀后面的名称即可。

	```html
	<template>
		<pj-map bordered config="../map.config.json">
			<template slot="mousetooltip.customIcon">
				<i>图标</i>
			</template>
			<template slot="mousetooltip.customContent">
				<span>文本内容</span>
			</template>
		</pj-map>
	</template>
	```

	```javascript
	{
		tip: {
			icon: 'customIcon',
			content: 'customContent'
		}
	}
	```

- #### cursor.disable()
	禁用地图光标Tip提示框交互。

- #### cursor.isEnabled()
	获取地图光标Tip提示框交互是否已启用。

- #### cursor.isActive()
	获取当前地图是否处于活动状态。

- #### cursor.setCursorVisible(visible)
	设置当前地图光标Tip提示框的显示/隐藏。在部分场景下，由于`MouseOver`、`MouseEnter`、`MouseOut`、`MouseLeave`等事件需要恢复光标时，可以通过该方法自主控制业务逻辑。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| visible | 是否显示/隐藏光标Tip提示框 | boolean | true |

- #### cursor.updateContent(content)
	更新当前光标Tip提示框的文本内容。（**注意**：当光标Tip提示框采用Vue模板插槽时，该方法无效。）

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| content | 待更新光标Tip提示框的文本内容 | string |

- #### cursor.updateIcon(icon)
	更新当前光标Tip提示框的Icon图标。（**注意**：当光标Tip提示框采用Vue模板插槽时，该方法无效。）

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| icon | 待更新光标Tip提示框的Icon图标 | string |
