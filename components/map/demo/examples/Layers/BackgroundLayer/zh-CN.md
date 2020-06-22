## API

地图的矢量图层之`BackgoundLayer`的叠加渲染主要以API接口的形式进行驱动实现，地图的矢量图层管理接口统一挂接在`iMapApi.Layers`二级对象下，示例代码如下：

```javascript
// 创建Backgound Layer图层
const layer = iMapApi.Layers.addBackgroundLayer('layer-id', {
	paint: {
		'background-color': '#1890ff',
		'background-opacity': 0.6,
	}
});
```

- #### iMapApi.Layers.addBackgroundLayer(id, layerOptions?, options?)
	在地图Map中叠加渲染一个背景色图层，且返回当前图层的实例对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 图层的唯一Id名 | string |
	| layerOptions | 选填项，原生`Mapbox GL`矢量图层的渲染参数[`paint` \| `layout` \| `filter`]等，具体可参考`Mapbox GL`官网说明文档 | object | {} |
	| options | 选填项，图层的扩展参数选项 | object | {} |

	**options** - 图层扩展参数选项

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| beforeId | 待添加到指定图层Id之前 | string | null |
	| layerGroupId | 所属图层组Id名称 | string | null |

`BackgoundLayer`图层叠加渲染后，会返回一个`layer`变量图层实例对象，该实例对象挂载着对应图层的方法接口，具体说明如下：

- #### layer.getPaint(key)
  获取图层的指定Paint属性名称的设定值。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| key | 图层Paint属性的Key名称 | string |

- #### layer.setPaint(key, value, options?)
  更新设置图层的Paint属性。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| key | 图层Paint属性的Key名称 | string |
	| value | 待更新设置的Paint属性的具体值 | any |
	| options | 选填项，设置Paint属性时的参数选项，具体参考`Mapbox GL`官方文档说明 | object | null |

- #### layer.getLayout(key)
  获取图层的指定Layout属性名称的设定值。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| key | 图层Layout属性的Key名称 | string |

- #### layer.setLayout(key, value, options?)
  更新设置图层的Paint属性。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| key | 图层Layout属性的Key名称 | string |
	| value | 待更新设置的Layout属性的具体值 | any |
	| options | 选填项，设置Layout属性时的参数选项，具体参考`Mapbox GL`官方文档说明 | object | null |

- #### layer.setZoomRange(minzoom, maxzoom)
  设置图层的最小与最大层级区间渲染范围。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| minzoom | 图层渲染的最小层级 | number |
	| maxzoom | 图层渲染的最大层级 | number |

- #### layer.getColor()
  获取图层设定的背景色。

- #### layer.setColor(color)
  设置图层的背景色。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| color | 待设置背景图层的背景色 | string |
