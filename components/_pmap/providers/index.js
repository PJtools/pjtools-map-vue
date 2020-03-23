/**
 * @文件说明: 构建Map.Providers互联网地图服务源对象
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-19 21:10:33
 */

import BasicMapApi from '../util/basicMapApiClass';
import Tianditu, { tdtLayersTypes, tdtMapOptions } from './tianditu';
import Baidu, { bdLayersTypes, bdMapOptions } from './baidu';
import OSM, { osmLayersTypes, osmMapOptions } from './osm';
import Bing, { bingLayersTypes, bingMapOptions } from './bing';

// 内置互联网地图服务源的类型枚举名
export const providersLayersTypes = {
  tianditu: tdtLayersTypes,
  baidu: bdLayersTypes,
  osm: osmLayersTypes,
  bing: bingLayersTypes,
};

// 内置互联网地图服务源的Map限制Options
export const providersMapOptions = {
  tianditu: tdtMapOptions,
  baidu: bdMapOptions,
  osm: osmMapOptions,
  bing: bingMapOptions,
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
   * @param {Object} options 服务源的参数选项
   */
  getTianditu(options = {}) {
    let tianditu = new Tianditu(this.iMapApi);
    const layers = tianditu.getLayers(options);
    tianditu = null;
    return layers;
  }

  /**
   * 获取百度在线服务源的图层数据集合
   * @param {Object} options 服务源的参数选项
   */
  getBaidu(options = {}) {
    let baidu = new Baidu(this.iMapApi);
    const layers = baidu.getLayers(options);
    baidu = null;
    return layers;
  }

  /**
   * 添加百度的交通实时路况的图层
   * @param {String} id 图层Id名称
   */
  addBaiduTrafficLayer(id, beforeId) {
    let baidu = new Baidu(this.iMapApi);
    const layer = baidu.getTrafficLayer(id);
    baidu = null;
    return this.iMapApi.addLayer(layer, beforeId);
  }

  /**
   * 获取OSM在线服务源的图层数据集合
   * @param {Object} options 服务源的参数选项
   */
  getOSM(options = {}) {
    let osm = new OSM(this.iMapApi);
    const layers = osm.getLayers(options);
    osm = null;
    return layers;
  }

  /**
   * 获取Bing在线服务源的图层数据集合
   * @param {Object} options 服务源的参数选项
   */
  getBing(options = {}) {
    let bing = new Bing(this.iMapApi);
    const layers = bing.getLayers(options);
    bing = null;
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
      case 'baidu':
        return this.getBaidu(options);
      case 'osm':
        return this.getOSM(options);
      case 'bing':
        return this.getBing(options);
      default:
        return null;
    }
  }
}

export default Providers;
