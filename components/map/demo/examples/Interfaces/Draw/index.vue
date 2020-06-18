<script>
const md = {
	cn: `
		# Draw 绘图
		主要作用于地图中需要使用绘制矢量图形的应用场景。

		## 代码演示
	`,
};

import Basic from './basic';
import CN from './zh-CN';

export default {
	title: 'Draw',
	subtitle: 'Draw绘图',
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
