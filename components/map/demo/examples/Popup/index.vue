<script>
const md = {
	cn: `
		# Popup 气泡弹窗
		Popup气泡弹窗用于地图中需要做简单的详情信息展示的界面元素。
		注意：Popup气泡弹窗对象是直接挂载于地图Map对象下，实例的结构在地图Canvas元素之外。

		## 代码演示
	`,
};

import Basic from './basic';
import Slots from './slots';
import Skin from './skin';
import CN from './zh-CN';

export default {
	title: 'Popup',
	subtitle: 'Popup气泡弹窗',
	render() {
		return (
			<div>
				<md cn={md.cn} />
				<Basic />
				<Slots />
				<Skin />
				<api>
					<CN slot="cn" />
				</api>
			</div>
		)
	},
};
</script>
