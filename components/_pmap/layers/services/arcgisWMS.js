/**
 * @文件说明: Services.ArcgisWMS - Arcgis WMS服务
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-26 21:47:23
 */

import assign from 'lodash/assign';
import { isBooleanFlase } from '../../../_util/methods-util';
import { defaultServicesSourceOptions, defaultServicesLayerOptions } from './index';
import { defaultServicesOptions, getWMSCapabilities, fetchWMSLayerStyles } from './wms';

/**
 * 解析Arcgis WMS类型的服务地址获取图层服务数据信息
 */
const fetchWMSCapabilities = (own, url, options) => {
  const { GeoGlobe } = own.exports;
  const isProxyUrl = isBooleanFlase(options.proxy) ? false : true;

  return new Promise((resolve, reject) => {
    let urlParams = '';
    let capabilitiesUrl = url;
    if (url.indexOf('?') !== -1) {
      const urlSplit = url.split('?');
      capabilitiesUrl = urlSplit[0];
      urlParams = urlSplit[1];
    }
    capabilitiesUrl.indexOf('/WMSServer') === -1 && (capabilitiesUrl += '/WMSServer');
    capabilitiesUrl.indexOf('/rest/services') !== -1 && (capabilitiesUrl = capabilitiesUrl.replace(/\/rest\/services/g, '/services'));
    urlParams && (capabilitiesUrl += `?${urlParams}`);
    capabilitiesUrl = `${capabilitiesUrl}${capabilitiesUrl.indexOf('?') === -1 ? '?' : '&'}SERVICE=WMS&REQUEST=GetCapabilities`;
    isProxyUrl && (capabilitiesUrl = `${own.proxyURL}${capabilitiesUrl}`);

    // 请求图层数据信息
    const errorMsg = `ArcgisWMS服务地址[ ${url} ]数据解析失败.`;
    GeoGlobe.Request.GET({
      url: capabilitiesUrl,
      success: data => {
        let opts = {};
        try {
          // 获取Arcgis WMS服务的Capabilities信息
          let capabilities = !data.responseXML || !data.responseXML.documentElement ? data.responseText : data.responseXML;
          const wmsOpts = getWMSCapabilities(capabilities, 'WMS_Capabilities', options, GeoGlobe);
          if (wmsOpts) {
            opts = assign({}, opts, wmsOpts);
          } else {
            console.error(errorMsg);
            reject();
          }
        } catch (e) {
          console.error(errorMsg);
          reject();
        }
        resolve(opts);
      },
      failure: () => {
        console.error(errorMsg);
        reject();
      },
    });
  });
};

class ArcgisWMS {
  constructor(iMapApi) {
    this.iMapApi = iMapApi;
    this.exports = iMapApi && iMapApi.exports ? iMapApi.exports : {};
    this.proxyURL = iMapApi.proxyURL || '';
    this.options = {
      ...defaultServicesSourceOptions,
      ...defaultServicesLayerOptions,
      ...defaultServicesOptions,
    };
  }

  /**
   * 获取解析Arcgis WMS服务的图层对象
   * @param {String} id 图层Id名称
   * @param {String} name 图层Name名
   * @param {String} url 服务地址
   * @param {Object} options 解析服务的参数选项
   */
  async getLayer(id, name = '', url, options = {}) {
    const opts = assign(this.options, options);
    // 获取服务信息
    const layerOptions = await fetchWMSCapabilities(this, url, opts);
    // 获取Arcgis WMS图层
    const layer = fetchWMSLayerStyles(this, id, url, layerOptions, { ...opts, name });
    layer.metadata.serviceType = 'ArcgisWMS';
    // 计算Arcgis WMS的数据源地址
    const isProxyUrl = isBooleanFlase(opts.proxy) ? false : true;
    let urlParams = '';
    let wmsUrl = layer.source.tiles[0];
    isProxyUrl && (wmsUrl = wmsUrl.replace(this.proxyURL, ''));
    if (wmsUrl.indexOf('?') !== -1) {
      const urlSplit = wmsUrl.split('?');
      wmsUrl = urlSplit[0];
      urlParams = urlSplit[1];
    }
    wmsUrl.indexOf('/WMSServer') === -1 && (wmsUrl += '/WMSServer');
    wmsUrl.indexOf('/rest/services') !== -1 && (wmsUrl = wmsUrl.replace(/\/rest\/services/g, '/services'));
    urlParams && (wmsUrl += `?${urlParams}`);
    isProxyUrl && (wmsUrl = `${this.proxyURL}${wmsUrl}`);
    layer.source.tiles = [wmsUrl];
    layer.metadata.template = wmsUrl;
    return layer;
  }
}

export default ArcgisWMS;
