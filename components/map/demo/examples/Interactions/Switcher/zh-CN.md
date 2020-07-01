> **注意事项**：`Switcher`底图切换器为地图Map组件的内置嵌套子UI组件，因此，只有放在`Map`组件内部才会生效。

## API

### 属性

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| visible | 是否渲染组件，替代`v-if` | boolean | true |
| wrapClassName | 组件的外层容器Class类名 | string | - |
| wrapStyle | 组件的外层容器Style样式 | object | {} |
| position | 组件在地图中渲染的位置，可选项：`bottom-left` `bottom-right` `bottom` `top` `top-left` `top-right` `left` `right` | string | 'bottom-right' |
| offset | 组件相当渲染位置的偏移量，格式参考：`[0, 0]` | number[] | [0, 0] |
| className | 组件容器的Class类名 | string | - |
| itemWidth | 组件子项的容器宽度 | number | 64 |
| itemHeight | 组件子项的容器高度 | number | 48 |
| itemOffset | 子项在缩起状态下的相对偏移间距，单位：`px` | number | 5 |
| itemGutter | 子项在展开状态下的间隔距离，单位：`px` | number | 10 |
| data | 组件的数据源集合 | object[] | - |
| value(v-model) | 指定当前选中子项的Key值 | string | - |

### data 数据源属性

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| key | 数据项的唯一Key名（注意：当执行默认底图切换功能时，设定值需要与地图`mapBasicLayers`配置属性中一致才能生效） | string | - |
| label | 显示的文本名称 | string | - |
| image | 渲染的背景图片地址 | string | - |
| onActive | 选填项，激活选中时执行的响应事件 （注意：当不设置时，执行默认底图切换功能，反之，设定后则取消默认切换功能，采用执行设定的事件）| function | null |

### 事件

| 事件名称 | 说明 | 回调参数 |
| --- | --- | --- |
| change | 选中项变化时的回调函数 | Function(key) |
