<cn>
#### 默认Marker标注
快速构建一个Marker标注到地图Map中。
</cn>

<us>
#### basic
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
				// 创建一个Marker实例
				iMapApi.addMarker('marker-id', iMapApi.getCenter());
			},
		}
	}
</script>
```
