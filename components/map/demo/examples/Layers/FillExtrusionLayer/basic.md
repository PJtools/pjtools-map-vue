<cn>
#### PolygonLayer 矢量面图层
创建一个矢量PolygonLayer面图层。
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
				// 获取当前地图范围内随机多边形面
				const { turf } = iMapApi.exports;
				const bounds = iMapApi.getBounds();
				const polygons = turf.randomPolygon(1, { bbox: [...bounds[0], ...bounds[1]], num_vertices: 4, max_radial_length: 0.005 });

				// 创建一个FillExtrusion Layer图层
				const layer = iMapApi.Layers.addFillExtrusionLayer('vec-layer-id', {
					paint: {
						'fill-extrusion-height': 100,
					}
				}, {
					data: polygons,
				});
				
				// 倾斜地图
				iMapApi.pitchTo(60).then(() => {
					// 缩放到图层数据的合适级别
					layer.setLayerToMaxZoom();
				});
			},
		}
	}
</script>
```
