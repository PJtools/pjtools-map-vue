<cn>
#### Measure地图测量
构建在地图中进行绘图实时测量功能。
</cn>

<us>
#### basic
xx.
</us>

```tpl
<template>
	<pj-map bordered height="520" 
			config="../MapConfig/examples/basic.json" 
			@loaded="handleMapLoaded">
	</pj-map>
</template>

<script>
  export default {
		methods: {
			handleMapLoaded(iMapApi) {
				
			},
		}
	}
</script>
```
