<script>
const md = {
	cn: `
		# Bing 必应地图
		地图采用Bing必应地图作为初始底图资源。底图服务源是以地图配置文件形式设定，具体API说明请查阅 [Map](/components/map-cn/) 地图示例。

		> **投影坐标**： GCJ02火星坐标

		## 代码演示
	`,
};

import Basic from './basic';

export default {
	title: 'Bing',
	subtitle: 'Bing地图',
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
