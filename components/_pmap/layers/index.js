/**
 * @文件说明: 构建Map.Layers地图图层对象
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-22 14:50:56
 */

import BasicMapApi from '../util/basicMapApiClass';
import BackgroundLayer from './vector/backgroundLayer';
import CirclePointLayer from './vector/circlePointLayer';
import LineLayer from './vector/lineLayer';
import PolygonLayer from './vector/polygonLayer';
import FillExtrusionLayer from './vector/fillExtrusionLayer';

class Layers extends BasicMapApi {
  /**
   * 实例背景色图层到地图Map中
   * @param {string} id 图层名称
   * @param {Object} layerOptions 原生MapboxGL图层的参数选项
   * @param {Object} options 图层参数选项
   */
  addBackgroundLayer(id, layerOptions = {}, options = {}) {
    return new BackgroundLayer(this.iMapApi, id, layerOptions, options);
  }

  /**
   * 实例圆点图层到地图Map中
   * @param {string} id 图层名称
   * @param {Object} layerOptions 原生MapboxGL图层的参数选项
   * @param {Object} options 图层参数选项
   */
  addCirclePointLayer(id, layerOptions = {}, options = {}) {
    return new CirclePointLayer(this.iMapApi, id, layerOptions, options);
  }

  /**
   * 实例线图层到地图Map中
   * @param {string} id 图层名称
   * @param {Object} layerOptions 原生MapboxGL图层的参数选项
   * @param {Object} options 图层参数选项
   */
  addLineLayer(id, layerOptions = {}, options = {}) {
    return new LineLayer(this.iMapApi, id, layerOptions, options);
  }

  /**
   * 实例面图层到地图Map中
   * @param {string} id 图层名称
   * @param {Object} layerOptions 原生MapboxGL图层的参数选项
   * @param {Object} options 图层参数选项
   */
  addPolygonLayer(id, layerOptions = {}, options = {}) {
    return new PolygonLayer(this.iMapApi, id, layerOptions, options);
  }

  /**
   * 实例3D填充图层到地图Map中
   * @param {string} id 图层名称
   * @param {Object} layerOptions 原生MapboxGL图层的参数选项
   * @param {Object} options 图层参数选项
   */
  addFillExtrusionLayer(id, layerOptions = {}, options = {}) {
    return new FillExtrusionLayer(this.iMapApi, id, layerOptions, options);
  }
}

export default Layers;
