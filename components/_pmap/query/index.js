/**
 * @文件说明: 构建Map.Query地图Web GIS服务查询对象
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-27 21:50:00
 */

import BasicMapApi from '../util/basicMapApiClass';
import assign from 'lodash/assign';
import { isHttpUrl, isBooleanFlase } from '../../_util/methods-util';
import WFS from './wfs';
import ArcgisWFS from './arcgisWFS';
import GeoQuery from './geoQuery';
import ArcgisQuery from './arcgisQuery';

// 内置地图Web GIS服务查询类型枚举名
export const mapQueryTypeKeys = ['WFS', 'ArcgisWFS', 'GeoQuery', 'ArcgisQuery'];

// 服务数据源的默认参数选项
export const defaultServicesQueryOptions = {
  // 是否拼接代理服务地址
  proxy: true,
  // 查询过滤条件，规则：['==', 'key', 'value'] 或 ['AND | OR | NOT', [], [], ...]
  filters: null,
  // 主键字段，返回要素作为Feature的ID，若为空，则以随机值替代
  idField: null,
};

// 效验Query查询服务的基础属性的有效性
const validateQueryOptions = (url, typeName, options, proxyURL = '') => {
  if (!url || !typeName) {
    console.error(`WebGIS Query查询服务[url]、[typeName]属性必需设定.`);
    return;
  }
  const errorUrlMsg = 'WebGIS Query查询服务[url]属性格式不是一个有效的链接地址.';
  if (!isHttpUrl(url)) {
    console.error(errorUrlMsg);
    return;
  }
  const opts = assign({}, defaultServicesQueryOptions, options);
  // 判断是否需要代理服务
  const isProxyUrl = isBooleanFlase(opts.proxy) ? false : true;
  let queryUrl = url;
  isProxyUrl && (queryUrl = `${proxyURL}${url}`);

  return { url: queryUrl, typeName, options: opts };
};

class Query extends BasicMapApi {
  /**
   * 获取Web GIS服务查询类型的名称
   * @readonly
   */
  get typeKeys() {
    return mapQueryTypeKeys;
  }

  /**
   * Query地图Web GIS服务
   * @param {MapApi} iMapApi 地图Api实例化对象
   */
  constructor(...arg) {
    super(...arg);
    const iMapApi = this.iMapApi;
    this.proxyURL = (iMapApi && iMapApi.proxyURL) || '';
  }

  /**
   * 发送WFS类型查询服务请求，获取标准GeoJSON格式的要素数据
   * @param {String} url 服务地址
   * @param {String} typeName 要素类型标识名
   * @param {Object} options 查询服务的参数选项
   */
  async fetchWFSTask(url, typeName, options = {}) {
    const result = validateQueryOptions(url, typeName, options, this.proxyURL);
    if (!result) {
      return null;
    }
    // 判断是否有GeoGlobe对象
    let GeoGlobe = (this.iMapApi && this.iMapApi.exports && this.iMapApi.exports.GeoGlobe) || null;
    if (!GeoGlobe) {
      options.GeoGlobe && (GeoGlobe = options.GeoGlobe);
    }
    if (!GeoGlobe) {
      console.error('WFS服务缺少前置GeoGlobe对象，请在[options.GeoGlobe]属性中赋值.');
      return null;
    }
    let query = new WFS(GeoGlobe);
    const promise = query.queryTask(result.url, result.typeName, result.options);
    query = null;
    return promise;
  }

  /**
   * 发送Arcgis WFS类型查询服务请求，获取标准GeoJSON格式的要素数据
   * @param {String} url 服务地址
   * @param {String} typeName 要素类型标识名
   * @param {Object} options 查询服务的参数选项
   */
  async fetchArcgisWFSTask(url, typeName, options = {}) {
    const result = validateQueryOptions(url, typeName, options, this.proxyURL);
    if (!result) {
      return null;
    }
    // 判断是否有GeoGlobe对象
    let GeoGlobe = (this.iMapApi && this.iMapApi.exports && this.iMapApi.exports.GeoGlobe) || null;
    if (!GeoGlobe) {
      options.GeoGlobe && (GeoGlobe = options.GeoGlobe);
    }
    if (!GeoGlobe) {
      console.error('Arcgis WFS服务缺少前置GeoGlobe对象，请在[options.GeoGlobe]属性中赋值.');
      return null;
    }
    let query = new ArcgisWFS(GeoGlobe);
    const promise = query.queryTask(result.url, result.typeName, result.options);
    query = null;
    return promise;
  }

  /**
   * 发送GeoQuery类型查询服务请求，获取标准GeoJSON格式的要素数据
   * @param {String} url 服务地址
   * @param {String} typeName 要素类型标识名
   * @param {Object} options 查询服务的参数选项
   */
  async fetchGeoQueryTask(url, typeName, options = {}) {
    const result = validateQueryOptions(url, typeName, options, this.proxyURL);
    if (!result) {
      return null;
    }
    let query = new GeoQuery();
    const promise = query.queryTask(result.url, result.typeName, result.options);
    query = null;
    return promise;
  }

  /**
   * 发送Arcgis Query类型查询服务请求，获取标准GeoJSON格式的要素数据
   * @param {String} url 服务地址
   * @param {String} typeName 要素类型标识名
   * @param {Object} options 查询服务的参数选项
   */
  async fetchArcgisQueryTask(url, typeName, options = {}) {
    const result = validateQueryOptions(url, typeName, options, this.proxyURL);
    if (!result) {
      return null;
    }
    let query = new ArcgisQuery();
    // Arcgis Query接口无需代理服务
    const promise = query.queryTask(result.url.replace(this.proxyURL || '', ''), result.typeName, result.options);
    query = null;
    return promise;
  }

  /**
   * 根据对应内置的Web GIS Service服务查询类型发送请求，获取标准GeoJSON格式的要素数据
   * @param {String} type 内置Web GIS Service查询服务类型
   * @param {String} url 服务地址
   * @param {String} typeName 要素类型标识名
   * @param {Object} options 查询服务的参数选项
   */
  async fetchServicesTask(type, url, typeName, options = {}) {
    switch (type) {
      case 'WFS':
        return this.fetchWFSTask(url, typeName, options);
      case 'ArcgisWFS':
        return this.fetchArcgisWFSTask(url, typeName, options);
      case 'GeoQuery':
        return this.fetchGeoQueryTask(url, typeName, options);
      case 'ArcgisQuery':
        return this.fetchArcgisQueryTask(url, typeName, options);
      default:
        return null;
    }
  }

  /**
   * 根据配置方案的查询分析服务Key名获取Web GIS Service服务查询对象，并发送请求获取要素数据
   * @param {String} key 配置方案的查询服务项Key名
   * @param {Object} options 查询服务的参数选项
   */
  async fetchServicesTaskByKey(key, options = {}) {
    if (this.iMapApi && key) {
      const service = this.iMapApi.getMapQueryServiceByKey(key);
      if (service) {
        const opts = assign({}, service.options, options);
        return this.fetchServicesTask(service.type, service.url, service.featureType, opts);
      }
    } else {
      console.error('地图的静态Query对象暂不支持该函数接口.');
    }
    return null;
  }
}

export default Query;
