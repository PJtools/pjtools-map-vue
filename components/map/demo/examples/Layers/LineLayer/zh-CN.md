## API

地图的矢量图层之`LineLayer`的叠加渲染主要以API接口的形式进行驱动实现，地图的矢量图层管理接口统一挂接在`iMapApi.Layers`二级对象下，示例代码如下：

```javascript
// 创建LineLayer Layer图层
const layer = iMapApi.Layers.addLineLayer('layer-id', {
	paint: {
		'line-color': 'rgba(250, 84, 28, 0.8)',
    'line-width': 4,
	}
}, {
	data: []
});
```

- #### iMapApi.Layers.addLineLayer(id, layerOptions?, options?)
	在地图Map中叠加渲染一个矢量线图层，且返回当前图层的实例对象。

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

`LineLayer`图层叠加渲染后，会返回一个`layer`变量图层实例对象，该实例对象挂载着对应图层的方法接口，具体说明如下：

- #### layer.getColor()
  获取矢量线的颜色。

- #### layer.setColor(color)
  设置矢量线的颜色。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| color | 待更新的矢量线颜色 | string |

- #### layer.getLineWidth()
  获取矢量线的宽度。

- #### layer.setLineWidth(width)
  设置矢量线的宽度。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| width | 待更新的矢量线宽度 | number |

- #### layer.remove()
  从地图Map中移除销毁图层。

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

- #### layer.getFilter()
  获取图层的所属Source数据源的过滤器条件。

- #### layer.setFilter(filter, options?)
  获取图层的所属Source数据源的过滤器条件。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| filter | 图层Source数据源的数据过滤条件 | array[] |
	| options | 选填项，设置Filter属性时的参数选项，具体参考`Mapbox GL`官方文档说明 | object | null |

- #### layer.setZoomRange(minzoom, maxzoom)
  设置图层的最小与最大层级区间渲染范围。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| minzoom | 图层渲染的最小层级 | number |
	| maxzoom | 图层渲染的最大层级 | number |

- #### layer.getFeatures()
  获取当前图层的数据Features要素集合。

- #### layer.setFeatures(features)
  设置当前图层的数据源的Features要素集合。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| features | 待设置的图层数据源的Features要素集合 | FeatureCollection |

- #### layer.getFeatureById(id)
  获取当前图层的指定Id的Feature要素对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 图层Source数据源的Feature要素Id | string |

- #### layer.getFeaturesByProperty(key, value)
  获取当前图层的指定Properties属性值匹配的Features要素集合。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| key | Feature要素的Properties属性的Key键名 | string |
	| value | 指定Properties属性的Value值 | string \| number \| boolean |

- #### layer.queryFeaturesByPoint(point, options?)
  根据屏幕坐标查询当前图层的Features要素集合。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| point | 屏幕坐标点或BBOX范围，格式参考：`[x, y]`或者`[[minx, miny], [maxx, maxy]]` | array[] |
	| options | 选填项，查询的参数条件，具体可参考`Mapbox GL`官网说明文档 | object | {} |

- #### layer.updateFeatureByProperties(feature, properties, merge?)
  更新当前图层指定的Feature要素的Properties属性。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| feature | 待更新的Feature要素对象 | Feature |
	| properties | Feature要素对象的待更新properties属性 | object |
	| merge | 是否采用合并模式，当为`True`时，则采用新旧值得合并覆盖规则 | boolean| false |

- #### layer.updateFeatureByGeometry(feature, coordinates)
  更新当前图层指定的Feature要素的Geometry属性空间坐标。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| feature | 待更新的Feature要素对象 | Feature |
	| coordinates | 待更新的空间坐标数据 | Coordinates |

- #### layer.removeFeature(feature)
  删除当前图层的指定Feature要素数据。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| feature | 待删除的Feature要素对象 | Feature |

- #### layer.removeFeatureById(id)
  删除当前图层指定Id的Feature要素数据。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 待删除Feature要素对象的Id名 | string |

- #### layer.removeFeatureByProperty(key, value)
  删除当前图层的指定属性值匹配的Features要素集合。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| key | 待匹配Feature要素的Properties属性Key名 | string |
	| value | 待匹配的Properties属性值 | string \| number \| boolean |

- #### layer.clearFeatures()
  清除当前图层的数据集合。

- #### layer.getFeatureState(id)
  获取指定Id的Feature要素的State对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | Feature要素的id名 | string |

- #### layer.setFeatureState(id, state)
  设置指定Id的Feature要素的State对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | Feature要素的id名 | string |
	| state | Feature要素的State对象 | object |

- #### layer.removeFeatureState(id?, key?)
  清空所有或删除指定Id的Feature要素的State对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 选填项，Feature要素的id名，如果为`null`值为指定具体的Feature要素Id，则移除所有Features要素 | string |
	| key | 选填项，State对象下的具体Key名，如果未指定具体的Key名，则删除整个State对象 | string |

- #### layer.getLayerBounds()
  获取当前图层的Feature要素集合的几何矩形范围。

- #### layer.setLayerToMaxZoom(options?)
  根据图层的数据Feature要素集合设置当前图层可缩放到最合适的层级。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| options | 选填项，`boundsTo`的动画选项，可参考MapboxGL API说明 | object |
