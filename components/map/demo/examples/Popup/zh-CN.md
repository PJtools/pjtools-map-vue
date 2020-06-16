## API

通过设置内置Popup气泡弹窗的管理接口可对`mapbox-gl`原生Popup气泡弹窗进行管理及扩展，同时，支持Vue组件插槽模板对Popup内容进行替换。

`Popup`气泡弹窗的管理接口统一挂接在`iMapApi`实例接口对象下，相关接口如下：

- #### iMapApi.addPopup(id, coordinates, options?)

	创建一个Popup气泡弹窗实例并添加到地图Map中。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | Popup的全局唯一Id名称 | string |
	| coordinates | Popup的坐标点，参考格式：`[0, 0]` | number[] |
	| options | Popup的参数选项 | object | {} |

	options - 参数选项属性

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| slots | `Popup`气泡弹窗的渲染显示内容，指定`Popup`内容模板`Slot`插槽名，注意：设置Vue插槽名称时，必须以`popup.`前缀进行命名，设置该属性时，省略前缀，直接传后面的命名即可 | string | null |
	| data | 当`Popup`采用`Slot`插槽时，可设置该属性，作为插槽作用域的数据传参 | any | null |
	| className | 设置`Popup`组件容器对象的Class类名 | string | null |
	| style | 设置`Popup`组件容器对象的Style样式 | object | {} |
	| anchor | `Popup`相对坐标点的位置，具体枚举值参考`mapbox-gl`的Popup对象说明 | string | 'bottom' |
	| offset | 设置`Popup`相对坐标点的偏移量 | number[] | [0, 0] |
	| showSingle | 是否仅只渲染显示当前`Popup`气泡弹窗，当设置`True`时，会触发关闭其他`Popup`气泡弹窗，再打开最新实例的`Popup`气泡弹窗 | boolean | false |
	| defaultSkin | 是否渲染默认的`Popup`气泡面板皮肤，当设置`Flase`时，则会渲染成透明的背景面板，需要自定义背景色彩 | boolean | true |
	| maxWidth | 设置`Popup`的最大宽度，需要加上`px`像素单位 | string | null |
	| closeButton | 是否渲染`Popup`气泡弹窗的Close按钮 | boolean | true |
	| closeOnClick | 是否单击`Popup`气泡弹窗之外时触发移除关闭 | boolean | true |

- #### iMapApi.getPopup(id)

	根据唯一Id名称获取地图Popup实例对象。（注意：获取的Popup实例对象是原生Popup对象，可进行部分场景的属性方法获取与设置。）

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | Popup的全局唯一Id名称 | string |

	> **温馨提醒**：获取的实例`Popup`原生对象中，`popup.setDOMContent()`、`popup.setText()`、`popup.setHTML()`已经移除不支持，如有内容更新情况，根据Vue组件的开发模式进行内容更新。

	该方法将获取返回`Popup`原生对象，可绑定监听`Popup`气泡弹窗的打开和关闭自定义事件。

	| 事件名称 | 说明 |
	| --- | --- |
	| open | 当Popup气泡弹窗初始化渲染打开时触发 |
	| close | 当Popup气泡弹窗关闭移除时触发 |

	示例代码如下：

	```javascript
	const popup = iMapApi.getPopup(`[id]`);
	popup.on('close', function() {
		// Todo...
		// 自定义业务
	});
	```

- #### iMapApi.getAllPopups()

	获取所有的地图Popup实例对象。

- #### iMapApi.removePopup(id)

	删除指定Id的Popup实例对象。（**注意：删除Popup对象请统一用封装的方法，不要直接使用原生Popup对象进行移除，会造成异常问题。**）

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | Popup的全局唯一Id名称 | string |

- #### iMapApi.removeAllPopups()

	删除所有的Popup实例对象。
