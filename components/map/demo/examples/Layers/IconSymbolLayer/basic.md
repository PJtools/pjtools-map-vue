<cn>
#### IconSymbolLayer 符号图标图层
创建一个矢量IconSymbolLayer符号图标图层。
</cn>

<us>
#### basic
xx.
</us>

```tpl
<template>
	<pj-map bordered height="480" config="../MapConfig/examples/basic.json" @loaded="handleMapLoaded">
	</pj-map>
</template>

<script>
  export default {
		methods: {
			handleMapLoaded(iMapApi) {
				// 获取当前地图范围内随机多边形面
				const { turf } = iMapApi.exports;
				const bounds = iMapApi.getBounds();
				const points = turf.randomPoint(1, { bbox: [...bounds[0], ...bounds[1]] });

				// 示例的图标地址为BASE64是为防止网络请求问题，实际图标地址为HTTP链接或项目的相对路径
				const imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACzUlEQVRoQ+2ZS6hOURTHf3dmoiSlPEoeI4+JEWYG7gBlYiCUVwwYKAaUutdABsKEW8gjGSnJQMrEhEt5hMgAoSQzYmLi0V/7aN9zz9nnfHuv455T36rT7Xb2Xvv/W3utvffZ3wAdt4GO66cPkDCDQ8DhhP7qOjSRM/AbGE6AUACGJxpAUYyB+CtendsA0CvEP/FtAqgLMUZ82wCqIMaJ9wH0cgegwroHPAaeA7cTV4lQd42VbKqBQjLneQTYnTxKsQMzgHfAnIDIt8D8BiD+G4C03weWG0OYAYRSyNe8HzhuCJEH+ArcAjaUjKF03gxM9t9n+4Ag9HJehcBBw8LOA2Ra9gInczoUOAVQNqZffiMTwKZslyuAOQQcMZqFRgAybWVpdQNYZwRwF1jh+YpJoYdlRwmtSlqd8vYJmGkEcMxLi1iXI6GzUNkqUef8tBjwHwVkNnAQUDHKVHOXY5W7ftssAaY7URK2pETYS2CRezcVeAAsiIQYBQatALa4HT20IWY6VwJ33D8bgSuRAKqfUQuAi4AA6toFYLvXWAAC6cVOAPvUIRXgeuSqtAc47Sk+ABytSXAJ2Jq1TQH4AkypOWhRszXATe/FKuBUoCY+uD3onO8sFuAFsDBBvLp+BlYDTzw/k4C53vMLeAO8d8+P/JgxAOdzOZzC8dNFXen0OsZRDEDMOFV9lI6CuAY8rWqcmkK9+I9p+w14BTwDvgMzgGmAamSctWUG6oAWau0D1AmdUZv+DBgFMtpNJ2ZgF3CmBLHVALpIk3j97ek7pA2r0FknPgt8pwAUdQH41gkAP2XyKd96gHzKdAqgKGU6ARBKmdYDVKVMYwBV1+4xW6q+rPRNG/p51ayIdemkO54mLPTLpBnAzsC2ngr10d3UFfkxA5DzR8DSVLW9nG0sjxLZuFeB9Q1AlB1jTGcg061aWAssA2YZwIRqoOhqv7T9H41kpXBeXPYEAAAAAElFTkSuQmCC';
				// 动态添加Image图标
				iMapApi.loadImage('cat', imageUrl).then(() => {
					// 创建一个IconSymbol Layer图层
					const layer = iMapApi.Layers.addIconSymbolLayer('vec-layer-id', {
						layout: {
							'icon-image': 'cat',
							'icon-size': 0.6,
						}
					}, {
						data: points,
					});
					// 缩放到图层数据的合适级别
					layer.setLayerToMaxZoom();
				});
			},
		}
	}
</script>
```
