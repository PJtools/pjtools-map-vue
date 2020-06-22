<cn>
#### 插槽模板Attribution属性信息
通过配置文件初始化渲染Attribution属性信息控件。
</cn>

<us>
#### slots
xx.
</us>

```tpl
<template>
	<pj-map bordered height="480" config="../MapConfig/examples/attribution.json">
		<template slot="controls.attribution">
			<span>PJtools © Hi，我是插槽模板的内容.</span>
		</template>
	</pj-map>
</template>
```
