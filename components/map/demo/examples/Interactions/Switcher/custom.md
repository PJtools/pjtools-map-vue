<cn>
#### 自定义切换事件
通过自定义事件替换默认的地图切换功能。
</cn>

<us>
#### custom
xx.
</us>

```tpl
<template>
	<pj-map bordered height="480" 
			config="../MapConfig/examples/tdt.wmts.wgs84.json"
			@loaded="handleMapLoaded">
		<pjmap-switcher :data="switcherOptions" v-model="currentSelectedKey" />
	</pj-map>
</template>

<script>
  export default {
		data () {
			return {
				iMapApi: null,
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
					},
					{
						key: 'earth',
						label: '三维',
						image: '/static/GeoMap/assets/switcher/earth.png',
						onActive: this.handleItemActiveByEarth
					}
				],
				// 当前选中的类型Key
				currentSelectedKey: 'vec',
			}
		},
		methods: {
			// 执行地图Map渲染完成时回调
			handleMapLoaded(iMapApi) {
				this.iMapApi = iMapApi;
			},

			// 当激活选中"三维"类型项时执行的事件响应
			handleItemActiveByEarth () {
				const message = this.iMapApi.component.message;
				message.info(`你可以自由定义具体地图交互逻辑哦！(●'◡'●)`);
			}
		}
	}
</script>
```
