<script>
const md = {
	cn: `
		# ArcgisQuery Services服务
		地图查询\`ArcgisQuery\`Services服务源需要在配置文件中设定查询服务源信息，具体配置属性说明请查阅 [Map](/components/map-cn/) 地图示例中API说明文档。

		> **温馨提示**：该示例需在\`武大吉奥\`公司内网环境下浏览。

		## 代码演示
	`,
};

import Basic from './basic';
import CN from './zh-CN';

export default {
	title: 'ArcgisQuery',
	subtitle: 'ArcgisQuery Services服务',
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
