<script>
const md = {
	cn: `
		# XYZTile Services服务
		地图渲染叠加\`XYZTile\`瓦片服务图层。如需初始化渲染\`XYZTile\`瓦片服务图层是以配置文件形式设定，具体API说明请查阅 [Map](/components/map-cn/) 地图示例。

		## 代码演示
	`,
};

import Basic from './basic';
import CN from './zh-CN';

export default {
	title: 'XYZTile',
	subtitle: 'XYZTile服务',
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
