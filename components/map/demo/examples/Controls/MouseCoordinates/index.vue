<script>
const md = {
	cn: `
		# MouseCoordinates 光标地理坐标
		地图控件是以地图配置文件形式设定，具体API说明请查阅 [Map](/components/map-cn/) 地图示例。

		## 代码演示
	`,
};

import Basic from './basic';

export default {
	title: 'MouseCoordinates',
	subtitle: 'MouseCoordinates光标地理坐标',
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
