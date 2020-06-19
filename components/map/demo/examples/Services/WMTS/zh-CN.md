## API

除通过配置文件形式渲染`WMTS`服务图层外，我们还可以通过`iMapApi.Services`二级对象下的接口进行服务图层叠加。

- #### iMapApi.Services.addServicesLayer(type, id, url, options?, beforeId?, layerGroupId?)
	添加一个WebGIS Services服务图层到地图中。
	
	> **注意**：该方法返回的一个标准的`Promise`对象，如果需求有在叠加服务图层之后才能操作交互的应用场景，则需在`then`回调中进行，如果不在乎同步顺序，则可以忽略。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| type | 服务类型，区分大小写 | `XYZTile` \| `GeoTile` \| `VTS` \| `WMTS` \| `WMS` \| `GeoExport` \| `ArcgisWMTS` \| `ArcgisWMS` \| `ArcgisExport` |
	| id | 图层唯一Id名 | string |
	| url | 服务类型的服务地址 | string |
	| options | 选填项，各个类型GIS服务的参数选项 | object | {} |
	| beforeId | 待添加到指定图层Id之前 | string | null |
	| layerGroupId | 图层组的Id名称，如指定则创建时会自动归到图层组中 | string | null |

	**options** - `WMTS`服务参数选项

	> 通用的`options`属性请参考 [Map](/components/map-cn/) 地图示例中`自定义服务源配置`说明。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| proxy | 是否拼接代理服务地址 | boolean | true |
	| version | 选填项，WMTS服务版本号 | string | '1.0.0' |
	| layerName | 选填项，WMTS服务图层名标识 | string | null |
	| layerMatrixSet | 选填项，WMTS服务图层矩阵集名 | string | null |
	| styleName | 选填项，WMTS服务图层样式名 | string | null |
	| format | 选填项，WMTS服务的图片格式 | `image/tile` \| `image/png` \| `image/jpeg` | 'image/png' |
	| units | 选填项，服务投影单位，影响计算服务的金字塔范围、层级偏移值是否解析正确 | `degrees` \| `m` | 'm' |
