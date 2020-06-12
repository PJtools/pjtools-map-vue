## API

### Map

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| bordered | 定义地图容器是否加载边框样式 | boolean | false |
| width | 地图容器的宽度 | string \| number | '100%' |
| height | 地图容器的高度 | string \| number | '100%' |
| baseUrl | 地图资源库的基础前缀路径（建议：拷贝到不被编译的`static`文件夹下面） | string | '/static/GeoMap/' |
| config | 地图初始化时读取的配置文件路径或配置对象 | string \| object |
| imageIcons | 地图初始预加载的图标资源列表，集合项属性：{ id: string, url: string } | object[] | [] |
| plugins | 地图初始化时除默认地图插件外，额外预加载的插件 | object | {} |

### Slots
| 插槽名称 | 说明 |
| --- | --- |
| preloading | 覆盖地图默认的PreLoading预加载动画组件 |

### 事件

地图Map组件的事件回调会接收`iMapApi`地图实例化对象，地图的一切交互能力实现，都是以`iMapApi`对象下的API接口方法进行驱动。[查看API接口说明。](/docs/vue/imapapi-cn/)

| 事件名称 | 说明 | 回调参数 |
| --- | --- | --- |
| render | 地图容器结构及样式数据渲染完毕时触发 | Function(iMapApi) |
| loaded | 地图所有资源、图层源数据渲染完毕时触发 | Function(iMapApi) |

#### 地图资源库说明

地图资源库主要存放Mapbox GL样式字体、插件库等地图开发需引入的资源，文件夹通常默认以`GeoMap`命名，该资源库文件夹是开发中`必须存在`的。
结构如下：
```shell
├─ GeoMap             # 地图资源库
│  ├─ glyphs          # Mapbox GL地图PBF字体
│  ├─ libs            # 地图插件库
│  ├─ manifest.json   # 地图预加载插件清单配置
```
地图初始化时根据`baseUrl`属性设定的资源库路径加载相关资源，会自动查找文件夹下的`manifest.json`（注意：不能随意修改命名与后缀）清单配置，读取配置中需默认预加载的`css`与`js`插件。

#### manifest.json - 地图插件配置清单

配置清单其中包括3个属性：`paths`、`exports`、`load`。
- `paths`：地图插件的路径别名定义，其中：各插件路径是相对`baseUrl`属性值进行设定。
- `exports`：插件导出的对象名称定义。
- `load`：默认需预加载的`css`与`js`插件集合。

```json
{
  "paths": {
    "mapboxgl": "libs/mapbox-gl.js",
    "mapboxgl.css": "libs/mapbox-gl.css",
    "GeoGlobe": "libs/GeoGlobeJS.min.js",
    "GeoGlobe.Visuals": "libs/GeoGlobeJS.visuals.min.js",
    "turf": "libs/turf.min.js",
    "Threebox": "libs/threebox.min.js",
    "DeckGL": "libs/deckgl.min.js"
  },
  "exports": {
    "mapboxgl": ["mapboxgl"],
    "GeoGlobe": ["GeoGlobe"],
    "turf": ["turf"],
    "Threebox": ["THREE", "Threebox"],
    "DeckGL": ["DeckGL"]
  },
  "load": {
    "css": ["mapboxgl.css"],
    "js": ["mapboxgl", "GeoGlobe", "turf"]
  }
}
```

#### 地图Config配置

地图Config配置主要通过`config`属性进行控制设定，可以为配置文件路径，也可以直接是配置`object`对象（建议：统一采用配置文件形式）。
`注意`：当地图配置以文件形式加载时，属性值的路径也是相对于`baseUrl`基础路径，可以采用`../`向上一级相对路径的写法。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| proxyURL | 跨域代理服务地址（GIS跨域服务自行架设） | string | null |
| mapCRS | 地图投影，可直接使用内置投影，也可自定义 | `null` \| `wgs84` \| `mercator` \| `baidu` \| object | null |
| bounds | 地图初始范围（当设定`bounds`属性时则`zoom`和`center`会失效），参考格式：`[[0, 0], [0, 0]]` | number[] | null |
| maxBounds | 地图最大范围 | number[] | null |
| center | 地图初始中心点，参考格式：`[0, 0]` | number[] | [0, 0] |
| zoom | 地图初始层级，层级区间：`0 - 22` | number | 0 | 
| minZoom | 地图最小层级 | number | 0 |
| maxZoom | 地图最大层级 | number | 22 |
| bearing | 地图初始旋转角度 | number | 0 |
| pitch | 地图初始倾斜度，倾斜区间：`0 - 60` | number | 0 |
| minPitch | 地图的最小倾斜度 | number | 0 |
| maxPitch | 地图的最大倾斜度 | number | 60 |
| pitchWithRotate | 地图的旋转、倾斜交互是否启用，当`false`时则纯粹以2D视角渲染 | boolean | true |
| units | 地图单位 | `degrees` \| `m` | 'degrees' |
| mapBaseType | 地图底图初始类型（注意：如`mapBasicLayers`设置其他类型，则根据实际属性Key进行设定） | `vec` \| `img` | 'vec' |
| mapBasicLayers | 地图基础底图图层组服务，内置互联网地图可选：[ `tianditu` \| `baidu` \| `osm` \| `bing` \| `google` \| `gdmap` \| `qqmap` \| `mapbox` ] | object | null |
| mapControls | 地图基础控件，内置控件可选：[ `Navigation` \| `Attribution` \| `Scale` \| `MouseCoordinates` ] | object[] | [] |
| queryServicesMapping | 定义查询分析服务的别名映射，提供地图查询功能时使用 | object | {} |

##### mapCRS

自定义地图投影时，属性如下：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| topTileExtent | 顶级金字塔瓦片范围 | number[] | [] |
| coordtransform | 投影坐标转换 | `'none'` \| {`toViewCoord`: Function, `fromViewCoord`: Function} | 'none' |
| resolutions | 瓦片层级分辨率，从层级索引`0`开始定义，如无该层级，则以`null`补充 | number[] |
| tileSize | 瓦片尺寸大小 | number | 256 |
| epsg | 定义EPSG名称，参考命名格式：`EPSG:4326` | string |
| proj4 | `PROJ4.JS`投影转换的参数，常规`EPSG`编号，可采用`PROJ4.JS`进行坐标转换 | string |
| transform | 是否几何运算时坐标转换（地图几何运算时，由于采用`turf`库，自定义投影时会计算存在误差，因此，需要转换成标准`WGS84`进行计算） | boolean | false |

##### mapBasicLayers

配置地图初始底图时，有两种方式可进行设定：
- 内置地图互联网服务源，其中：[ `tianditu` | `baidu` | `osm` | `bing` | `google` | `gdmap` | `qqmap` \| `mapbox` ]，由于图层渲染接入规则限制，互联网地图源并非同步采用官网最新数据。
- 自定义地图服务源

###### tianditu - 天地图

`Tianditu`天地图服务源，有3种类型服务源可用（瓦片服务源、WGS84 WMTS服务源、Web墨卡托 WMTS服务源），当采用指定地图投影类型的`WMTS`服务源时，需同步修改`mapCRS`属性值才能生效。

- `默认瓦片`型式配置法：
	```javascript
	{
		mapCRS: null,
		mapBasicLayers: 'tianditu'
	}
	```
- `WGS84 WMTS服务源`型式配置法：
	```javascript
	{
		mapCRS: 'wgs84',
		mapBasicLayers: {
			key: 'tianditu',
			options: {
				crs: 'wgs84',
			}
		}
	}
	```
- `Web墨卡托 WMTS服务源`型式配置法：
	```javascript
	{
		mapCRS: 'mercator',
		mapBasicLayers: {
			key: 'tianditu',
			options: {
				crs: 'mercator',
			}
		}
	}
	```

###### baidu - 百度地图服务源

`Baidu`百度地图服务源，有2种类型服务源可用（瓦片服务源、个性化地图服务源），当采用指定百度地图时，需同步修改`mapCRS`属性值才能生效。（注意：使用百度地图时，地图投影坐标需用`百度墨卡托`）。

- `默认瓦片`型式配置法：
	```javascript
	{
		mapCRS: 'baidu',
		mapBasicLayers: 'baidu'
	}
	```
- `个性化地图服务源`型式配置法：
	```javascript
	{
		mapCRS: 'baidu',
		mapBasicLayers: {
			key: 'baidu',
			options: {
				styles: '[个性化配置方案字符串]',
			}
		}
	}
	```

###### osm - OpenStreetMap地图

- `默认瓦片`型式配置法：
	```javascript
	{
		mapBasicLayers: 'osm'
	}
	```

###### bing - 必应地图服务源

- `默认瓦片`型式配置法：
	```javascript
	{
		mapBasicLayers: 'bing'
	}
	```

###### google - 谷歌地图服务源

- `默认瓦片`型式配置法：
	```javascript
	{
		mapBasicLayers: 'google'
	}
	```

###### gdmap - 高德地图服务源

- `默认瓦片`型式配置法：
	```javascript
	{
		mapBasicLayers: 'gdmap'
	}
	```

###### qqmap - 腾讯地图服务源

- `默认瓦片`型式配置法：
	```javascript
	{
		mapBasicLayers: 'qqmap'
	}
	```

###### mapbox - Mapbox地图服务源

- `Mapbox矢量瓦片`型式配置法：
	```javascript
	{
		mapBasicLayers: {
			key: 'mapbox',
			options: {
				style: 'mapbox://styles/mapbox/streets-v11',
				accessToken: '[Mapbox服务授权密钥]',
			}
		}
	}
	```

###### 自定义 - 底图服务源配置

通常项目开发时需使用自主发布的GIS服务，因此，大部分情况下，都采用自定义底图服务源型式进行配置。

- `自定义`型式配置法：
	```javascript
	{
		mapBasicLayers: {
			vec: [
				{
					id: 'custom_tdt_vec_c',
					name: '天地图矢量底图',
					url: 'http://t0.tianditu.gov.cn/vec_c/wmts?tk=e90d56e5a09d1767899ad45846b0cefd',
					type: 'WMTS',
					options: {
						proxy: false,
					}
				}
			],
			img: [
				{
					id: 'custom_tdt_img_c',
					name: '天地图影像底图',
					url: 'http://t0.tianditu.gov.cn/img_c/wmts?tk=e90d56e5a09d1767899ad45846b0cefd',
					type: 'WMTS',
					options: {
						proxy: false,
					}
				}
			]
		}
	}
	```

自定义服务源设定时，格式为`object`，键名可自定义命名，键值则以数组`object[]`数组集合型式，数据源数组集合中每个`object`对象表示一个图层源，因此，每类底图服务源可对应设定多个图层。
其中，图层服务源属性如下：

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| id | 图层的唯一Id标识 | string |
| name | 图层名称，选填项 | string | null |
| url | 图层服务源地址 | string |
| type | 图层服务源类型，可选值：[ `XYZTile` \| `GeoTile` \| `VTS` \| `WMTS` \| `WMS` \| `GeoExport` \| `ArcgisWMTS` \| `ArcgisWMS` ] \| `ArcgisExport` ] | string |
| options | 图层服务源的参数选项 | object | {} |

options - 服务源参数选项属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| proxy | 是否拼接代理服务地址 | boolean | true |
| zoomOffset | 瓦片计算偏移量，通常`WMTS`和`ArcgisWMTS`类型可能需要设置 | number | null |
| bounds | 瓦片的请求范围 | number[] | null |
| minzoom | 瓦片的最小层级 | number | null |
| maxzoom | 瓦片的最大层级 | number | null |
| metadata | 图层的Meta属性，不影响图层渲染 | object | null |
| opacity | 图层的不透明度，范围：`0 - 1` | number | 1 |
| visibility | 图层的显隐状态 | `visible` \| `none` | 'visible' |

##### mapControls

地图控件`mapControls`暂时有4种：`Navigation` 、 `Attribution` 、 `Scale`、`MouseCoordinates`。

- `Navigation`：地图导航控件；
- `Attribution`：地图版权属性描述控件；
- `Scale`：地图比例尺控件；
- `MouseCoordinates`：地图鼠标移动坐标控件；

配置方式示例代码如下：

```javascript
{
	mapControls: [
		{
			id: 'map_control_navigation',
			type: 'Navigation',
			options: {
				position: 'top-left',
				offset: [10, 10],
			}
		},
		{
			id: 'map_control_attribution',
			type: 'Attribution',
			options: {
				position: 'bottom-right',
				offset: [0, 0],
				content: '[版权描述文本]'
			}
		},
		{
			id: 'map_control_scale',
			type: 'Scale',
			options: {
				position: 'bottom-left',
				offset: [10, 10],
			}
		},
		{
			id: 'map_control_mousecoordinates',
			type: 'MouseCoordinates',
			options: {
				position: 'bottom-left',
				offset: [10, 10],
			}
		}
	]
}
```

地图控件通用属性如下：

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| id | 控件唯一Id名 | string |
| type | 控件类型 | `Navigation` \| `Attribution` \| `Scale` \| `MouseCoordinates` |
| options | 控件参数选项 | object | {} |

options - 地图控件的通用参数选项属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| position | 控件的位置 | `top-left` \| `top-right` \| `bottom-left` \| `bottom-right` |
| offset | 控件的相对偏移量，格式参考：`[0, 0]`，（注意：位置的相对偏移参考设定的位置） | number[] |


###### Navigation - 扩展`options`属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| position | 控件的位置 | string | 'top-right' |
| offset | 控件的相对偏移量 | number[] | [10, 10] |
| showCompass | 是否显示“罗盘” | boolean | false |
| visualizePitch | 是否允许控制倾斜 | boolean | true |
| showZoomNum | 是否显示“层级” | boolean | false |


###### Attribution - 扩展`options`属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| position | 控件的位置 | string | 'bottom-right' |
| offset | 控件的相对偏移量 | number[] | [0, 0] |
| content | 属性描述的内容 | string \| `slot` | '[默认描述]' |

当`content`属性采用`VUE`的插槽模式时，则忽略属性设置；在Map组件下创建`Slots`插槽模板即可。

contents - Slots插槽

| 插槽名称 | 说明 |
| --- | --- |
| controls.attribution | Attribution - options.content插槽模式 |


###### Scale - 扩展`options`属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| position | 控件的位置 | string | 'bottom-left' |
| offset | 控件的相对偏移量 | number[] | [10, 5] |
| maxWidth | 比例尺最大显示宽度 | number | 80 |
| unit | 比例尺单位 | `metric` \| `imperial` \| `nautical` | 'metric' |

###### MouseCoordinates - 扩展`options`属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| position | 控件的位置 | string | 'bottom-left' |
| offset | 控件的相对偏移量 | number[] | [15, 0] |
| precision | 坐标的显示精度，`-1`表示不裁剪精度，`0`表示为整数 | number | 5 |
| wgs84 | 是否转换坐标为`WGS84` | boolean | false |

##### queryServicesMapping

地图查询服务源`queryServicesMapping`配置，主要作用于需要使用查询GIS服务的`Query`型式接口，不具有初始地图显示渲染影响；避免每次开发使用查询接口时，都重复编码GIS服务源信息，同时，也可统一管理项目中的GIS服务源配置信息。

配置代码参考如下：

```javascript
{
	queryServicesMapping: {
		'QueryAliasName': {
			name: '全国行政区划服务',
			type: 'WFS',
			url: 'http://127.0.0.1:0000/China/wfs',
			featureType: 'XZQH',
			propertyFieldId: 'OID',
			propertyFieldLabel: 'NAME',
			options: {
				proxy: true,
			}
		},
		...
	}
}
```

`queryServicesMapping`配置以`object`格式进行编码书写，键名作为查询服务源的`全局唯一标识别名`供后续接口使用，键值则为具体的服务源属性信息。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name | 查询服务源的描述名称 | string |
| type | 查询服务源的类型 | `WFS` \| `ArcgisWFS` \| `ArcgisQuery` \| `GeoQuery` |
| url | 查询服务源的地址，实际GIS服务地址格式根据各服务类型决定 | string |
| featureType | 查询服务图层标识名，`WFS`具体图层名根据属性信息决定，而`Arcgis`类型服务则为索引号 | string |
| propertyFieldId | 查询服务源图层的唯一Id字段名，建议设定，可供部分交互使用 | string |
| propertyFieldLabel | 查询服务源图层的显示名称Label字段名，选填项，可供部分交互展示使用 | string |
| options | 查询服务源的参数选项 | object | {} |

options - 查询服务源的通用参数选项属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| proxy | 是否拼接代理服务地址，通常情况下，查询服务请求时都需要代理服务来解决跨域问题 | boolean | true |
| filters | 查询服务源的数据过滤条件，规则：`['==', 'key', 'value'] 或 ['AND | OR | NOT', [], [], ...]`，通常在使用查询服务接口时，作为服务数据过滤使用，`queryServicesMapping`配置时忽略此属性。 | array[] | null |

###### WFS - 扩展`options`属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| version | WFS服务的版本号 | string | '1.0.0' |
| mode | 返回结果模式，`result`默认数据集合，`pagination`分页查询，该模式只在`GeoGlobe WFS`下特有，`count`查询数据总数 | `result` \| `pagination` \| `count` | 'result' |
| geometryName | Geometry属性名，例如：`GeoGlobe：GEOMETRY` | string | null |
| srs | 空间参考 | string | null |
| max | 最大查询结果数 | number | 10 |
| sort | 排序条件，规则：['A', 'DESC'] 或 [['A', 'ASC'], ['B', 'DESC']] | array[] | null |
| featureNS | 要素命名空间 | string | null |
| featurePrefix | 要素类型前缀 | string | null |
| isReverse | 要素几何数据XY是否反转 | boolean | false |
| curpage | 分页查询模式，当前页码 | number | 1 |
| pagesize | 分页查询模式，每页条目数 | number | 10 |
| distance | 空间查询时，缓冲范围距离 | number | 5 |
| units | 空间查询时，缓冲范围的单位 | `m` \| `degree` | 'm' |
| contain | 空间查询时，Polygon分析时，是否采用包含关系 | boolean | false |


###### ArcgisWFS - 扩展`options`属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| version | WFS服务的版本号 | string | '1.0.0' |
| mode | 返回结果模式，`result`默认数据集合，`count`查询数据总数 | `result` \| `count` | 'result' |
| geometryName | Geometry属性名，例如：`Arcgis：SHAPE` | string | null |
| srs | 空间参考 | string | null |
| max | 最大查询结果数 | number | 10 |
| sort | 排序条件，规则：['A', 'DESC'] 或 [['A', 'ASC'], ['B', 'DESC']] | array[] | null |
| featureNS | 要素命名空间 | string | null |
| featurePrefix | 要素类型前缀 | string | null |
| isReverse | 要素几何数据XY是否反转 | boolean | false |
| distance | 空间查询时，缓冲范围距离 | number | 5 |
| units | 空间查询时，缓冲范围的单位 | `m` \| `degree` | 'm' |
| contain | 空间查询时，Polygon分析时，是否采用包含关系 | boolean | false |

###### ArcgisQuery - 扩展`options`属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| mode | 返回结果模式，`result`默认数据集合，`ids`查询Id集合，`count`查询数据总数 | `result` \| `ids` \| `count` | 'result' |
| srs | 空间参考 | string | null |
| outSRS | 输出空间参考 | string | null |
| outFields | 输出的属性字段 | string | '*' |
| spatialRel | 几何空间关系，具体查看Arcgis Query API说明文档 | string | 'esriSpatialRelIntersects' |
| returnGeometry | 是否返回空间Geometry数据 | boolean | true |
| sort | 排序条件，规则：['A', 'DESC'] 或 [['A', 'ASC'], ['B', 'DESC']] | array[] | null |
| text | 图层关联显示字段的快捷关键词搜索，如设置`filters`属性则忽略；| string | null |
| objectIds | 查询图层的默认Object ID属性，多个以逗号分割，如设置`filters`属性则忽略；| string | null |

提示：更多Arcgis Query查询的属性，可具体参考Arcgis的版本对应的属性，具体阅读官方API文档。

###### GeoQuery - 扩展`options`属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| mode | 返回结果模式，`result`默认数据集合，`ids`查询Id集合，`count`查询数据总数 | `result` \| `ids` \| `count` | 'result' |
| srs | 空间参考 | string | null |
| outSRS | 输出空间参考 | string | null |
| outFields | 输出的属性字段 | string | '' |
| spatialRel | 几何空间关系，具体以GeoGlobe的能力支持情况而定 | string | 'SpatialRelIntersects' |
| returnGeometry | 是否返回空间Geometry数据 | boolean | true |
| text | 图层关联显示字段的快捷关键词搜索，如设置`filters`属性则忽略；| string | null |
| objectIds | 查询图层的默认Object ID属性，多个以逗号分割，如设置`filters`属性则忽略；| string | null |
