<script>
const md = {
	cn: `
		# Navigation 地图导航
		地图控件是以地图配置文件形式设定，具体API说明请查阅 [Map](/components/map-cn/) 地图示例。

		## 代码演示
	`,
};

import Basic from './basic';
import Compass from './compass';

export default {
	title: 'Navigation',
	subtitle: 'Navigation地图导航',
	render() {
		return (
			<div>
				<md cn={md.cn} />
				<a-row gutter={[10, 10]}>
					<a-col span={12}>
						<Basic />
					</a-col>
					<a-col span={12}>
						<Compass />
					</a-col>
				</a-row>
			</div>
		)
	},
};
</script>
