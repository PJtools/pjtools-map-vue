<cn>
#### WFS Query服务
通过配置文件配置服务源，查询服务渲染矢量数据。
</cn>

<us>
#### basic
xx.
</us>

```tpl
<template>
	<pj-map bordered height="480" config="../MapConfig/examples/wfs.json" @loaded="handleMapLoaded">
	</pj-map>
</template>

<script>
  export default {
		methods: {
			handleMapLoaded(iMapApi) {
				// 通过配置的Query服务源进行数据过滤查询
				iMapApi.Query.fetchServicesTaskByKey('ZRWG', {
					filters: ['LIKE', 'ZRCODE', '3604210010']
				}).then((data) => {
					// 查询获取的数据渲染到矢量图层
					const layer = iMapApi.Layers.addPolygonLayer('polygon-layer-id', null, {
						data,
						outline: true,
					});
					// 缩放到图层数据的合适级别
					layer.setLayerToMaxZoom();
				}).catch(() => {
					iMapApi.component.message.error(`[WFS Services]查询服务请求过滤数据失败，请重试.`);
				});
			},
		}
	}
</script>
```
