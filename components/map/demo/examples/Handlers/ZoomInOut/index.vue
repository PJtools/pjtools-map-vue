<script>
const md = {
	cn: `
		# ZoomInOut 拉框放大/缩小
		主要控制地图全局拉框放大/缩小交互操作。

		## 代码演示
	`,
};

import Basic from './basic';
import CN from './zh-CN';

export default {
	title: 'ZoomInOut',
	subtitle: 'ZoomInOut拉框放大/缩小',
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
