<cn>
#### Draw地图矢量绘制
构建在地图中进行在线矢量图形绘制功能。
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
				<a-button :disabled="disabled" type="primary" @click="handleDrawModeChange('point')">点</a-button>
				<a-button :disabled="disabled" type="primary" @click="handleDrawModeChange('line')">线</a-button>
				<a-button :disabled="disabled" type="primary" @click="handleDrawModeChange('polygon')">多边形</a-button>
				<a-button :disabled="disabled" type="primary" @click="handleDrawModeChange('rectangle')">矩形</a-button>
				<a-button :disabled="disabled" type="primary" @click="handleDrawModeChange('rectangle', { square: true })">正方形</a-button>
				<a-button :disabled="disabled" type="primary" @click="handleDrawModeChange('circle')">圆形</a-button>
				<a-button :disabled="disabled" type="primary" @click="handleDrawModeChange('ellipse')">椭圆</a-button>
				<a-button :disabled="disabled" type="primary" @click="handleDrawModeChange('select')">选取模式</a-button>
				<a-button :disabled="disabled" type="primary" @click="handleDrawModeChange('edit')">编辑模式</a-button>
				<a-button :disabled="disabled" type="primary" @click="handleDrawModeChange('static')">静态模式</a-button>
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
				draw: null,
			}
		},
		methods: {
			// 执行地图Map渲染完成时回调
			handleMapLoaded(iMapApi) {
				this.iMapApi = iMapApi;
				// 解除Butoon组件禁用状态
				this.disabled = false;
				// 实例化地图绘制对象
				this.draw = this.iMapApi.Interfaces.draw();
			},

			// 激活地图绘制矢量图形模式
			handleDrawModeChange(mode, options) {
				if (!this.draw.isEnabled()) {
					this.draw.enable(mode, options);
				} else {
					this.draw.changeMode(mode, options);
				}
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
