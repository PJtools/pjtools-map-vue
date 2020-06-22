<script>
const md = {
	cn: `
		# BackgroundLayer 背景图层

		## 代码演示
	`,
};

import Basic from './basic';
import CN from './zh-CN';

export default {
	title: 'BackgroundLayer',
	subtitle: 'BackgroundLayer背景图层',
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
