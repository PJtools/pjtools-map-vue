<cn>
#### Fullscreen地图全屏
构建在地图中进行浏览器全屏化功能。
</cn>

<us>
#### basic
xx.
</us>

```tpl
<template>
	<div class="component-wrapper-container">
		<pj-map bordered height="520" 
				config="../MapConfig/examples/basic.json" 
				@loaded="handleMapLoaded">
		</pj-map>
		<div class="map-toolbar-container">
			<a-button :disabled="disabled" type="primary" icon="fullscreen" @click="handleToggleFullscreen">全屏</a-button>
		</div>
	</div>
</template>

<script>
  export default {
		data () {
			return {
				iMapApi: null,
				disabled: true,
				fullscreen: null,
			}
		},
		methods: {
			// 执行地图Map渲染完成时回调
			handleMapLoaded(iMapApi) {
				this.iMapApi = iMapApi;
				// 解除Butoon组件禁用状态
				this.disabled = false;
				// 实例化地图全屏对象
				this.fullscreen = this.iMapApi.Interfaces.fullscreen();
			},

			// 执行驱动地图进入浏览器全屏化
			handleToggleFullscreen() {
				this.fullscreen.enable();
			},
		}
	}
</script>

<style scoped>
	.component-wrapper-container {
		position: relative;
	}
	.map-toolbar-container {
		position: absolute;
		top: 10px;
		right: 10px;
	}
</style>
```
