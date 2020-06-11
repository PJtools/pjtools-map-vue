<cn>
#### 基础Marker标注
通过`Vue模板插槽`构建一个Marker标注到地图Map中。
</cn>

<us>
#### Marker
xx.
</us>

```tpl
<template>
	<pj-map bordered height="600" config="../MapConfig/examples/basic.json">
	</pj-map>
</template>

<script>
  export default {
		data () {
			return {
				iMapApi: null
			};
		},
		methods: {
			handleMapLoaded(iMapApi) {
				this.iMapApi = iMapApi;
				console.log('loaded');
			},
		}
	}
</script>
```