<script>
const md = {
	cn: `
		# Fullscreen 地图全屏
		主要作用于地图中需要使用全屏的应用场景。

		## 代码演示
	`,
};

import Basic from './basic';
import CN from './zh-CN';

export default {
	title: 'Fullscreen',
	subtitle: 'Fullscreen地图全屏',
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
