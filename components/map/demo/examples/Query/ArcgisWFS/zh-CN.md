## API

通过配置文件在`queryServicesMapping`属性中配置`ArcgisWFS`查询服务源信息后，我们可以随时通过`iMapApi.Query`二级对象下的接口进行服务数据查询。

- #### iMapApi.Query.fetchServicesTaskByKey(key, options?)
	根据配置方案的查询分析服务Key名获取Web GIS Service服务查询对象，并发送请求获取要素数据。
	
	> **注意**：该方法返回的一个标准的`Promise`对象，则需在`then`回调中进行接收标准的GeoJSON矢量要素数据集合。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| key | 配置方案的查询服务项Key名 |
	| options | 查询服务的参数选项，一般情况下，主要使用`filters`属性进行数据过滤条件书写即可 | array[] |

	> 具体各类型的查询服务`options`属性，请查阅 [Map](/components/map-cn/) 地图示例中 `queryServicesMapping` 属性的具体介绍。
