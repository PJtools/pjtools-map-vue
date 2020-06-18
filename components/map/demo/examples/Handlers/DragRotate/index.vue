<script>
const md = {
	cn: `
		# DragRotate 地图旋转倾斜
		主要控制地图全局地图旋转倾斜交互操作。

		## 代码演示
	`,
};

import Basic from './basic';
import CN from './zh-CN';

export default {
	title: 'DragRotate',
	subtitle: 'DragRotate旋转倾斜',
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
