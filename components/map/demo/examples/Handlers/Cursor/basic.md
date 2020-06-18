<cn>
#### 基础的光标Tip提示框
激活一个简单的地图Cursor光标Tip提示框。
</cn>

<us>
#### basic
xx.
</us>

```tpl
<template>
	<pj-map bordered height="480" 
			config="../MapConfig/examples/basic.json" 
			@loaded="handleMapLoaded">
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
							icon: 'question-circle',
							content: '我是一个Tip提示框! O(∩_∩)O',
						}
					});
				});
			},
		}
	}
</script>
```
