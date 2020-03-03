<cn>
#### 预加载JS和CSS
异步加载JS、CSS文件队列。
</cn>

<us>
#### Preload Files
xx.
</us>

```tpl
<template>
	<ul>
		<li class="list-item">
			<span class="list-item-wrapper">
				<a-icon type="paper-clip" />
				<span>CSS文件：file.css</span>
			</span>
			<span v-if="fileCSSLoaded" :class="feedbackCssClass">
				<a-icon type="smile" />
				<span>样式渲染成功!</span>
			</span>
		</li>
		<li class="list-item">
			<span class="list-item-wrapper">
				<a-icon type="paper-clip" />
				<span>Javascript文件：file.js</span>
			</span>
			<span v-if="fileJsLoaded" class="feedback-warpper">
				<a-icon type="sound" />
				<span>反馈结果：<label id="feedbackResult"></label></span>
			</span>
		</li>
		<li class="footer-wrapper">
			<a-button type="primary" icon="sync" :loading="loading" @click="handlePreloadStart">预加载开始</a-button>
		</li>
	</ul>
</template>

<script>
  export default {
		data () {
			return {
				loading: false,
				fileCSSLoaded: false,
				fileJsLoaded: false
			}
		},
		computed: {
			feedbackCssClass () {
				return {
					'feedback-warpper': true,
					'feedback-success': !!this.fileCSSLoaded
				}
			}
		},
		created() {
			// 配置全局的基础路径前缀
			this.$preload.config({ baseUrl: '/static/Examples/' });
		},
		methods: {
			handlePreloadStart () {
				this.loading = true;
				// 开始预加载请求
				this.$preload.load([
					{ id: 'css', src: 'file.css', type: 'css' },
					{ id: 'js', src: 'file.js', type: 'javascript', exports: ['feedback'] }
				], {
					onFileload: (file) => {
						switch (file.id) {
							case 'css':
								this.fileCSSLoaded = true;
								break;
							case 'js':
								this.fileJsLoaded = true;
								break;
						}
					}
				}).then(({ feedback }) => {
					feedback && feedback.callback();
					this.loading = false;
				});
			}
		}
  };
</script>

<style scoped>
	.list-item {
		display: flex;
		margin-bottom: 8px;
	}
	.list-item-wrapper {
		width: 160px;
	}
	.feedback-warpper {
		margin-left: 12px;
	}
	.footer-wrapper {
		padding-top: 8px;
	}
</style>
```
