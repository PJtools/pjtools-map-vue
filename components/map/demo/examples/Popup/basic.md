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
				const coordinates = iMapApi.getCenter();
				// 创建一个Popup实例
				iMapApi.addPopup('popup-id', coordinates, {
					slots: 'Hi, Popup!',
				});
			},
		}
	}
</script>
```