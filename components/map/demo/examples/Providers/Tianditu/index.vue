<script>
const md = {
	cn: `
		# Tianditu 天地图
		地图采用天地图作为初始底图资源。底图服务源是以地图配置文件形式设定，具体API说明请查阅 [Map](/components/map-cn/) 地图示例。

		## 代码演示
	`,
};

import WGS84 from './wgs84';
import Mercator from './mercator';
import WGS84Img from './wgs84-img';
import MercatorImg from './mercator-img';

export default {
	title: 'Tianditu',
	subtitle: 'Tianditu天地图',
	render() {
		return (
			<div>
				<md cn={md.cn} />
				<a-row gutter={[10, 10]}>
					<a-col span={12}>
						<WGS84 />
						<WGS84Img />
					</a-col>
					<a-col span={12}>
						<Mercator />
						<MercatorImg />
					</a-col>
				</a-row>
			</div>
		)
	},
};
</script>
