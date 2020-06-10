<script>
const md = {
	cn: `
		# 预加载文件
		全局预加载外部文件（如：JS、CSS）。

		## 何时使用
		可提供管理和协调相关资源的动态异步预加载，方便的帮助你异步按需加载相关资源。

		## 代码演示
	`,
	us: `
		# Preload

		## When To Use

		## Examples
	`,
};

import Basic from './basic';
import CN from './preload.zh-CN.md';

export default {
	title: 'Preload',
  subtitle: '预加载文件',
	noinstant: true,
	render () {
		return (
			<div>
				<md cn={md.cn} us={md.us} />
				<Basic />
				<api>
          <CN slot="cn" />
        </api>
			</div>
		)
	}
}
</script>
