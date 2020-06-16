<cn>
#### 插槽模板Popup气泡弹窗
构建一个Vue组件模板的Popup气泡弹窗到地图Map中。
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
		<template v-slot:popup.custom="{data}">
			<span>{{data.label}} 我是插槽模板!(●'◡'●)</span>
		</template>
	</pj-map>
</template>

<script>
  export default {
		methods: {
			handleMapLoaded(iMapApi) {
				// 创建一个Popup实例
				iMapApi.addPopup('popup-id', iMapApi.getCenter(), {
					slots: 'custom',
					data: {
						label: 'Hi, Popup!',
					}
				});
			},
		}
	}
</script>
```