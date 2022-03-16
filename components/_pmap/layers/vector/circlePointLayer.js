/**
 * @文件说明: Layers.CirclePointLayer 矢量圆点图层
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-22 18:14:54
 */

import BasicLayerClass, { defaultVectorLayerOptions, defaultVectorBasicOptions, overwriteArrayMerge } from './basicLayer';
import deepmerge from 'deepmerge';

const defaultLayerOptions = deepmerge(
  defaultVectorLayerOptions,
  {
    paint: {
      'circle-color': 'rgba(255, 216, 191, 0.9)',
      'circle-opacity': 1,
      'circle-radius': 5,
      'circle-blur': 0,
      'circle-stroke-color': 'rgba(250, 84, 28, 0.8)',
      'circle-stroke-opacity': 1,
      'circle-stroke-width': 2,
    },
    metadata: {
      layerTypeName: 'CirclePointLayer',
    },
  },
  {
    arrayMerge: overwriteArrayMerge,
  },
);

const defaultOptions = {
  ...defaultVectorBasicOptions,
};

class CirclePointLayer extends BasicLayerClass {
  constructor(iMapApi, id, layerOptions = {}, options = {}) {
    const opts = deepmerge.all([{}, defaultOptions, options || {}], {
      arrayMerge: overwriteArrayMerge,
    });
    opts.opacityPaints = ['circle-opacity', 'circle-stroke-opacity'];
    // 合并原生Layer图层属性
    const layer = deepmerge.all([{}, defaultLayerOptions, layerOptions || {}], {
      arrayMerge: overwriteArrayMerge,
    });
    layer.type = 'circle';
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
    super.setOpacity(opacity, ['circle-opacity', 'circle-stroke-opacity']);
  }

  /**
   * 获取圆点的半径大小
   */
  getRadius() {
    return this.getPaint('circle-radius');
  }

  /**
   * 设置圆点的半径大小
   * @param {Number} radius 圆点的半径大小
   */
  setRadius(radius) {
    radius && this.setPaint('circle-radius', radius);
  }
}

export default CirclePointLayer;
