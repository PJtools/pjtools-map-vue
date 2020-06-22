<script>
const md = {
	cn: `
		# FillExtrusionLayer 3D面图层

		## 代码演示
	`,
};

import Basic from './basic';
import CN from './zh-CN';

export default {
	title: 'FillExtrusionLayer',
	subtitle: 'FillExtrusionLayer图层',
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
