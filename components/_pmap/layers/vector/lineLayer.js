/**
 * @文件说明: Layers.LineLayer 矢量线图层
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-25 10:05:46
 */

import BasicLayerClass, { defaultVectorLayerOptions, defaultVectorBasicOptions } from './basicLayer';
import deepmerge from 'deepmerge';
import { isEmpty } from '../../../_util/methods-util';

const defaultLayerOptions = deepmerge(defaultVectorLayerOptions, {
  paint: {
    'line-color': 'rgba(250, 84, 28, 0.8)',
    'line-opacity': 1,
    'line-width': 4,
    'line-blur': 0,
    'line-offset': 0,
    'line-gap-width': 0,
  },
  layout: {
    'line-cap': 'round',
    'line-join': 'round',
  },
  metadata: {
    layerTypeName: 'LineLayer',
  },
});

const defaultOptions = {
  ...defaultVectorBasicOptions,
};

class LineLayer extends BasicLayerClass {
  constructor(iMapApi, id, layerOptions = {}, options = {}) {
    const opts = deepmerge.all([{}, defaultOptions, options]);
    opts.opacityPaints = ['line-opacity'];
    // 合并原生Layer图层属性
    const layer = deepmerge.all([{}, defaultLayerOptions, layerOptions]);
    layer.type = 'line';
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
    super.setOpacity(opacity, ['line-opacity']);
  }

  /**
   * 获取矢量线的颜色属性
   */
  getColor() {
    return this.getPaint('line-color');
  }

  /**
   * 设置矢量线的颜色属性
   * @param {String} color 待设定的颜色值
   */
  setColor(color) {
    color && this.setPaint('line-color', color);
  }

  /**
   * 获取矢量线的宽度
   */
  getLineWidth() {
    return this.getPaint('line-width');
  }

  /**
   * 设置矢量线的宽度
   * @param {Number} width 待设定的线宽度
   */
  setLineWidth(width) {
    !isEmpty(width) && this.setPaint('line-width', width);
  }
}

export default LineLayer;
