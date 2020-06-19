<script>
const md = {
	cn: `
		# Baidu 百度地图
		地图采用百度地图作为初始底图资源。底图服务源是以地图配置文件形式设定，具体API说明请查阅 [Map](/components/map-cn/) 地图示例。

		> **投影坐标**： 百度墨卡托

		## 代码演示
	`,
};

import Basic from './basic';
import Custom from './custom';

export default {
	title: 'Tianditu',
	subtitle: 'Tianditu天地图',
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
			</div>
		)
	},
};
</script>
