<cn>
#### CirclePointLayer 圆点图层
创建一个矢量CirclePointLayer圆点图层。
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
				// 获取当前地图范围内随机点位
				const { turf } = iMapApi.exports;
				const bounds = iMapApi.getBounds();
				const points = turf.randomPoint(10, { bbox: [...bounds[0], ...bounds[1]] });
				
				// 创建一个CirclePoint Layer图层
				const layer = iMapApi.Layers.addCirclePointLayer('vec-layer-id', {}, {
					data: points,
				});
				// 缩放到图层数据的合适级别
				layer.setLayerToMaxZoom();
			},
		}
	}
</script>
```
