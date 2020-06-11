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

export default {
	title: 'Marker',
	subtitle: 'Marker标注',
	render() {
		return (
			<div>
				<md cn={md.cn} />
				<Basic />
				<api>
				</api>
			</div>
		)
	},
};
</script>
