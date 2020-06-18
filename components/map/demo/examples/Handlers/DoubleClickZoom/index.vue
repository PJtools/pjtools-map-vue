<script>
const md = {
	cn: `
		# DoubleClickZoom 双击放大
		主要控制地图全局双击放大交互操作。

		## 代码演示
	`,
};

import Basic from './basic';
import CN from './zh-CN';

export default {
	title: 'DoubleClickZoom',
	subtitle: 'DoubleClickZoom双击放大',
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
