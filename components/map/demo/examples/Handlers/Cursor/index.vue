<script>
const md = {
	cn: `
		# Cursor 地图光标跟随Tip提示框
		主要控制地图全局光标跟随Tip提示框交互操作。

		## 代码演示
	`,
};

import Basic from './basic';
import Slots from './slots';
import CN from './zh-CN';

export default {
	title: 'Cursor',
	subtitle: 'Cursor光标Tip提示框',
	render() {
		return (
			<div>
				<md cn={md.cn} />
				<a-row gutter={[10, 10]}>
					<a-col span={12}>
						<Basic />
					</a-col>
					<a-col span={12}>
						<Slots />
					</a-col>
				</a-row>
				<api>
					<CN slot="cn" />
				</api>
			</div>
		)
	},
};
</script>
