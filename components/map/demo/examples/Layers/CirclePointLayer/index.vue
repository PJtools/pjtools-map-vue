<script>
const md = {
	cn: `
		# CirclePointLayer 圆点图层

		## 代码演示
	`,
};

import Basic from './basic';
import CN from './zh-CN';

export default {
	title: 'CirclePointLayer',
	subtitle: 'CirclePointLayer图层',
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
