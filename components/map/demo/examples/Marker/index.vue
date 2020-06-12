<script>
const md = {
	cn: `
		# Marker 标注
		Marker标注用于地图中需要HTML DOM对象渲染的界面元素。
		注意：Marker标注对象是直接挂载于地图Map对象下，实例的结构在地图Canvas元素之外。

		## 代码演示
	`,
};

import Basic from './basic';
import ColorMarker from './color';
import DraggableMarker from './draggable';
import SlotsMarker from './slots';
import CN from './zh-CN';

export default {
	title: 'Marker',
	subtitle: 'Marker标注',
	render() {
		return (
			<div>
				<md cn={md.cn} />
				<a-row gutter={[10, 10]}>
					<a-col span={12} >
						<Basic />
						<DraggableMarker />
					</a-col>
					<a-col span={12}>
						<ColorMarker />
						<SlotsMarker />
					</a-col>
				</a-row>
				<api>
					<CN slot="cn" />
				</api>
			</div>
		)
	},
};
</script>
