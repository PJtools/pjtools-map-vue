<cn>
#### 默认Marker的颜色替换
构建一个指定颜色的Marker标注到地图Map中。
</cn>

<us>
#### color
xx.
</us>

```tpl
<template>
	<pj-map bordered height="400" 
			config="../MapConfig/examples/basic.json" 
			@loaded="handleMapLoaded">
	</pj-map>
</template>

<script>
  export default {
		methods: {
			handleMapLoaded(iMapApi) {
				const center = iMapApi.getCenter();
				const coordinates = [
					[center[0] - 0.0005, center[1]],
					center,
					[center[0] + 0.0005, center[1]],
				];

				const colors = ['#f5222d', '#faad14', '#722ed1'];
				// 创建Marker实例
				coordinates.map((coordinate, index) => {
					iMapApi.addMarker(`marker-id-${index}`, coordinate, {
						color: colors[index],
					});
				});
			},
		}
	}
</script>
```