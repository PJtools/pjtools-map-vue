<cn>
#### 可拖拽的Marker
构建一个可拖拽的Marker标注到地图Map中。
</cn>

<us>
#### draggable
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
				// 创建Marker实例
				iMapApi.addMarker(`marker-id`, iMapApi.getCenter(), {
					draggable: true,
				});
			},
		}
	}
</script>
```