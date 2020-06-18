<script>
const md = {
	cn: `
		# DragPan 地图漫游
		主要控制地图全局漫游交互操作。

		## 代码演示
	`,
};

import Basic from './basic';
import CN from './zh-CN';

export default {
	title: 'DragPan',
	subtitle: 'DragPan漫游',
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
