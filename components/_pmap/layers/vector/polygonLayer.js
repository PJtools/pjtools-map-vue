/**
 * @文件说明: Layers.PolygonLayer 矢量面图层
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-25 11:04:47
 */

import BasicLayerClass, { defaultVectorLayerOptions, defaultVectorBasicOptions } from './basicLayer';
import deepmerge from 'deepmerge';
import hat from 'hat';
import cloneDeep from 'lodash/cloneDeep';
import LineLayer from './lineLayer';
import { isBooleanTrue } from '../../../_util/methods-util';

const defaultLayerOptions = deepmerge(defaultVectorLayerOptions, {
  paint: {
    'fill-color': 'rgba(255, 156, 110, 0.45)',
    'fill-opacity': 1,
    'fill-antialias': true,
    'fill-outline-color': 'rgba(255, 255, 255, 0)',
    'line-color': 'rgba(250, 84, 28, 0.8)',
  },
  metadata: {
    layerTypeName: 'PolygonLayer',
  },
});

const defaultOptions = {
  ...defaultVectorBasicOptions,
  // 是否开启外边线模式
  outline: false,
};

const _outlineLayer = Symbol('outlineLayer');

class PolygonLayer extends BasicLayerClass {
  // 外边线图层实现对象
  get outlineLayer() {
    return this[_outlineLayer] || null;
  }

  constructor(iMapApi, id, layerOptions = {}, options = {}) {
    const opts = deepmerge.all([{}, defaultOptions, options]);
    opts.outline = !!isBooleanTrue(opts.outline);
    opts.opacityPaints = ['fill-opacity'];
    // 合并原生Layer图层属性
    !opts.outline && (defaultLayerOptions.paint['fill-color'] = defaultLayerOptions.paint['line-color']);
    const layer = deepmerge.all([{}, defaultLayerOptions, layerOptions]);
    layer.type = 'fill';
    // 继承矢量图层基类
    !id && (id = hat());
    let layerGroupId = null;
    if (opts.outline) {
      layerGroupId = opts.layerGroupId || `${id}.polygon_layergroup`;
      opts.layerGroupId = layerGroupId;
    }
    super(iMapApi, id, layer, opts);

    // 判断是否渲染外边线，则添加线图层
    if (opts.outline) {
      const outlineLayerOptions = cloneDeep(layer);
      outlineLayerOptions.metadata.layerTypeName && delete outlineLayerOptions.metadata.layerTypeName;
      outlineLayerOptions.type = 'line';
      // 获取填充面图层的数据源
      const fillLayer = this.iMapApi.getLayer(id, opts.layerGroupId);
      fillLayer && fillLayer.source && (outlineLayerOptions.source = fillLayer.source);
      // 转换外边线图层的参数选项
      const outlineOptions = cloneDeep(opts);
      outlineOptions.opacityPaints && delete outlineOptions.opacityPaints;
      outlineOptions.data && delete outlineOptions.data;
      const outlineLayer = new LineLayer(iMapApi, `${id}.outline`, outlineLayerOptions, outlineOptions);
      this[_outlineLayer] = outlineLayer;
    }
  }

  /**
   * 设置图层的整体透明度
   * @param {Number} opacity 待设定的透明度
   */
  setOpacity(opacity) {
    super.setOpacity(opacity, ['fill-opacity']);
  }

  /**
   * 获取矢量面的填充颜色属性
   */
  getColor() {
    return this.getPaint('fill-color');
  }

  /**
   * 设置矢量面的填充颜色属性
   * @param {String} color 待设定的颜色值
   */
  setColor(color) {
    color && this.setPaint('fill-color', color);
  }

  /**
   * 获取矢量面的外边线颜色属性
   */
  getOutlineColor() {
    if (this.outlineLayer) {
      return this.outlineLayer.getColor();
    }
    return null;
  }

  /**
   * 设置矢量面的外边线颜色属性
   * @param {String} color 待设定的颜色值
   */
  setOutlineColor(color) {
    this.outlineLayer && this.outlineLayer.setColor(color);
  }

  /**
   * 获取矢量面的外边线宽度
   */
  getOutlineWidth() {
    if (this.outlineLayer) {
      return this.outlineLayer.getLineWidth();
    }
    return null;
  }

  /**
   * 设置矢量面的外边线宽度
   * @param {Number} width 待设定的线宽度
   */
  setOutlineWidth(width) {
    this.outlineLayer && this.outlineLayer.setLineWidth(width);
  }
}

export default PolygonLayer;
