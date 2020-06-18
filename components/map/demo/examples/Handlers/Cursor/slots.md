<cn>
#### 自定义Slots插槽模板
激活一个自定义的Vue插槽模板来渲染地图光标Tip提示框。
</cn>

<us>
#### slots
xx.
</us>

```tpl
<template>
	<pj-map bordered height="480" 
			config="../MapConfig/examples/basic.json" 
			@loaded="handleMapLoaded">
		<template slot="mousetooltip.custom.icon">
			<a-icon type="meh" />
		</template>
		<template slot="mousetooltip.custom.content">
			<span>&nbsp;我是模板渲染！哼哼~</span>
		</template>
	</pj-map>
</template>

<script>
  export default {
		methods: {
			// 执行地图Map渲染完成时回调
			handleMapLoaded(iMapApi) {
				// 注意：如需直接初始光标Tip提示框，则需要Vue组件渲染完后才能激活。
				this.$nextTick(() => {
					iMapApi.Handlers.cursor.enable({
						cursor: 'default',
						tip: {
							icon: 'custom.icon',
							content: 'custom.content',
						}
					});
				});
			},
		}
	}
</script>
```
