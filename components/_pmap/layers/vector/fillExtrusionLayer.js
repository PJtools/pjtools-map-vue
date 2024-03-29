/**
 * @文件说明: Layers.FillExtrusionLayer 3D填充图层
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-25 15:35:15
 */

import BasicLayerClass, { defaultVectorLayerOptions, defaultVectorBasicOptions, overwriteArrayMerge } from './basicLayer';
import deepmerge from 'deepmerge';
import { isEmpty } from '../../../_util/methods-util';

const defaultLayerOptions = deepmerge(
  defaultVectorLayerOptions,
  {
    paint: {
      'fill-extrusion-base': 0,
      'fill-extrusion-color': 'rgba(170, 170, 170, 1)',
      'fill-extrusion-height': 0,
      'fill-extrusion-opacity': 0.9,
      'fill-extrusion-vertical-gradient': true,
    },
    metadata: {
      layerTypeName: 'FillExtrusionLayer',
    },
  },
  {
    arrayMerge: overwriteArrayMerge,
  },
);

const defaultOptions = {
  ...defaultVectorBasicOptions,
};

class FillExtrusionLayer extends BasicLayerClass {
  constructor(iMapApi, id, layerOptions = {}, options = {}) {
    const opts = deepmerge.all([{}, defaultOptions, options || {}], {
      arrayMerge: overwriteArrayMerge,
    });
    opts.opacityPaints = ['fill-extrusion-opacity'];
    // 合并原生Layer图层属性
    const layer = deepmerge.all([{}, defaultLayerOptions, layerOptions || {}], {
      arrayMerge: overwriteArrayMerge,
    });
    layer.type = 'fill-extrusion';
    // 继承矢量图层基类
    super(iMapApi, id, layer, opts);
    // 绑定图层实例对象
    this.mapLayer && (this.mapLayer._instance = this);
  }

  /**
   * 设置图层的整体透明度
   * @param {Number} opacity 待设定的透明度
   */
  setOpacity(opacity) {
    super.setOpacity(opacity, ['fill-extrusion-opacity']);
  }

  /**
   * 获取3D填充的颜色属性
   */
  getColor() {
    return this.getPaint('fill-extrusion-color');
  }

  /**
   * 设置3D填充的颜色属性
   * @param {String} color 待设定的颜色值
   */
  setColor(color) {
    color && this.setPaint('fill-extrusion-color', color);
  }

  /**
   * 获取3D填充的拉起高度
   */
  getHeight() {
    return this.getPaint('fill-extrusion-height');
  }

  /**
   * 设置3D填充的拉起高度
   * @param {Number} height 待设定的3D拉起高度
   */
  setHeight(height) {
    !isEmpty(height) && this.setPaint('fill-extrusion-height', height);
  }

  /**
   * 获取3D填充的基座高度（即离地高度）
   */
  getBaseHeight() {
    return this.getPaint('fill-extrusion-base');
  }

  /**
   * 设置3D填充的基座高度（即离地高度）
   * @param {Number} height 待设定的离地高度
   */
  setBaseHeight(height) {
    !isEmpty(height) && this.setPaint('fill-extrusion-base', height);
  }
}

export default FillExtrusionLayer;
