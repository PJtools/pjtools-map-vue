<cn>
#### 自定义Popup气泡弹窗
构建自定义背景的Popup气泡弹窗到地图Map中。
</cn>

<us>
#### skin
xx.
</us>

```tpl
<template>
	<pj-map bordered height="400" 
			config="../MapConfig/examples/basic.json" 
			@loaded="handleMapLoaded">
		<template v-slot:popup.custom="{data}">
			<a-card>
				<template slot="actions" class="ant-card-actions">
					<a-icon key="setting" type="setting" />
					<a-icon key="edit" type="edit" />
					<a-icon key="ellipsis" type="ellipsis" />
				</template>
				<a-card-meta :title="data.title" :description="data.label" />
			</a-card>
		</template>
	</pj-map>
</template>

<script>
  export default {
		methods: {
			handleMapLoaded(iMapApi) {
				const coordinates = iMapApi.getCenter();
				// 创建一个Popup实例
				iMapApi.addPopup('popup-id', coordinates, {
					slots: 'custom',
					defaultSkin: false,
					data: {
						title: 'Hi, Popup!',
						label: '我自定义了背景面板! O(∩_∩)O',
					}
				});
				const popup = iMapApi.getPopup('popup-id');
				popup.on('open', () => {
					// 解决Popup气泡内容高度偏上，向下移动定位
					iMapApi.panTo(coordinates, 500, {
						offset: [0, 80],
					});
				});
			},
		}
	}
</script>
```