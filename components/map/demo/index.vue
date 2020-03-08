<script>
const md = {
	cn: `
		# Map 地图
		基于GeoGlobe、Mapboxgl（非官方版）基础依赖展示二三维一体化的WebGIS地图。

		## 何时使用
		- 需要以空间地理数据等进行WebGIS可视化展示。
		- 需要以二维、三维WebGIS形式来渲染空间矢量、三维模型等数据加以一体化地图展示。

		## 代码演示
	`,
	us: `
		# Map

		## When To Use

		## Examples
	`,
};

import Basic from './basic';

export default {
	category: 'Components',
  subtitle: '地图',
  type: 'Display',
	title: 'Map',
	render() {
		return (
			<div>
				<md cn={md.cn} us={md.us} />
				<Basic />
			</div>
		)
	},
};
</script>
