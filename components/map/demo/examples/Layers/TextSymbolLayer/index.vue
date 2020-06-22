<script>
const md = {
	cn: `
		# TextSymbolLayer 矢量文本图层

		## 代码演示
	`,
};

import Basic from './basic';
import CN from './zh-CN';

export default {
	title: 'TextSymbolLayer',
	subtitle: 'TextSymbolLayer图层',
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
