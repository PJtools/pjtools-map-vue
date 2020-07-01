<cn>
#### 基础Switcher
通过地图的内置UI组件快速构建一个底图切换器。
</cn>

<us>
#### basic
xx.
</us>

```tpl
<template>
	<pj-map bordered height="480" 
			config="../MapConfig/examples/tdt.wmts.wgs84.json">
		<pjmap-switcher :data="switcherOptions" v-model="currentSelectedKey" />
	</pj-map>
</template>

<script>
  export default {
		data () {
			return {
				// 定义底图切换器的数据集
				switcherOptions: [
					{
						key: 'vec',
						label: '矢量',
						image: '/static/GeoMap/assets/switcher/vec.png'
					},
					{
						key: 'img',
						label: '影像',
						image: '/static/GeoMap/assets/switcher/img.png'
					}
				],
				// 当前选中的类型Key
				currentSelectedKey: 'vec',
			}
		}
	}
</script>
```
