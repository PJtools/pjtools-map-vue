<cn>
#### ZoomInOut地图拉框放大/缩小
对地图全局拉框放大/缩小交互进行禁用/启用控制。
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
			<a-button-group>
				<a-button :disabled="disabled" type="primary" @click="handleZoomInOutEnable('in')">拉框放大</a-button>
				<a-button :disabled="disabled" type="primary" @click="handleZoomInOutEnable('out')">拉框缩小</a-button>
				<a-button :disabled="disabled" type="primary" @click="handleZoomInOutDisable">禁用</a-button>
			</a-button-group>
		</div>
	</div>
</template>

<script>
  export default {
		data () {
			return {
				iMapApi: null,
				disabled: true,
			}
		},
		methods: {
			// 执行地图Map渲染完成时回调
			handleMapLoaded(iMapApi) {
				this.iMapApi = iMapApi;
				// 解除Butoon组件禁用状态
				this.disabled = false;
			},

			// 激活地图拉框放大/缩小交互操作
			handleZoomInOutEnable(mode) {
				const zoomInOut = this.iMapApi.Handlers.zoomInOut;
				zoomInOut.enable({ mode });
			},

			// 执行禁用地图拉框放大/缩小交互操作
			handleZoomInOutDisable() {
				const zoomInOut = this.iMapApi.Handlers.zoomInOut;
				zoomInOut.disable();
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
