<cn>
#### 默认Popup气泡弹窗
快速构建一个Popup气泡弹窗到地图Map中。
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
				// 创建一个Popup实例
				const popup = new mapboxgl.Popup();
				popup.setLngLat(iMapApi.getCenter());
				popup.setHTML("<h1>Hello World!</h1>");
				popup.addTo(iMapApi.map);
			},
		}
	}
</script>
```