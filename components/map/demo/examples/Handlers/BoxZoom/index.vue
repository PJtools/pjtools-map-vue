<script>
const md = {
	cn: `
		# BoxZoom 地图Shift拉框放大
		主要控制地图Shift拉框放大交互操作。

		## 代码演示
	`,
};

import Basic from './basic';
import CN from './zh-CN';

export default {
	title: 'BoxZoom',
	subtitle: 'BoxZoom拉框放大',
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
