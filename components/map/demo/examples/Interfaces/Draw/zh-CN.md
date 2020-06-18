## API

地图`Draw`绘图功能主要以API接口的形式进行驱动实现，`Draw`绘图的管理接口统一挂接在`iMapApi.Interfaces`二级对象下，示例代码如下：

```javascript
// 获取地图Draw绘图实例对象
const instance = iMapApi.Interfaces.draw();
```

通过`iMapApi.Interfaces.draw()`方法接口可以获取一个**新的**地图`Draw`绘图实例对象，因此，在同一个应用场景下，不要多次调用获取实例对象，然而它们每次都是不同的。

- #### iMapApi.Interfaces.draw(options?)

	获取一个新的实例化地图绘制矢量图形对象。

	**options** - 地图绘图实例时的初始参数选项

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| theme | 绘图的图形主题样式，一般情况下，可以不更改主题 | object | {} |
	| data | 默认初始的Feature要素数据集合 （注意：请尽量在熟悉各种绘制模式的数据属性后再使用初始构建要素数据） | FeatureCollection | [] |
	| clickBuffer | 单击时查询缓冲范围，在选取、编辑模式下，鼠标会单击时响应查询绘制的要素、节点等，会将地理坐标转换成屏幕坐标，再根据缓冲范围转成矩形范围去查询 | number | 2 |
	| touchBuffer | 移动设备的触摸轻敲时查询缓冲范围 | number | 25 |

	**options.theme** - 绘图时渲染的颜色样式属性

	> 绘图交互对象下，各种绘图模式中的图层渲染数据样式，主要分为`静态`、`活动`、`非活动`三大类，因此，和默认的`Mapbox GL`官方矢量图层样式属性是不同的，具体样式属性如下：

	```javascript
	{
		// 以下为：默认样式设定
		theme: {
			// 静态状态（默认：蓝色主题色）
			static: {
				// 点
				'point-color': 'rgba(186, 231, 255, 0.7)',
				'point-radius': 5,
				'point-outline-color': 'rgba(23, 144, 255, 0.9)',
				'point-outline-width': 1.5,
				// 线
				'line-color': 'rgba(23, 144, 255, 0.9)',
				'line-width': 2.5,
				// 多边形面
				'polygon-color': 'rgba(23, 144, 255, 0.4)',
				'polygon-outline-color': 'rgba(23, 144, 255, 0.9)',
				'polygon-outline-width': 2.5,
			},
			// 不活动状态（默认：绿色主题色）
			inactive: {
				// 点
				'point-color': 'rgba(181, 245, 236, 0.7)',
				'point-radius': 5,
				'point-outline-color': 'rgba(20, 194, 194, 0.9)',
				'point-outline-width': 2,
				// 线
				'line-color': 'rgba(20, 194, 194, 0.9)',
				'line-width': 3,
				// 多边形面
				'polygon-color': 'rgba(20, 194, 194, 0.4)',
				'polygon-outline-color': 'rgba(20, 194, 194, 0.9)',
				'polygon-outline-width': 3,
			},
			// 活动状态（默认：橙色主题色）
			active: {
				// 点
				'point-color': 'rgba(255, 216, 191, 0.7)',
				'point-radius': 6,
				'point-outline-color': 'rgba(250, 84, 28, 0.9)',
				'point-outline-width': 2,
				// 线
				'line-color': 'rgba(250, 84, 28, 0.9)',
				'line-width': 3,
				// 多边形面
				'polygon-color': 'rgba(250, 84, 28, 0.2)',
				'polygon-outline-color': 'rgba(250, 84, 28, 0.9)',
				'polygon-outline-width': 3,
				// 绘制时临时线
				'moveline-color': 'rgba(250, 84, 28, 0.6)',
				'moveline-dasharray': [0.8, 2],
				// 绘制时图形节点
				'vertex-color': 'rgba(255, 216, 191, 0.9)',
				'vertex-radius': 4,
				'vertex-outline-color': 'rgba(250, 84, 28, 0.9)',
				'vertex-outline-width': 1.5,
				// 编辑时选中的节点
				'vertex-selected-color': 'rgba(255, 216, 191, 0.9)',
				'vertex-selected-radius': 5,
				'vertex-selected-outline-color': 'rgba(250, 84, 28, 0.9)',
				'vertex-selected-outline-width': 2,
				// 编辑时节点之间的中心点
				'midpoint-color': 'rgba(250, 122, 69, 0.9)',
				'midpoint-radius': 3.5,
				'midpoint-outline-color': 'rgba(255, 216, 191, 0.8)',
				'midpoint-outline-width': 1,
			},
		}
	}
	```

在获取地图`Draw`绘图实例`instance`变量对象后，可以使用实例对象挂接的API接口：

- #### instance.enable(mode, options?)

	激活指定地图绘制图形模式。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| mode | 地图绘图模式，可选参数：`static` \| `point` \| `line` \| `polygon` \| `rectangle` \| `circle` \| `ellipse` \| `select` \| `edit` | string | 'static' |
	| options | 可选项，指定绘图模式的属性参数 | object | {} |

	具体各个绘图模式的`options`属性参数选项如下：

	- **static** - 静态模式（默认）

	- **point** - Point绘制点模式
  
	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| cursor | 绘制图形时光标Tooltip提示 | object | {} |

	`cursor`属性参数如下：

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| cursor | 光标的样式Style值 | string | 'default' |
	| icon | 光标Tooltip提示框的Icon图标，具体使用可参考`iMapApi.Handler.cursor`对象 | string | 'highlight' |
	| content | 光标Tooltip提示框的Content文本，具体使用可参考`iMapApi.Handler.cursor`对象 | string | '单击确定点位，ESC键取消' |

	- **line** - Line绘制线模式
  
	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| cursor | 绘制图形时光标Tooltip提示 | object | {} |

	`cursor`属性参数如下：

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| cursor | 光标的样式Style值 | string | 'default' |
	| icon | 光标Tooltip提示框的Icon图标，具体使用可参考`iMapApi.Handler.cursor`对象 | string | 'highlight' |
	| content | 光标Tooltip提示框的Content文本，具体使用可参考`iMapApi.Handler.cursor`对象 | string | '单击确定起点，ESC键取消' |
	| clicked | 当单击起始点后，光标Tooltip提示框Content更新的文本 | string | '单击绘制节点，双击结束' |

	- **polygon** - Polygon绘制多边形面模式
  
		> `polygon`模式的`options`属性设置与`line`模式一致。

	- **rectangle** - Rectangle绘制矩形模式
  
	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| cursor | 绘制图形时光标Tooltip提示 | object | {} |
	| square | 是否启用绘制`正方形`模式限制 | boolean | false |
	| length | 是否设置绘制矩形的固定长度，单位：`km` | number | null |
	| width | 是否设置绘制矩形的固定宽度，单位：`km` （注意：当开启正方形设置时，该宽度属性无效。） | number | null |

	`cursor`属性参数如下：

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| cursor | 光标的样式Style值 | string | 'default' |
	| icon | 光标Tooltip提示框的Icon图标，具体使用可参考`iMapApi.Handler.cursor`对象 | string | 'highlight' |
	| content | 光标Tooltip提示框的Content文本，具体使用可参考`iMapApi.Handler.cursor`对象 | string | '单击确定起点，ESC键取消' |
	| clicked | 当单击起始点后，光标Tooltip提示框Content更新的文本 | string | '再次单击，绘制结束' |

	- **circle** - Circle绘制圆形模式
  
	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| cursor | 绘制图形时光标Tooltip提示，设置与`rectangle`模式一致 | object | {} |
	| radius | 是否设置绘制圆的固定半径，单位：`km` | number | null |

	- **ellipse** - Ellipse绘制椭圆形模式
  
	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| cursor | 绘制图形时光标Tooltip提示，设置与`rectangle`模式一致 | object | {} |
	| radius | 是否设置绘制椭圆的固定长轴半径，单位：`km` | number | null |
	| eccentricity | 椭圆的偏心率，范围值：`0 - 1`，椭圆偏心率决定短轴的长度，值越小，短轴越长，反之，短轴越短 | number | 0.8 |

	- **select** - Select图形选取模式
  
	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| featureIds | 激活模式时默认初始选中要素的Id | string | null |
	| trash | 是否允许当前模式下进行删除操作 | boolean | true |
	| select | 是否允许当前模式下进行选取操作 | boolean | true | 
	| edit | 是否允许当选中要素后，再次单击自动进入`edit`编辑模式 | boolean | true |

	- **edit** - Edit图形编辑模式
  
	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| featureIds | 激活模式时默认初始选中要素的Id | string | null |

- #### instance.disable()

	取消当前激活的地图绘图模式，切换到默认的`静态`模式。

- #### instance.isEnabled()

	获取绘图交互实例是否激活当前绘图模式。

- #### instance.isActive()

	获取绘图交互实例是否在绘制、编辑等活动状态下。

- #### instance.destroy()

	销毁地图绘图，同时删除绘图图层、数据等。

- #### instance.getMode()

	获取当前激活绘图模式的名称。

- #### instance.changeMode(mode, options?)

	切换当前绘图模式。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| mode | 待切换的绘图模式名称 | string |
	| options | 可选项，待切换模式的参数选项 | object | {} |

- #### instance.setModeCursor(cursor)

	设置当前绘图模式的光标Tooltip提示框。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| cursor | 设置当前模式的光标Tooltip提示 （注意：尽量不要再MouseMove事件监听中使用该方法，否则会造成绘制时出现卡顿等性能流畅性） | object |

- #### instance.trash()

	对当前绘图模式中活动状态或选中状态的要素进行删除操作。

- #### instance.combineFeatures()

	在`edit`编辑模式下，对选中的同类型要素进行合并操作，将单要素转换成Multi复合要素。

- #### instance.uncombineFeatures()

	在`edit`编辑模式下，对选中的Multi复合要素拆分为单类型要素。

- #### instance.getFeatureIdsAt(point)

	根据屏幕坐标点或BBOX范围查询绘图的Feature要素的Id集合。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| point | 待查询的屏幕坐标点位，格式参考：`[x, y]`或`[[minx, miny], [maxx, maxy]]` | Point |

- #### instance.getFeature(id)

	根据要素Id获取Feature要素对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 绘图中Feature要素的唯一Id名 | string |

- #### instance.getAllFeatures()

	获取所有绘制的Feature要素集合。

- #### instance.getSelectedIds()

	获取非绘制图形模式下选中Feature要素的Id集合。

- #### instance.getSelected()

	获取非绘制图形模式下选中Feature要素对象。

- #### instance.getSelectedVertexs()

	获取编辑模式下选中Vertex节点要素。

- #### instance.setFeatureProperty(id, key, value)

	设置指定Id的Feature要素的Properties属性。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 绘图中Feature要素的唯一Id名 | string |
	| key | 要素的properties属性的键名 | string |
	| value | 指定要素的properties属性键名下的Value值 | string \| number \| boolean |

- #### instance.add(featureCollection)

	将自定义的Feature要素集合对象追加到绘图的图层中。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| featureCollection | 待追加的Feature要素集合 | FeatureCollection |

- #### instance.set(featureCollection)

	将自定义的Feature要素集合覆盖绘制的图层要素。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| featureCollection | 待追加的Feature要素集合 | FeatureCollection |

- #### instance.delete(featureIds)

	删除指定Id的Feature要素。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| featureIds | 待删除的绘制要素Id集合 | string[] |

- #### instance.deleteAll()

	清空所有绘制的Feature要素。

	### 事件监听

	> 地图`Draw`绘图实例对象可通过`instance.on(name, listener)`、`instance.off(name, listener)`事件监听。

	| 事件名称 | 说明 |
	| --- | --- |
	| draw.modechange | 当绘图模式发生变化时触发 |
	| draw.selectionchange | 当选中、取消选中Feature要素时触发 |
	| draw.actionable | 当绘图模式下，`trash`、`combineFeatures`、`uncombineFeatures`三个操作切换更新时触发 |
	| draw.render | 当绘图的要素数据进行重新渲染时触发 |
	| draw.delete | 当绘制要素删除时触发 |
	| draw.update | 当选中要素发生拖拽移动、节点数据更新时触发 |
	| draw.combine | 编辑模式下，当进行合并要素操作时触发 |
	| draw.uncombine | 编辑模式下，当进行拆分复合要素时触发 |
	| draw.drag | 编辑模式下，当拖拽选中要素移动时触发 |
	| draw.click | 绘制图形模式下，当单击节点时触发 |
	| draw.complete | 绘制图形模式下，当图形绘制完成时触发 |
	| draw.cancel | 绘制图形模式下，当图形无效或手动取消时触发 |

	示例代码如下：

	```javascript
	const instance = iMapApi.Interfaces.draw();
	instance.on('draw.complete', function({ mode, feature }) {
		// Todo...
		// 自定义业务
	});
	```

	### 键盘快捷键

	在绘图模式下内部封装键盘的快捷键的操作响应，具体说明如下：

	| 快捷键 | 说明 |
	| --- | --- |
	| Esc | 绘制图形模式下，取消当前绘制数据 |
	| Enter | 绘制图形模式下，直接完成当前绘制数据 |
	| Delete | 对选中和当前活动状态下的要素进行删除 |
	| Shift + Click | 在编辑模式下，同类型Feature要素进行多个选中 |
