<script>
const md = {
	cn: `
		# LineLayer 矢量线图层

		## 代码演示
	`,
};

import Basic from './basic';
import CN from './zh-CN';

export default {
	title: 'LineLayer',
	subtitle: 'LineLayer图层',
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
