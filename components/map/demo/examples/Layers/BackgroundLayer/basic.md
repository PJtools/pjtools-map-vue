<cn>
#### BackgroundLayer 背景图层
创建一个矢量BackgroundLayer背景图层。
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
				// 创建一个Background Layer图层
				iMapApi.Layers.addBackgroundLayer('vec-layer-id', {
					paint: {
						'background-color': '#1890ff',
						'background-opacity': 0.6
					}
				});
			},
		}
	}
</script>
```
