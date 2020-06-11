<script>
const md = {
	cn: `
		# Map 地图
		基于GeoGlobe、Mapboxgl（非官方版）基础依赖展示二三维一体化的WebGIS地图。

		## 何时使用
		- 需要以空间地理数据等进行WebGIS可视化展示。
		- 需要以二维、三维WebGIS形式来渲染空间矢量、三维模型等数据以一体化地图展示。
		- 通过配置方式简化地图初始化，以统一API接口控制地图交互。

		## 代码演示
	`,
	us: `
		# Map

		## When To Use

		## Examples
	`,
};

import Basic from './basic';
import CN from './map.zh-CN.md';

export default {
	title: 'Map',
	subtitle: '地图',
	render() {
		return (
			<div>
				<md cn={md.cn} us={md.us} />
				<Basic />
				<api>
          <CN slot="cn" />
				</api>
			</div>
		)
	},
};
</script>
