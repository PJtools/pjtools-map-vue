/**
 * @文件说明: 构建地图Marker标注接口对象
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-11 16:50:28
 */

import assign from 'lodash/assign';
import findIndex from 'lodash/findIndex';
import omit from 'omit.js';
import BasicMapApi from '../util/basicMapApiClass';
import { getPrefixCls } from '../../_util/methods-util';
import { ElementWrapper } from '../../map/components';

const defaultMarkerOptions = {
  // 标注的内容插槽
  slots: null,
  // 标注容器的Class类名
  className: null,
  // 标注容器的Style样式
  style: null,
  // 标注Vue组件的自定义数据
  data: null,
  // 标注的分组Id
  groupId: null,
  // 标注定位到坐标点的位置
  anchor: 'center',
  // 标注的相对偏移量
  offset: [0, 0],
  // 是否启用拖拽移动
  draggable: false,
  // 标注的颜色，当采用默认标注时有效
  color: '#1890ff',
};

const _map = Symbol('map');
const _markers = Symbol('markers');
const _markersGroup = Symbol('markersGroup');

class Marker extends BasicMapApi {
  constructor(iMapApi) {
    super(iMapApi);

    // 地图Map对象
    this[_map] = iMapApi && iMapApi.map;
    // 定义地图的Marker对象存储器
    this[_markers] = {};
    // 定义地图的Marker分组对象存储器
    this[_markersGroup] = {};
  }

  /**
   * 获取所有创建的Marker对象
   */
  get markers() {
    const keys = Object.keys(this[_markers]);
    return keys.map(key => this[_markers][key]);
  }

  /**
   * 动态创建Vue组件版的Marker标注对象
   * @param {String} id 标注的唯一Id名
   * @param {Array} coordinates 标注的坐标点
   * @param {Object} options 标注的参数选项
   */
  add(id, coordinates, options = {}) {
    const { mapboxgl } = this.iMapApi.exports;
    const opts = assign({}, defaultMarkerOptions, options || {});

    // 创建Marker的Element对象
    const element = document.createElement('div');
    opts.element = element;
    // 实例化Marker对象
    const markerOptions = omit(opts, ['className', 'style', 'slots', 'data', 'groupId']);
    const marker = new mapboxgl.Marker(markerOptions);
    marker.id = id;
    element.setAttribute('data-id', id);
    marker.setLngLat(coordinates);
    // 添加Marker到地图
    marker.addTo(this[_map]);

    // 创建组件包的Props属性
    const props = {};
    props.getContainer = () => marker.getElement();
    props.iMapApi = this.iMapApi;
    props.type = 'marker';
    const prefixCls = getPrefixCls('map');
    props.class = [`${prefixCls}-marker`];
    opts.className && props.class.push(opts.className);
    opts.style && (props.style = opts.style);
    opts.slots && (props.slots = opts.slots);
    props.vProps = { marker, data: opts.data || null };
    // 创建Vue组件包实例
    ElementWrapper.newInstance(props, instance => {
      marker._instance = instance;
    });
    // 删除部分原生方法
    marker.addTo && (marker.addTo = () => null);

    // 存储当前实例的Marker对象
    this[_markers][id] = marker;
    // 判断是否对Marker标识分组
    opts.groupId && this.addMarkerToGroup(marker.id, opts.groupId);

    return marker;
  }

  /**
   * 获取指定Id的Marker标注对象
   * @param {String} id 标注的唯一Id名
   */
  get(id) {
    return id && this[_markers] && this[_markers][id];
  }

  /**
   * 将指定Id的Marker标注添加到分组队列中
   * @param {String} id 标注的唯一Id名
   * @param {String} groupId 分组的唯一Id名
   */
  addMarkerToGroup(id, groupId) {
    if (!id || !groupId) {
      return;
    }
    const marker = this.get(id);
    if (!marker) {
      console.error(`指定Id：[${id}]Marker标注不存在.`);
      return;
    }
    // 判断是否Marker标注已设定分组名
    if (marker._groupid) {
      this.removeMarkerToGroup(id, marker._groupid);
    }
    // 将Marker添加到指定Id分组
    marker._groupid = groupId;
    !this[_markersGroup][groupId] && (this[_markersGroup][groupId] = []);
    this[_markersGroup][groupId].push(marker);
  }

  /**
   * 获取指定Id的分组下的所有Marker标注
   * @param {String} id 标注的唯一Id名
   */
  getGroup(id) {
    return id && this[_markersGroup] && this[_markersGroup][id];
  }

  /**
   * 将指定Id的Marker标注从分组队列中移除
   * @param {String} id 标注的唯一Id名
   * @param {String} groupId 分组的唯一Id名
   */
  removeMarkerToGroup(id, groupId) {
    if (!id || !groupId) {
      return;
    }
    // 在分组中查找指定Id的Marker标注的索引
    const markersGroup = this[_markersGroup][groupId];
    const index = findIndex(markersGroup, { id });
    // 移除Marker标注的分组信息
    if (index >= 0) {
      markersGroup.splice(index, 1);
      // 判断分组对象是否已经清空
      if (!markersGroup.length) {
        delete this[_markersGroup][groupId];
      }
    }
  }

  /**
   * 删除指定Id的Marker标注对象
   * @param {String} id 标注的唯一Id名
   */
  remove(id) {
    const marker = this.get(id);
    if (marker) {
      // 判断是否有Marker分组信息
      if (marker._groupid) {
        this.removeMarkerToGroup(id, marker._groupid);
      }
      // 移除Marker的Vue组件对象
      marker._instance && marker._instance.destroy();
      // 移除地图的Marker对象
      marker.remove();
      // 移除Marker的存储对象记录
      if (this[_markers][id]) {
        delete this[_markers][id];
      }
    }
    console.log(this);
  }

  /**
   * 删除指定Id的分组的所有Marker标注对象
   * @param {String} id 分组的唯一Id名
   */
  removeGroup(id) {
    if (!id) {
      return;
    }
    // 查找指定Id分组的所有Marker标注，并循环删除
    const markersGroup = this[_markersGroup][id];
    if (markersGroup && markersGroup.length) {
      for (let i = markersGroup.length - 1; i >= 0; i--) {
        const marker = markersGroup[i];
        this.remove(marker.id);
      }
    }
  }

  /**
   * 清空所有的Marker标注对象
   */
  removeAll() {
    if (this.markers && this.markers.length) {
      for (let i = this.markers.length - 1; i >= 0; i--) {
        const marker = this.markers[i];
        this.remove(marker.id);
      }
    }
  }
}

export default Marker;
