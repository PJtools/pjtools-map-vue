/**
 * @文件说明: 构建Map.Providers互联网地图服务源对象
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-19 21:10:33
 */

import BasicMapApi from '../util/basicMapApiClass';
import Tianditu, { tdtLayersTypes } from './tianditu';

// 内置互联网地图服务源的类型枚举名
export const providersLayersTypes = {
  tianditu: tdtLayersTypes,
};

class Providers extends BasicMapApi {
  /**
   * 获取互联网地图服务源名称
   * @readonly
   */
  get keys() {
    return Object.keys(providersLayersTypes);
  }

  /**
   * Providers地图服务源
   * @param {MapApi} iMapApi 地图Api实例化对象
   */
  constructor(...arg) {
    super(...arg);
  }

  /**
   * 获取天地图在线服务源的图层数据集合
   * @param {Object} options 天地图服务源的参数选项
   */
  getTianditu(options = {}) {
    let tianditu = new Tianditu(this.iMapApi);
    const layers = tianditu.getLayers(options);
    tianditu = null;
    return layers;
  }

  /**
   * 根据对应内置的服务源Key名获取服务源图层数据
   * @param {String} key 内置服务源Key名
   * @param {Object} options 服务源的参数选项
   */
  getProvidersLayers(key, options = {}) {
    switch (key) {
      case 'tianditu':
        return this.getTianditu(options);
      default:
        return null;
    }
  }
}

export default Providers;
