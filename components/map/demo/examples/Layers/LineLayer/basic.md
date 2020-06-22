<cn>
#### LineLayer 矢量线图层
创建一个矢量LineLayer线图层。
</cn>

<us>
#### basic
xx.
</us>

```tpl
<template>
	<pj-map bordered height="480" config="../MapConfig/examples/basic.json" @loaded="handleMapLoaded">
	</pj-map>
</template>

<script>
  export default {
		methods: {
			handleMapLoaded(iMapApi) {
				// 获取当前地图范围内随机线段
				const { turf } = iMapApi.exports;
				const bounds = iMapApi.getBounds();
				const lines = turf.randomLineString(5, { bbox: [...bounds[0], ...bounds[1]], num_vertices: 5, max_length: 0.002 });

				// 创建一个Line Layer图层
				const layer = iMapApi.Layers.addLineLayer('vec-layer-id', {}, {
					data: lines,
				});
				// 缩放到图层数据的合适级别
				layer.setLayerToMaxZoom();
			},
		}
	}
</script>
```
