/**
 * @文件说明: Services.XYZTile XYZ瓦片服务
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-22 21:34:04
 */

import assign from 'lodash/assign';
import { isBooleanFlase, isArray } from '../../../_util/methods-util';
import { defaultServicesSourceOptions, defaultServicesLayerOptions, getServicesLayerSource, getServicesBaseLayer } from './index';

class XYZTile {
  constructor(iMapApi) {
    this.iMapApi = iMapApi;
    this.exports = iMapApi && iMapApi.exports ? iMapApi.exports : {};
    this.proxyURL = iMapApi.proxyURL || '';
    this.options = {
      ...defaultServicesSourceOptions,
      ...defaultServicesLayerOptions,
    };
  }

  /**
   * 获取解析XYZTile服务的图层对象
   * @param {String} id 图层Id名称
   * @param {String} name 图层Name名
   * @param {String} url 服务地址
   * @param {Object} options 解析服务的参数选项
   */
  getLayer(id, name = '', url, options = {}) {
    const opts = assign(this.options, options);
    // 获取图层对象
    const layer = getServicesBaseLayer(opts);
    layer.id = id;
    // 获取图层数据源
    const layerSource = getServicesLayerSource(opts);
    !layerSource.tileSize && (layerSource.tileSize = layerSource.defaultTileSize);
    // 实际服务源地址
    const isProxyUrl = isBooleanFlase(opts.proxy) ? false : true;
    const urls = isArray(url) ? url : [url];
    layerSource.tiles = urls.map(item => (isProxyUrl ? `${this.proxyURL}${item}` : item));
    layer.source = layerSource;
    // 存储图层的服务类型
    layer.metadata.serviceType = 'XYZTile';
    layer.metadata.serviceName = name || '';
    return layer;
  }
}

export default XYZTile;
