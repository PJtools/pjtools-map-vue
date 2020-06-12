## API

通过设置内置Marker标注的管理接口可对`mapbox-gl`原生Marker标注进行管理及扩展，同时，支持Vue组件替代原生的`element`属性的内容替换。对于Marker标注需要进行事件绑定交互，推荐采用组件形式，在组件对象中用Vue开发模式进行。

`Marker`标注的管理接口统一挂接在`iMapApi`实例接口对象下，相关接口如下：

- #### iMapApi.addMarker(id, coordinates, options?)

	创建一个Marker标注实例并添加到地图Map中。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | Marker标注的全局唯一Id名称 | string |
	| coordinates | 标注的坐标点，参考格式：`[0, 0]` | number[] |
	| options | 标注的参数选项 | object | {} |

	options - 参数选项属性

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| slots | `Marker`标注的内容插槽，指定`Marker`标注内容模板`Slot`插槽名，注意：设置Vue插槽名称时，必须以`marker.`前缀进行命名，设置该属性时，省略前缀，直接传后面的命名即可 | string | null |
	| data | 当`Marker`标注采用`Slot`插槽时，可设置该属性，作为插槽作用域的数据传参 | any | null |
	| groupId | `Marker`标注的分组Id名称，当指定时则会在`Marker`标注实例对象上加上分组标记，进行分组管理，批量创建`Marker`时非常有用 | string | null |
	| color | 默认`Marker`标注时，可指定`Marker`标注颜色值 | string | '#1890ff' |
	| className | 设置`Marker`标注组件容器对象的Class类名 | string | null |
	| style | 设置`Marker`标注组件容器对象的Style样式 | object | {} |
	| draggable | 是否实例化支持拖拽移动的`Marker`标注 | boolean | false |
	| anchor | `Marker`标注相对坐标点的位置，具体枚举值参考`mapbox-gl`的Marker对象说明 | string | 'center' |
	| offset | 设置`Marker`标注相对坐标点的偏移量 | number[] | [0, 0] |

- #### iMapApi.getMarker(id)

	根据唯一Id名称获取地图Marker实例对象。（注意：获取的Marker实例对象是原生Marker对象，可进行部分场景的属性方法获取与设置。**不推荐直接使用。**）

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 标注的全局唯一Id名称 | string |

- #### iMapApi.getAllMarkers()

	获取所有的地图Marker实例对象。

- #### iMapApi.getMarkersByGroup(groupId)

	获取指定Id分组下所有的地图Marker实例对象集合。

- #### iMapApi.addMarkerToGroup(id, groupId)

	将指定Id的Marker标注添加到分组队列中。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 标注的全局唯一Id名称 | string |
	| groupId | 标注分组的唯一Id名 | string |

- #### iMapApi.removeMarkerToGroup(id, groupId)

	将指定Id的Marker标注从分组队列中移除。（**注意：该方法只是从分组队列中移除Marker对象，并不会销毁Marker对象。**）

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 标注的全局唯一Id名称 | string |
	| groupId | 标注分组的唯一Id名 | string |

- #### iMapApi.removeMarker(id)

	删除指定Id的Marker标注实例对象。（**注意：删除Marker对象请统一用封装的方法，不要直接使用原生Marker对象进行移除，会造成异常问题。**）

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| id | 标注的全局唯一Id名称 | string |

- #### iMapApi.removeMarkersGroup(groupId)

	删除指定Id分组的所有Marker标注实例对象。

	| 参数 | 说明 | 类型 | 默认值 |
	| --- | --- | --- | --- |
	| groupId | 标注分组的唯一Id名 | string |

- #### iMapApi.removeAllMarkers()

	删除所有的Marker标注实例对象。