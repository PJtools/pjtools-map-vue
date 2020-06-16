<script>
const md = {
	cn: `
		# Measure 测量
		主要作用于地图中需要使用距离、面积等量算的应用场景。

		## 代码演示
	`,
};

import Basic from './basic';
import CN from './zh-CN';

export default {
	title: 'Measure',
	subtitle: 'Measure测量',
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
