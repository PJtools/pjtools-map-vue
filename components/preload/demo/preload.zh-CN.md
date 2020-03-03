## API

### 全局方法
提供了全局配置和全局加载方法：

- `preload.config(options)`
- `preload.load(manifest, options)`
- `preload.get(id)`
- `preload.getAll()`

### preload.config - 设定全局配置

```js
this.$preload.config({
  baseUrl: `/`
});
```

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| baseUrl | 定义预加载的基础前缀路径 | string | '' |

### preload.load - 预加载异步请求资源文件 (注意：该方法返回是一个标准的Promise对象)

```js
this.$preload.load(
	[
		{ id: 'file.css', src: 'file.css', type: 'css' },
		{ id: 'file', src: 'file.js', type: 'javascript', exports: ['feedback'] }
	],
	{
		baseUrl: '/',
		onProgress: (percentage) => {},
		onFileload: (file) => {}
	}
).then((exports) => {
	// Todo...
}).catch((error) => {
	// Todo...
});
```
#### manifest - 资源清单List，支持文件类型：`CSS、Javascript`

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| id | `必填项`，资源文件的唯一Id名称 | string | - |
| src | `必填项`，资源文件的路径地址 | string | - |
| type | 资源文件的类型，支持类型：`css、javascript`，当未设定时会根据文件后缀名自动判定 | string | - |
| src | Javascript文件的输出对象，输出配置需匹配window对象下挂载的映射名 | string[] | - |

#### options - 预加载时的参数选项

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| baseUrl | 预加载的基础前缀路径，不会覆盖影响全局的`baseUrl`设定 | string | - |
| onProgress | 执行预加载文件清单时的进度回调，`percentage`范围`0-100` | Function(percentage) | - |
| onFileload | 执行单个文件加载完成时的回调 | Function(file) | - |

#### 事件

| 事件名称 | 说明 | 回调参数 |
| --- | --- | --- |
| then | `Promise.then` 执行资源清单中所有资源项加载完成的回调 | Function(exports) |
| catch | `Promise.catch` 捕获预加载资源清单过程中出现的失败回调 | Function(error) |

### preload.get - 获取`load`预加载异步完成后指定Id的资源输出对象

```js
const { feedback } = this.$preload.get('file');
```

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| id | 资源文件的唯一Id名称 | string | '' |

### preload.getAll - 获取`load`预加载异步完成后的全部资源输出对象

```js
const exports = this.$preload.getAll();
```
