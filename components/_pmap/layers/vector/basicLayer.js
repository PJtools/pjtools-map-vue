/**
 * @文件说明: 定义矢量Layers图层的基类
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-22 15:14:20
 */

import BasicMapApi from '../../util/basicMapApiClass';
import hat from 'hat';
import { isNumeric } from '../../../_util/methods-util';

// 矢量图层的原生MapboxGL默认参数
export const defaultVectorLayerOptions = {
  layout: {
    visibility: 'visible',
  },
  metadata: {
    layerType: 'VectorLayer',
  },
};

// 矢量图层的基础扩展参数
export const defaultVectorBasicOptions = {
  // 是否添加指定图层前
  beforeId: null,
  // 是否添加到图层组中
  layerGroupId: null,
  // 图层透明度
  opacity: 1,
};

const _id = Symbol('id');
const _opacity = Symbol('opacity');
const _turf = Symbol('turf');
const _initLayerOptions = Symbol('initLayerOptions');
const _options = Symbol('options');
const _mapLayer = Symbol('mapLayer');

class BasicLayerClass extends BasicMapApi {
  get id() {
    return this[_id];
  }

  get turf() {
    return this[_turf];
  }

  // 初始原生图层参数
  get layerOptions() {
    return this[_initLayerOptions];
  }

  // 图层参数选项
  get options() {
    return this[_options];
  }

  // 图层到地图中的实例对象
  get mapLayer() {
    return this[_mapLayer] || null;
  }

  // 图层整体透明度
  get opacity() {
    return this[_opacity];
  }
  set opacity(value) {
    this[_opacity] = getCheckOpacity(value);
  }

  constructor(iMapApi, id, layerOptions, options) {
    super(iMapApi);

    this[_turf] = iMapApi && iMapApi.exports && iMapApi.exports.turf;
    this[_id] = id || hat();
    layerOptions.id = this[_id];
    this[_initLayerOptions] = layerOptions;
    this[_options] = options;
    this.opacity = (options && options.opacity) || 1;

    // 添加图层到地图Map中
    if (iMapApi) {
      // 判断是否添加图层组
      if (this[_options].layerGroupId) {
        this[_mapLayer] = iMapApi.addLayerToGroup(this[_options].layerGroupId, layerOptions, this[_options].beforeId);
      } else {
        this[_mapLayer] = iMapApi.addLayer(layerOptions, this[_options].beforeId);
      }
      // 判断是否图层已存在
      if (!this[_mapLayer]) {
        if (this[_options].layerGroupId) {
          this[_mapLayer] = iMapApi.getLayer(this[_id], this[_options].layerGroupId);
        } else {
          this[_mapLayer] = iMapApi.getLayer(this[_id]);
        }
        if (this[_mapLayer]) {
          console.error(`图层[${this[_id]}]已存在，无需重复添加图层.`);
        } else {
          console.error(`图层[${this[_id]}]添加失败，请核查图层参数选项是否有误.`);
        }
      }
    }
  }

  // 获取指定名称的Paint属性
  getPaint(key) {
    const map = this.iMapApi.map;
    return map.getPaintProperty(this.id, key);
  }

  // 设置指定名称的Paint属性
  setPaint(key, value, options = {}) {
    const map = this.iMapApi.map;
    map.setPaintProperty(this.id, key, value, options);
  }
}

export default BasicLayerClass;

// 验证不透明度是否正确并纠正返回正确的数值
export const getCheckOpacity = function(opacity) {
  let _value = isNumeric(opacity) ? Number(opacity) : 1;
  _value > 1 && (_value = 1);
  _value < 0 && (_value = 0);
  return _value;
};
