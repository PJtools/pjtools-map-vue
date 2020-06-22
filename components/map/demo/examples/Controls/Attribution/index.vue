<script>
const md = {
	cn: `
		# Attribution 属性信息
		地图控件是以地图配置文件形式设定，具体API说明请查阅 [Map](/components/map-cn/) 地图示例。

		## 代码演示
	`,
};

import Basic from './basic';
import Slots from './slots';

export default {
	title: 'Attribution',
	subtitle: 'Attribution属性信息',
	render() {
		return (
			<div>
				<md cn={md.cn} />
				<a-row gutter={[10, 10]}>
					<a-col span={12}>
						<Basic />
					</a-col>
					<a-col span={12}>
						<Slots />
					</a-col>
				</a-row>
			</div>
		)
	},
};
</script>
