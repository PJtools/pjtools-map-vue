<script>
const md = {
	cn: `
		# GeoExport Services服务
		地图渲染叠加\`GeoExport\`Services服务图层。如需初始化渲染\`GeoExport\`服务图层是以配置文件形式设定，具体API说明请查阅 [Map](/components/map-cn/) 地图示例。

		> **温馨提示**：该示例需在\`武大吉奥\`公司内网环境下浏览。

		## 代码演示
	`,
};

import Basic from './basic';
import CN from './zh-CN';

export default {
	title: 'GeoExport',
	subtitle: 'GeoExport服务',
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
