<script>
const md = {
	cn: `
		# PolygonLayer 矢量面图层

		## 代码演示
	`,
};

import Basic from './basic';
import CN from './zh-CN';

export default {
	title: 'PolygonLayer',
	subtitle: 'PolygonLayer图层',
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
