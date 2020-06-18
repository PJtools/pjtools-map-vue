<script>
const md = {
	cn: `
		# OpenStreetMap 地图
		地图采用OpenStreetMap地图作为初始底图资源。底图服务源是以地图配置文件形式设定，具体API说明请查阅 [Map](/components/map-cn/) 地图示例。

		## 代码演示
	`,
};

import Basic from './basic';

export default {
	title: 'OpenStreetMap',
	subtitle: 'OpenStreetMap地图',
	render() {
		return (
			<div>
				<md cn={md.cn} />
				<Basic />
			</div>
		)
	},
};
</script>
