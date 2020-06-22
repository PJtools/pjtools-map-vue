<cn>
#### TextSymbolLayer 矢量文本图层
创建一个矢量TextSymbolLayer文本图层。
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
				const points = turf.randomPoint(1, { bbox: [...bounds[0], ...bounds[1]] });

				// 创建一个TextSymbol Layer图层
				const layer = iMapApi.Layers.addTextSymbolLayer('vec-layer-id', {
					layout: {
						'text-field': 'Hello, TextSymbolLayer!',
						'text-size': 32,
					}
				}, {
					data: points,
				});
				// 缩放到图层数据的合适级别
				layer.setLayerToMaxZoom();
			},
		}
	}
</script>
```
