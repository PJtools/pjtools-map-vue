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
	<div class="component-wrapper-container">
		<pj-map bordered height="520" 
				config="../MapConfig/examples/basic.json" 
				@loaded="handleMapLoaded">
		</pj-map>
		<div class="map-toolbar-container">
			<a-button-group>
				<a-button :disabled="disabled" type="primary" @click="handleMeasureEnable('line')">距离测量</a-button>
				<a-button :disabled="disabled" type="primary" @click="handleMeasureEnable('polygon')">多边形测量</a-button>
				<a-button :disabled="disabled" type="primary" @click="handleMeasureEnable('rectangle')">矩形测量</a-button>
				<a-button :disabled="disabled" type="primary" @click="handleMeasureEnable('circle')">圆形测量</a-button>
				<a-button :disabled="disabled" type="primary" @click="handleMeasureDestroy">清除</a-button>
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
				measure: null,
			}
		},
		methods: {
			// 执行地图Map渲染完成时回调
			handleMapLoaded(iMapApi) {
				this.iMapApi = iMapApi;
				// 解除Butoon组件禁用状态
				this.disabled = false;
			},

			// 激活地图测量的指定模式
			handleMeasureEnable(mode) {
				if (!this.measure) {
					this.measure = this.iMapApi.Interfaces.measure();
				}
				this.measure.enable(mode);
			},

			// 执行地图测量的清除与销毁
			handleMeasureDestroy() {
				this.measure && this.measure.destroy();
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
