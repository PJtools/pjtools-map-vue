<script>
const md = {
	cn: `
		# Keyboard 地图键盘快捷键
		主要控制地图键盘快捷键交互操作。

		## 代码演示
	`,
};

import Basic from './basic';
import CN from './zh-CN';

export default {
	title: 'Keyboard',
	subtitle: 'Keyboard键盘快捷键',
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
