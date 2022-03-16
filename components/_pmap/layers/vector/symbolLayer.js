/**
 * @文件说明: Layers.SymbolLayer 矢量符号图层
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-09 17:27:55
 */

import BasicLayerClass, { defaultVectorLayerOptions, defaultVectorBasicOptions, overwriteArrayMerge } from './basicLayer';
import deepmerge from 'deepmerge';
import { isEmpty, isBooleanTrue } from '../../../_util/methods-util';

const defaultLayerOptions = deepmerge(
  defaultVectorLayerOptions,
  {
    paint: {
      'icon-color': 'rgba(0, 0, 0, 1)',
      'icon-halo-blur': 0,
      'icon-halo-color': 'rgba(0, 0, 0, 0)',
      'icon-halo-width': 0,
      'icon-opacity': 1,
      'icon-translate': [0, 0],
      'text-color': 'rgba(0, 0, 0, 1)',
      'text-halo-blur': 0,
      'text-halo-color': 'rgba(0, 0, 0, 0)',
      'text-halo-width': 0,
      'text-opacity': 1,
      'text-translate': [0, 0],
    },
    layout: {
      'symbol-placement': 'point',
      'icon-allow-overlap': false,
      'icon-anchor': 'center',
      'icon-ignore-placement': false,
      'icon-keep-upright': false,
      'icon-offset': [0, 0],
      'icon-optional': false,
      'icon-padding': 0,
      'icon-rotate': 0,
      'icon-size': 1,
      'icon-text-fit': 'none',
      'text-allow-overlap': false,
      'text-anchor': 'center',
      'text-ignore-placement': false,
      'text-justify': 'center',
      'text-keep-upright': true,
      'text-line-height': 1.2,
      'text-max-angle': 45,
      'text-max-width': 50,
      'text-offset': [0, 0],
      'text-optional': false,
      'text-padding': 0,
      'text-radial-offset': 0,
      'text-rotate': 0,
      'text-size': 16,
      'text-transform': 'none',
    },
    metadata: {
      layerTypeName: 'SymbolLayer',
    },
  },
  {
    arrayMerge: overwriteArrayMerge,
  },
);

const defaultOptions = {
  ...defaultVectorBasicOptions,
};

class SymbolLayer extends BasicLayerClass {
  constructor(iMapApi, id, layerOptions = {}, options = {}) {
    const opts = deepmerge.all([{}, defaultOptions, options || {}], {
      arrayMerge: overwriteArrayMerge,
    });
    opts.opacityPaints = ['icon-opacity', 'text-opacity'];
    // 合并原生Layer图层属性
    const layer = deepmerge.all([{}, defaultLayerOptions, layerOptions || {}], {
      arrayMerge: overwriteArrayMerge,
    });
    layer.type = 'symbol';
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
    super.setOpacity(opacity, ['icon-opacity', 'text-opacity']);
  }
}

export default SymbolLayer;

/**
 * 扩展文本矢量图层
 */
export class TextSymbolLayer extends SymbolLayer {
  constructor(iMapApi, id, layerOptions = {}, options = {}) {
    !layerOptions && (layerOptions = {});
    // 设置文本内容
    if (options && options.text) {
      !layerOptions.layout && (layerOptions.layout = {});
      layerOptions.layout['text-field'] = options.text;
    }
    // 设置文本大小
    if (options && !isEmpty(options.size)) {
      !layerOptions.layout && (layerOptions.layout = {});
      layerOptions.layout['text-size'] = options.size;
    }
    // 设置矢量符号碰撞显示
    if (options && isBooleanTrue(options.overlap)) {
      !layerOptions.layout && (layerOptions.layout = {});
      layerOptions.layout['text-allow-overlap'] = options.overlap;
      layerOptions.layout['text-ignore-placement'] = options.overlap;
    }
    // 继承矢量符号基类
    super(iMapApi, id, layerOptions, options);
  }

  /**
   * 获取矢量文本的颜色属性
   */
  getColor() {
    return this.getPaint('text-color');
  }

  /**
   * 设置矢量文本的颜色属性
   * @param {String} color 待设定的颜色值
   */
  setColor(color) {
    color && this.setPaint('text-color', color);
  }

  /**
   * 获取矢量文本的字体大小
   */
  getSize() {
    return this.getLayout('text-size');
  }

  /**
   * 设置矢量文本的字体大小
   * @param {Number} size 待设定的字体大小
   */
  setSize(size) {
    !isEmpty(size) && this.setLayout('text-size', size);
  }

  /**
   * 获取矢量文本的外描边
   */
  getHalo() {
    return {
      width: this.getPaint('text-halo-width'),
      color: this.getPaint('text-halo-color'),
      blur: this.getPaint('text-halo-blur'),
    };
  }

  /**
   * 设置矢量文本的外描边样式
   * @param {Object} options 外描边的参数选项，包括：[ width | color | blur ]
   */
  setHalo(options = {}) {
    !options && (options = {});
    !isEmpty(options.width) && this.setPaint('text-halo-width', options.width);
    !isEmpty(options.color) && this.setPaint('text-halo-color', options.color);
    !isEmpty(options.blur) && this.setPaint('text-halo-blur', options.blur);
  }

  /**
   * 设置矢量文本是否碰撞显示
   * @param {Boolean} overlap 是否允许碰撞强制显示
   */
  setOverlap(overlap = false) {
    overlap = !!isBooleanTrue(overlap);
    this.setLayout('text-allow-overlap', overlap);
    this.setLayout('text-ignore-placement', overlap);
  }

  /**
   * 设置矢量文本的显示文本
   * @param {String} text 待设置的矢量文本
   */
  setText(text) {
    !isEmpty(text) && this.setLayout('text-field', text);
  }
}

/**
 * 扩展图标矢量图层
 */
export class IconSymbolLayer extends SymbolLayer {
  constructor(iMapApi, id, layerOptions = {}, options = {}) {
    !layerOptions && (layerOptions = {});
    // 设置图标
    if (options && options.icon) {
      !layerOptions.layout && (layerOptions.layout = {});
      layerOptions.layout['icon-image'] = options.icon;
    }
    // 设置图标的大小
    if (options && !isEmpty(options.size)) {
      !layerOptions.layout && (layerOptions.layout = {});
      layerOptions.layout['icon-size'] = options.size;
    }
    // 设置矢量符号碰撞显示
    if (options && isBooleanTrue(options.overlap)) {
      !layerOptions.layout && (layerOptions.layout = {});
      layerOptions.layout['icon-allow-overlap'] = options.overlap;
      layerOptions.layout['icon-ignore-placement'] = options.overlap;
    }
    // 继承矢量符号基类
    super(iMapApi, id, layerOptions, options);
  }

  /**
   * 获取矢量图标的尺寸大小
   */
  getSize() {
    return this.getLayout('icon-size');
  }

  /**
   * 设置矢量图标的尺寸大小
   * @param {Number} size 待设定的尺寸大小
   */
  setSize(size) {
    !isEmpty(size) && this.setLayout('icon-size', size);
  }

  /**
   * 设置矢量图标是否碰撞显示
   * @param {Boolean} overlap 是否允许碰撞强制显示
   */
  setOverlap(overlap = false) {
    overlap = !!isBooleanTrue(overlap);
    this.setLayout('icon-allow-overlap', overlap);
    this.setLayout('icon-ignore-placement', overlap);
  }

  /**
   * 设置矢量图标
   * @param {String} icon 待设置的矢量图标
   */
  setIcon(icon) {
    icon && this.setLayout('icon-image', icon);
  }
}
