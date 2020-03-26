/**
 * @文件说明: Services.ArcgisWMTS - Arcgis WMTS服务
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-25 21:04:08
 */

import assign from 'lodash/assign';
import { isBooleanFlase } from '../../../_util/methods-util';
import { defaultServicesSourceOptions, defaultServicesLayerOptions } from './index';
import { defaultServicesOptions, getWMTSCapabilities, fetchWMTSLayerStyles } from './wmts';

/**
 * 解析Arcgis WMTS类型的服务地址获取图层服务数据信息
 */
const fetchWMTSCapabilities = (own, url, options) => {
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
    capabilitiesUrl += '/WMTS/1.0.0/WMTSCapabilities.xml';
    urlParams && (capabilitiesUrl += `?${urlParams}`);
    isProxyUrl && (capabilitiesUrl = `${own.proxyURL}${capabilitiesUrl}`);

    // 请求图层数据信息
    const errorMsg = `ArcgisWMTS服务地址[ ${url} ]数据解析失败.`;
    GeoGlobe.Request.GET({
      url: capabilitiesUrl,
      success: data => {
        let opts = {};
        try {
          // 获取Arcgis WMTS服务的Capabilities信息
          let capabilities = !data.responseXML || !data.responseXML.documentElement ? data.responseText : data.responseXML;
          capabilities = new GeoGlobe.Format.WMTSCapabilities.v1_0_0().read(capabilities);
          const wmtsOpts = getWMTSCapabilities(capabilities, options, GeoGlobe);
          if (wmtsOpts) {
            opts = assign({}, opts, wmtsOpts);
            // 矩形范围
            const defaultLayer = capabilities.contents.layers && capabilities.contents.layers[0];
            const bounding = defaultLayer.bounds;
            const defaultBounds = [
              [Number(bounding._sw.lat), Number(bounding._sw.lng)],
              [Number(bounding._ne.lat), Number(bounding._ne.lng)],
            ];
            opts.tileBBox = defaultBounds;
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

class ArcgisWMTS {
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
   * 获取解析Arcgis WMTS服务的图层对象
   * @param {String} id 图层Id名称
   * @param {String} name 图层Name名
   * @param {String} url 服务地址
   * @param {Object} options 解析服务的参数选项
   */
  async getLayer(id, name = '', url, options = {}) {
    const opts = assign(this.options, options);
    // 获取服务信息
    const layerOptions = await fetchWMTSCapabilities(this, url, opts);
    // 获取Arcgis WMTS图层
    const layer = fetchWMTSLayerStyles(this, id, url, layerOptions, { ...opts, name });
    layer.metadata.serviceType = 'ArcgisWMTS';
    // 计算Arcgis WMTS的数据源地址
    let urlParams = '';
    let wmtsUrl = url;
    if (url.indexOf('?') !== -1) {
      const urlSplit = url.split('?');
      wmtsUrl = urlSplit[0];
      urlParams = urlSplit[1];
    }
    wmtsUrl += `/WMTS/tile/${layerOptions.version}/${layerOptions.layerName}/${layerOptions.styleName}/${layerOptions.matrixSet}/{z}/{y}/{x}.png`;
    urlParams && (wmtsUrl += `?${urlParams}`);
    !isBooleanFlase(opts.proxy) && (wmtsUrl = `${this.proxyURL}${wmtsUrl}`);
    layer.source.tiles = [wmtsUrl];
    return layer;
  }
}

export default ArcgisWMTS;
