<script>
const md = {
	cn: `
		# Scale 比例尺
		地图控件是以地图配置文件形式设定，具体API说明请查阅 [Map](/components/map-cn/) 地图示例。

		## 代码演示
	`,
};

import Basic from './basic';

export default {
	title: 'Scale',
	subtitle: 'Scale比例尺',
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
