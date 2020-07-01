<script>
const md = {
	cn: `
		# Switcher 底图切换器
		主要作用于地图中需要对不同类型的地图底图进行切换的应用场景。

		## 代码演示
	`,
};

import Basic from './basic';
import Custom from './custom';
import CN from './zh-CN';

export default {
	title: 'Switcher',
	subtitle: 'Switcher底图切换器',
	render() {
		return (
			<div>
				<md cn={md.cn} />
				<a-row gutter={[10, 10]}>
					<a-col span={12}>
						<Basic />
					</a-col>
					<a-col span={12}>
						<Custom />
					</a-col>
				</a-row>
				<api>
					<CN slot="cn" />
				</api>
			</div>
		)
	},
};
</script>
