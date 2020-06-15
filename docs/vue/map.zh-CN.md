# iMapApi - 地图API文档

地图Map组件通过`loaded`事件回调可获取到`iMapApi`实例化对象，该对象是地图统一API接口对象，所有的地图交互都是通过该对象驱动进行的，因此，**`iMapApi`对象是地图组件在开发中最最最核心对象**。

示例代码如下：

```html
<template>
	<pj-map config="map-config.json" @loaded="handleMapLoaded">
	</pj-map>
</template>

<script>
  export default {
		data () {
			return {
				iMapApi: null,
			};
		},
		methods: {
			handleMapLoaded(iMapApi) {
				this.iMapApi = iMapApi;
			},
		}
	}
</script>
```

**注意事项：** 请使用以下接口方法来操作地图交互与数据更新，尽可能不要使用原生`map`实例对象的方法，否则会影响封装的功能或接口方法失效、报错。

### 属性

`iMapApi`挂载着以下属性，所有属性都是**只读**的，请勿试图进行赋值操作。

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| map | 原生MapboxGL实例化Map对象，警告：`iMapApi`下已实现的接口，请用封装的接口，直接操作Map对象，可能会导致`iMapApi`下的部分接口报错或失效。开放出来，主要是针对未封装实现的能力下去扩展使用。 | Map |
| options | 构建Map组件时传入的地图Options配置参数 | object |
| exports | 异步加载地图插件获取的输出对象，具体输出对象根据地图的配置清单而定，其中基础必须包括：`{ mapboxgl, GeoGlobe, turf }`。 | object |
| currentMapBaseType | 当前地图的底图类型，具体类型值根据地图底图的配置源而定。当底图切换时，该属性会同步自动更新。 | string |
| proxyURL | 地图的代理服务地址 | string |
| Services | 二级属性，GIS服务图层源对象| Class |
| Query | 二级属性，GIS服务查询对象 | Class |
| Handlers | 二级属性，地图内置唯一交互对象 | Class |
| Layers | 二级属性，地图（矢量、可视化）图层对象 | Class |
| Interfaces | 二级属性，地图驱动交互对象 | Class |

### 基础方法

- #### iMapApi.setMapBasicLayers(type)
  驱动更新地图Map的底图服务图层，主要作用于地图的底图切换场景。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| type | 底图服务源的类型键名，默认参考：`vec` \| `img` | string | 'vec' |

- #### iMapApi.getMapBasicLayers()
  获取当前地图Map的底图图层对象集合。

- #### iMapApi.getMapCanvas()
  获取实例化地图的Canvas对象。

- #### iMapApi.getMapCanvasConatainer()
  获取实例化地图的Canvas的父级对象。

- #### iMapApi.getMapContainer()
  获取实例化地图的MapboxGL的DOM对象。

- #### iMapApi.getMapViewContainer()
  获取实例化地图Map组件的视图容器对象（即MapboxGL DOM容器的父级对象）。

- #### iMapApi.getCenter()
  获取当前地图的地理中心点，输出格式：[0, 0]。

- #### iMapApi.setCenter(center)
  设置当前地图的中心点。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| center | 中心点坐标，格式：[x, y] | number[] |

- #### iMapApi.getZoom()
  获取当前地图的层级。

- #### iMapApi.setZoom(zoom)
  设置当前地图的层级。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| zoom | 地图层级，层级范围：`0 - 22` | number |

- #### iMapApi.zoomTo(zoom, duration?, options?)
  以过渡动画的形式，设置当前地图的层级。返回是`Promise`对象，可以使用`then`驱动动画完成捕获。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| zoom | 地图层级，层级范围：`0 - 22` | number |
	| duration | 过渡动画时间，单位：`毫秒` | number | 500 |
	| options | 动画的选项，可参考MapboxGL API说明 | object | {} |

- #### iMapApi.getMinZoom()
  获取当前地图的最小层级。

- #### iMapApi.setMinZoom(zoom)
  设置当前地图的最小层级。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| zoom | 地图层级，层级范围：`0 - 22` | number |

- #### iMapApi.getMaxZoom()
  获取当前地图的最大层级。

- #### iMapApi.setMaxZoom(zoom)
  设置当前地图的最大层级。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| zoom | 地图层级，层级范围：`0 - 22` | number |

- #### iMapApi.getRotate()
  获取当前地图的旋转角度值。

- #### iMapApi.setRotate(rotate)
  设置当前地图的旋转角度。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| rotate | 待旋转角度值 | number |

- #### iMapApi.rotateTo(rotate, duration?, options?)
  以过渡动画的形式，设置当前地图的旋转角度。返回是`Promise`对象，可以使用`then`驱动动画完成捕获。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| rotate | 待旋转角度值 | number |
	| duration | 过渡动画时间，单位：`毫秒` | number | 500 |
	| options | 动画的选项，可参考MapboxGL API说明 | object | {} |

- #### iMapApi.resetRotate()
  重置地图以正北方向的旋转角度。

- #### iMapApi.resetRotatePitch()
  重置地图以正北方向的旋转角度及倾斜。

- #### iMapApi.getPitch()
  获取当前地图的倾斜值。

- #### iMapApi.setPitch(pitch)
  设置当前地图的倾斜值。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| pitch | 待设置倾斜值，层级范围：`0 - 60` | number |

- #### iMapApi.pitchTo(pitch, duration?, options?)
  以过渡动画的形式，设置当前地图的倾斜值。返回是`Promise`对象，可以使用`then`驱动动画完成捕获。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| pitch | 待设置倾斜值，层级范围：`0 - 60` | number |
	| duration | 过渡动画时间，单位：`毫秒` | number | 500 |
	| options | 动画的选项，可参考MapboxGL API说明 | object | {} |

- #### iMapApi.getMinPitch()
  获取当前地图的最小倾斜值。

- #### iMapApi.setMinPitch(pitch)
  设置当前地图的最小倾斜值。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| pitch | 地图最小倾斜值，层级范围：`0 - 60` | number |

- #### iMapApi.getMaxPitch()
  获取当前地图的最大倾斜值。

- #### iMapApi.setMaxPitch(pitch)
  设置当前地图的最大倾斜值。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| pitch | 地图最大倾斜值，层级范围：`0 - 60` | number |

- #### iMapApi.panTo(xy, duration?, options?)
  以过渡动画的形式，将地图移动到指定的地理坐标位置。返回是`Promise`对象，可以使用`then`驱动动画完成捕获。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| xy | 待移动的坐标，格式：`[x, y]` | number[] |
	| duration | 过渡动画时间，单位：`毫秒` | number | 500 |
	| options | 动画的选项，可参考MapboxGL API说明 | object | {} |

- #### iMapApi.getBounds()
  获取当前地图的地理矩形范围。

- #### iMapApi.setBounds(bounds, options?)
  将地图缩放到指定的地理范围。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| bounds | 待设定的地理范围，格式：`[[minx, miny], [maxx, maxy]]` | number[][] |
	| options | 缩放范围的选项，可参考MapboxGL API说明 | object | {} |

- #### iMapApi.boundsTo(bounds, duration?, options?)
  以过渡动画的形式，将地图缩放到指定的地理范围。返回是`Promise`对象，可以使用`then`驱动动画完成捕获。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| bounds | 待设定的地理范围，格式：`[[minx, miny], [maxx, maxy]]` | number[][] |
	| duration | 过渡动画时间，单位：`毫秒` | number | 500 |
	| options | 动画的选项，可参考MapboxGL API说明 | object | {} |

- #### iMapApi.getMaxBounds()
  获取当前地图的最大地理矩形范围。

- #### iMapApi.setMaxBounds(bounds)
  设置当前地图的最大地理矩形范围。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| bounds | 待设定的最大地理范围，格式：`[[minx, miny], [maxx, maxy]]` | number[][] |

- #### iMapApi.easeTo(options, duration?)
  以过渡动画的形式，统一管理设置当前地图的中心点、旋转角度、倾斜值、层级。返回是`Promise`对象，可以使用`then`驱动动画完成捕获。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| options | 地图待设置对象，参数属性： `{ center: number[], rotate: number, pitch: number, zoom: number }` | object | {} |
	| duration | 过渡动画时间，单位：`毫秒` | number | 500 |

- #### iMapApi.flyTo(options)
  执行地图飞行动画。返回是`Promise`对象，可以使用`then`驱动动画完成捕获。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| options | 飞行动画的参数选项，可参考MapboxGL API说明 | object | {} |

- #### iMapApi.resize()
  重新渲染地图的容器尺寸大小。

- #### iMapApi.project(lnglat)
  将地理坐标转换成屏幕坐标。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| lnglat | 待转换的地理坐标 | LngLat |

- #### iMapApi.unproject(point)
  将屏幕坐标转换成地理坐标。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| point | 待转换的屏幕坐标 | Point |

- #### iMapApi.toWGS84(coordinate)
  将非标准投影的坐标数据转化成WGS84坐标数据。（注意：只有设定`PROJ4.JS`投影参数时，才能驱动转化，否则无效）

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| coordinate | 待转换的坐标 | LngLat |

- #### iMapApi.fromWGS84(coordinate)
  将标准WGS84坐标数据反转化成当前地图投影的坐标数据。（注意：只有设定`PROJ4.JS`投影参数时，才能驱动转化，否则无效）

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| coordinate | 待转换的坐标 | LngLat |

- #### iMapApi.getMapQueryServiceByKey(key)
  根据全局唯一标识Key获取地图配置中查询分析服务源对象。（注意：一般情况下，查询接口已内置解析，无需额外使用，除非需要获取相关源数据信息）

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| key | 查询服务源的全局唯一标识Key名 | string |

### Resource资源相关方法

- #### iMapApi.loadSprite(sprite)
  更新设置地图Map的Sprite样式属性。（注意：主要针对矢量瓦片的样式更新，一般情况无需使用）

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| sprite | 地图Sprite属性的链接地址 | string |

- #### iMapApi.loadGlyphs(glyphs)
  更新设置地图Map的Glyphs样式属性。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| glyphs | 地图Glyphs属性的链接地址 | string |

- #### iMapApi.getAllImageIds()
  获取地图加载的所有Image图片资源的Id集合。

- #### iMapApi.hasImage(id)
  判断指定Id的图片资源是否已经加载。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 图片的唯一Id名称 | string |

- #### iMapApi.getMapImages()
  获取地图加载的所有Image图片资源对象。

- #### iMapApi.getMapImage(id)
  获取指定Id的Image图片资源对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 图片的唯一Id名称 | string |

- #### iMapApi.loadImage(id, url)
  加载Image图片资源到地图Map样式库。（注意：异步方法，返回为`Promise`对象）

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 图片的唯一Id名称 | string |
	| url | 图片的Url链接地址 | string |

- #### iMapApi.loadImages(list)
  批量加载Image图片资源到地图Map样式库。（注意：异步方法，返回为`Promise`对象）

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| list | 图片资源列表，图片项的属性：{ id: string, url: string } | object[] |

- #### iMapApi.removeImage(id)
  删除指定Id的Image图片资源。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 图片的唯一Id名称 | string |

- #### iMapApi.clearImages()
  清空所有已加载的Image图片资源。

### Event事件相关方法

- #### iMapApi.on(id, type, listener, layerId?, layerGroupId?)
  绑定地图Map或矢量图层的交互事件。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 标识事件的唯一Id名称 | string |
	| type | 地图事件的类型名 | string |
	| listener | 待绑定事件的函数 | function |
	| layerId | 选填项，当指定图层Id时，则表示事件绑定到图层上。（注意：只有原生`Mapbox GL`图层可绑定。） | string | null |
	| layerGroupId | 选填项，图层组的Id名称，当指定时，则会在图层组中找寻图层，而非全局图层中查找指定Id的图层 | string | null |

- #### iMapApi.once(type, listener, layerId?, layerGroupId?)
  绑定仅只执行触发一次的地图Map或矢量图层交互事件。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| type | 地图事件的类型名 | string |
	| listener | 待绑定事件的函数 | function |
	| layerId | 选填项，当指定图层Id时，则表示事件绑定到图层上。（注意：只有原生`Mapbox GL`图层可绑定。） | string | null |
	| layerGroupId | 选填项，图层组的Id名称，当指定时，则会在图层组中找寻图层，而非全局图层中查找指定Id的图层 | string | null |

- #### iMapApi.off(id)
  移除指定Id的地图Map或矢量图层的绑定事件。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 标识事件的唯一Id名称 | string |

### Source数据源相关方法

- #### iMapApi.getSource(id)
  获取指定Id名称的图层数据源。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 数据源Id名称 | string |

- #### iMapApi.getSources()
  获取所有的图层数据源对象。

- #### iMapApi.getSourceToLayerIds(id)
  获取指定Id名称的数据源所属图层Id集合。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 数据源Id名称 | string |

- #### iMapApi.getSourceData(id)
  获取指定Id名称的图层数据源的数据对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 数据源Id名称 | string |

- #### iMapApi.addSource(id, source)
  添加图层数据源到地图Map中。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 数据源Id名称 | string |
	| source | 数据源对象，具体属性请参考`Mapbox GL`官网API说明文档 | object |

- #### iMapApi.removeSource(id)
  删除指定Id的图层数据源。（注意：当如删除的数据源还有其他图层在使用时，则删除无效。）

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 数据源Id名称 | string |

### Layer图层相关方法

- #### iMapApi.getLayer(id, layerGroupId?)
  获取指定Id的图层对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 图层Id名称 | string |
	| layerGroupId | 选填项，所属图层组Id名称，（如：图层挂载到图层组中时，请明确图层组Id，来精准查询）| string | null |

- #### iMapApi.addLayer(layer, beforeId?)
  添加MapboxGL Layer图层对象到地图Map中。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| layer | 待添加的MapboxGL的Layer图层对象，具体图层属性请参考`Mapbox GL`官网说明文档 | object |
	| beforeId | 选填项，待添加到指定图层Id之前 | string | null |

- #### iMapApi.addLayers(layers, beforeId?)
  批量添加MapboxGL Layer图层集合到地图Map中。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| layers | 待添加的MapboxGL的Layer图层对象数组集合 | object[] |
	| beforeId | 选填项，待添加到指定图层Id之前 | string | null |

- #### iMapApi.removeLayer(id)
  删除指定Id名称的图层（组）对象。(注意：删除图层时，同时会级联删除图层数据源、图层绑定的事件等)

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 图层Id名称或图层组Id名，当指定为图层组Id时，则删除图层组下所有的图层对象 | string |

- #### iMapApi.removeLayers(layersId)
  批量删除指定Id数组集合的图层对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| layersId | 待删除的图层Id数组集合 | string[] |

- #### iMapApi.moveLayer(id, beforeId?)
  移动指定Id的图层(组)内到的beforeId图层(组)之前。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 图层(组)的Id名称 | string |
	| beforeId | 选填项，待移动到指定图层Id之前，如不指定，则移动到最后 | string | null |

- #### iMapApi.moveUpLayer(id)
  指定Id的图层(组)向上移动一层。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 图层(组)的Id名称 | string |

- #### iMapApi.moveDownLayer(id)
  指定Id的图层(组)向下移动一层。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 图层(组)的Id名称 | string |

- #### iMapApi.getNextLayerId(id)
  获取指定Id的图层(组)的下一个图层对象Id名称。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 图层(组)的Id名称 | string |

- #### iMapApi.setLayerVisibility(id, visible, layerGroupId?)
  设置指定Id的图层(组)的显示/隐藏的状态。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 图层(组)的Id名称 | string |
	| visible | 图层显隐状态 | boolean | true |
	| layerGroupId | 选填项，所属图层组Id名称 | string | null |

- #### iMapApi.setRasterLayerOpacity(id, opacity, layerGroupId?)
  设置指定Id的栅格类型图层(组)的透明度。（注意：只能设置图层类型为`raster`的图层对象，其他类型图层无效）

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 图层(组)的Id名称 | string |
	| opacity | 图层的不透明度，范围：`0 - 1` | number | 1 |
	| layerGroupId | 选填项，所属图层组Id名称 | string | null |

- #### iMapApi.setLayerZoomRange(id, minzoom, maxzoom, layerGroupId?)
  设置指定Id图层(组)的最小与最大层级的区间渲染范围。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 图层(组)的Id名称 | string |
	| minzoom | 图层最小层级 | number | 0 |
	| maxzoom | 图层最大层级 | number | 24 |
	| layerGroupId | 选填项，所属图层组Id名称 | string | null |

- #### iMapApi.queryRenderedFeatures(id, point, options?, layerGroupId?)
  根据屏幕坐标查询图层的Feature要素。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 图层(组)的Id名称 | string |
	| point | 查询的几何屏幕坐标，可为单点或BBox范围，参考格式：`[x, y]` \| `[[minx, miny], [maxx, maxy]]` | number[] |
	| options | 查询的参数条件，具体可参考`Mapbox GL`官网说明文档 | object | {} |
	| layerGroupId | 选填项，所属图层组Id名称 | string | null |

### LayerGroup图层组相关方法

- #### iMapApi.isLayerGroup(layerGroupId)
  判断指定的图层(组)Id名称是否为图层组。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| layerGroupId | 图层组的Id名称 | string |

- #### iMapApi.getLayerGroupByIds(layerGroupId)
  获取指定图层组对象的图层Id集合。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| layerGroupId | 图层组的Id名称 | string |

- #### iMapApi.addLayerToGroup(layerGroupId, layer, beforeId?)
  将MapboxGL Layer图层集合添加到指定的图层组对象，并追加到地图Map中。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| layerGroupId | 图层组的Id名称 | string |
	| layer | 待添加的MapboxGL的Layer图层对象，具体图层属性请参考`Mapbox GL`官网说明文档 | object |
	| beforeId | 选填项，待添加到指定图层Id之前 | string | null |

- #### iMapApi.addLayersToGroup(layerGroupId, layers, beforeId?)
  将MapboxGL Layer图层数组集合对象批量添加到指定的图层组对象，并追加到地图Map中。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| layerGroupId | 图层组的Id名称 | string |
	| layers | 待添加的MapboxGL的Layer图层对象数组集合 | object[] |
	| beforeId | 选填项，待添加到指定图层Id之前 | string | null |

- #### iMapApi.removeLayerToGroup(layerGroupId, layerId)
  移除图层组内指定Id的图层对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| layerGroupId | 图层组的Id名称 | string |
	| layerId | 图层Id名称 | string |


- #### iMapApi.removeLayersToGroup(layerGroupId, layersId)
  批量删除图层组内指定Id数组集合的图层对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| layerGroupId | 图层组的Id名称 | string |
	| layersId | 图层Id数组集合 | string[] |

- #### iMapApi.getGroupFirstLayer(layerGroupId)
  获取指定Id的图层组的第一个图层对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| layerGroupId | 图层组的Id名称 | string |

- #### iMapApi.getGroupLastLayer(layerGroupId)
  获取指定Id的图层组的最后一个图层对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| layerGroupId | 图层组的Id名称 | string |

- #### iMapApi.moveLayerToGroup(layerGroupId, layerId, beforeId?)
  在图层组内移动指定Id的图层到指定beforeId图层之前。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| layerGroupId | 图层组的Id名称 | string |
	| layerId | 图层Id名称 | string |
	| beforeId | 选填项，待移动到指定图层组内的图层Id之前，如不指定，则移动到图层组内的最后 | string | null |

- #### iMapApi.moveUpLayerToGroup(layerGroupId, layerId)
  在图层组内向上移动一层指定Id的图层。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| layerGroupId | 图层组的Id名称 | string |
	| layerId | 图层Id名称 | string |

- #### iMapApi.moveDownLayerToGroup(layerGroupId, layerId)
  在图层组内向下移动一层指定Id的图层。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| layerGroupId | 图层组的Id名称 | string |
	| layerId | 图层Id名称 | string |

### Feature要素相关方法

- #### iMapApi.getFeatureCollection(features)
  将数组Feture要素数组集合转换成标准的FeatureCollection要素集合GeoJSON对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| features | 待转换的Feature要素数组集合 | Feature \| Feature[] | [] |

- #### iMapApi.getFeaturesToBounds(features)
  获取Feature要素（集合）的几何矩形范围。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| features | Feature要素数组集合 | Feature \| Feature[] | [] |

- #### iMapApi.boundsToFeatures(features, options?)
  根据Feature要素（集合）缩放到合适层级。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| features | Feature要素数组集合 | Feature \| Feature[] | [] |
	| options | 选填项，缩放动画的参数选项，具体参考`iMapApi.boundsTo`接口方法的动画参数 | object | {} |

- #### iMapApi.getFeaturesToCenter(features)
  获取Feature要素（集合）的绝对中心点。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| features | Feature要素数组集合 | Feature \| Feature[] | [] |

- #### iMapApi.getFeaturesToCentroid(features)
  获取Feature要素（集合）的质心点。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| features | Feature要素数组集合 | Feature \| Feature[] | [] |

- #### iMapApi.createPointFeature(id, coordinates, properties?)
  生成一个Point Feature要素的GeoJSON对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | Feature要素的唯一Id名 | string |
	| coordinates | Point的坐标点，参考格式：`[x, y]` | number[] |
	| properties | 选填项，Feature要素的Properties属性对象 | object | {} |

- #### iMapApi.createMultiPointFeature(id, coordinates, properties?)
  生成一个MultiPoint Feature要素的GeoJSON对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | Feature要素的唯一Id名 | string |
	| coordinates | MultiPoint的坐标点，参考格式：`[[x, y], [x, y], ...]` | number[] |
	| properties | 选填项，Feature要素的Properties属性对象 | object | {} |

- #### iMapApi.createLineFeature(id, coordinates, properties?)
  生成一个LineString Feature要素的GeoJSON对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | Feature要素的唯一Id名 | string |
	| coordinates | LineString的坐标 | number[] |
	| properties | 选填项，Feature要素的Properties属性对象 | object | {} |

- #### iMapApi.createMultiLineFeature(id, coordinates, properties?)
  生成一个MultiLineString Feature要素的GeoJSON对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | Feature要素的唯一Id名 | string |
	| coordinates | MultiLineString的坐标 | number[] |
	| properties | 选填项，Feature要素的Properties属性对象 | object | {} |

- #### iMapApi.createPolygonFeature(id, coordinates, properties?)
  生成一个Polygon Feature要素的GeoJSON对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | Feature要素的唯一Id名 | string |
	| coordinates | Polygon的坐标 | number[] |
	| properties | 选填项，Feature要素的Properties属性对象 | object | {} |

- #### iMapApi.createMultiPolygonFeature(id, coordinates, properties?)
  生成一个MultiPolygon Feature要素的GeoJSON对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | Feature要素的唯一Id名 | string |
	| coordinates | MultiPolygon的坐标 | number[] |
	| properties | 选填项，Feature要素的Properties属性对象 | object | {} |

- #### iMapApi.createCircleFeature(id, center, radius, properties?, options?)
  生成圆形Circle Feature要素对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | Feature要素的唯一Id名 | string |
	| center | 圆心的中心点坐标 | number[] |
	| radius | 圆形的半径，单位：km | number | 0.5 |
	| properties | 选填项，Feature要素的Properties属性对象 | object | {} |
	| options | 选填项，圆形参数选项，参数属性：`{ steps: 99 }`，steps：生成圆形的点个数（不包括最后的闭合点），默认值：99 | object | { steps: 99 } |

- #### iMapApi.createRectangleFeature(id, point, length, width, properties?)
  生成矩形Rectangle Feature要素对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | Feature要素的唯一Id名 | string |
	| point | 矩形的起始点，即为左上角的点 | number[] |
	| length | 矩形的长度，单位：km | number |
	| width | 矩形的宽度，单位：km | number |
	| properties | 选填项，Feature要素的Properties属性对象 | object | {} |
