/**
 * @文件说明: Layers.BackgroundLayer 背景色矢量图层
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-22 15:01:49
 */

import BasicLayerClass, { defaultVectorLayerOptions, defaultVectorBasicOptions, overwriteArrayMerge } from './basicLayer';
import deepmerge from 'deepmerge';

const defaultLayerOptions = deepmerge(
  defaultVectorLayerOptions,
  {
    paint: {
      'background-color': 'rgba(0, 0, 0, 1)',
      'background-opacity': 1,
    },
    metadata: {
      layerTypeName: 'BackgroundLayer',
    },
  },
  {
    arrayMerge: overwriteArrayMerge,
  },
);

const defaultOptions = {
  ...defaultVectorBasicOptions,
};

class BackgroundLayer extends BasicLayerClass {
  constructor(iMapApi, id, layerOptions = {}, options = {}) {
    const opts = deepmerge.all([{}, defaultOptions, options || {}], {
      arrayMerge: overwriteArrayMerge,
    });
    opts.opacityPaints = ['background-opacity'];
    // 合并原生Layer图层属性
    const layer = deepmerge.all([{}, defaultLayerOptions, layerOptions || {}], {
      arrayMerge: overwriteArrayMerge,
    });
    layer.type = 'background';
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
    super.setOpacity(opacity, ['background-opacity']);
  }

  /**
   * 获取图层的背景色
   */
  getColor() {
    return this.getPaint('background-color');
  }

  /**
   * 设置图层的背景色
   * @param {String} color 待设定的背景色
   */
  setColor(color) {
    color && this.setPaint('background-color', color);
  }
}

export default BackgroundLayer;
