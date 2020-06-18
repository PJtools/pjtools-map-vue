<script>
const md = {
	cn: `
		# ScrollZoom 地图滚轮缩放
		主要控制地图全局地图滚轮缩放交互操作。

		## 代码演示
	`,
};

import Basic from './basic';
import CN from './zh-CN';

export default {
	title: 'ScrollZoom',
	subtitle: 'ScrollZoom滚轮缩放',
	render() {
		return (
			<div>
				<md cn={md.cn} />
				<Basic />
				<api>
					<CN slot="cn" />
				</api>
			</div>
		)
	},
};
</script>
