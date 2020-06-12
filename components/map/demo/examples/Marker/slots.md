<cn>
#### 插槽模板Marker
构建一个Vue组件模板的Marker标注到地图Map中。
</cn>

<us>
#### slots
xx.
</us>

```tpl
<template>
	<pj-map bordered height="400" 
			config="../MapConfig/examples/basic.json" 
			@loaded="handleMapLoaded">
		<template v-slot:marker.custom="{data}">
			<span>{{data.label}} Marker!</span>
		</template>
	</pj-map>
</template>

<script>
  export default {
		methods: {
			handleMapLoaded(iMapApi) {
				// 创建Marker实例
				iMapApi.addMarker(`marker-id`, iMapApi.getCenter(), {
					slots: 'custom',
					data: {
						label: 'Hello'
					},
				});
			},
		}
	}
</script>
```