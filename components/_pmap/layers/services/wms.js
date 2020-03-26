/**
 * @文件说明: Services.WMS - WMS服务
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-26 14:13:06
 */

import assign from 'lodash/assign';
import { isBooleanFlase, isEmpty, isBooleanTrue } from '../../../_util/methods-util';
import { defaultServicesSourceOptions, defaultServicesLayerOptions, getServicesLayerSource, getServicesBaseLayer } from './index';

export const defaultServicesOptions = {
  // 版本号，可选值：[ 1.1.1 | 1.3.0 ]
  version: null,
  // 图层名标识，多个以,逗号分割
  layerName: null,
  // 图层样式名
  styleName: null,
  // 图片格式，可选值：[ image/png | image/jpeg | image/gif ]
  format: null,
  // 是否支持透明
  transparent: true,
};

/**
 * 解析标准WMS类型服务Capabilities信息
 */
export const getWMSCapabilities = (capabilities, options, GeoGlobe) => {
  try {
    const opts = {};
    // 获取版本号
    const version = capabilities.querySelector('WMT_MS_Capabilities').getAttribute('version');
    if (version === '1.3.0') {
      capabilities = new GeoGlobe.Format.WMSCapabilities.v1_3_0().read(capabilities);
    } else {
      capabilities = new GeoGlobe.Format.WMSCapabilities.v1_1_1().read(capabilities);
    }
    opts.version = !isEmpty(options.version) && ['1.1.1', '1.3.0'].indexOf(options.version) ? options.version : version;
    // 图层标识
    const layers = capabilities.capability.layers;
    const defaultLayer = layers[0];
    const layersName = layers.map(layer => layer.name);
    opts.layersName = layersName;
    opts.layerName = !isEmpty(options.layerName) ? options.layerName : layersName.join(',');
    // 图片格式
    opts.formats = defaultLayer.formats;
    opts.format = !isEmpty(options.format) && opts.formats.indexOf(options.format) !== -1 ? options.format : 'image/png';
    // 图层样式名称
    const defaultStyleName = (defaultLayer.styles && defaultLayer.styles[0] && defaultLayer.styles[0].name) || 'default';
    opts.styleName = !isEmpty(options.styleName) ? options.styleName : defaultStyleName;
    // SRS
    const srsKeys = Object.keys(defaultLayer.srs) || [];
    let defaultSRS = null;
    for (let i = 0, len = srsKeys.length; i < len; i++) {
      if (isBooleanTrue(defaultLayer.srs[srsKeys[i]])) {
        defaultSRS = srsKeys[i];
        break;
      }
    }
    defaultSRS = !defaultSRS ? srsKeys[0] || '' : defaultSRS;
    opts.srs = defaultSRS;
    // 矩形范围
    const bounding = defaultLayer.bbox[opts.srs];
    const defaultBounds = [
      [Number(bounding.bbox[0]), Number(bounding.bbox[1])],
      [Number(bounding.bbox[2]), Number(bounding.bbox[3])],
    ];
    opts.tileBBox = defaultBounds;
    // 透明度
    opts.transparent = isBooleanFlase(options.transparent) ? false : true;
    opts.isTile = true;
    return opts;
  } catch (e) {
    return null;
  }
};

/**
 * 解析WMS类型的服务地址获取图层服务数据信息
 */
const fetchWMSCapabilities = (own, url, options) => {
  const { GeoGlobe } = own.exports;
  const isProxyUrl = isBooleanFlase(options.proxy) ? false : true;

  return new Promise((resolve, reject) => {
    let capabilitiesUrl = `${url}${url.indexOf('?') === -1 ? '?' : '&'}SERVICE=WMS&REQUEST=GetCapabilities`;
    isProxyUrl && (capabilitiesUrl = `${own.proxyURL}${capabilitiesUrl}`);

    // 请求图层数据信息
    const errorMsg = `WMS服务地址[ ${url} ]数据解析失败.`;
    GeoGlobe.Request.GET({
      url: capabilitiesUrl,
      success: data => {
        let opts = {};
        try {
          // 获取WMS服务的Capabilities信息
          let capabilities = !data.responseXML || !data.responseXML.documentElement ? data.responseText : data.responseXML;
          const wmsOpts = getWMSCapabilities(capabilities, options, GeoGlobe);
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

/**
 * 解析WMS类型的服务地址获取图层样式信息
 */
export const fetchWMSLayerStyles = (own, id, url, layerOptions, options) => {
  const isProxyUrl = isBooleanFlase(options.proxy) ? false : true;
  // 拼接数据源的WMS服务地址
  const params = {};
  params.SERVICE = 'WMS';
  params.REQUEST = 'GetMap';
  params.VERSION = layerOptions.version;
  params.LAYERS = layerOptions.layerName;
  params.STYLES = layerOptions.styleName;
  params.FORMAT = layerOptions.format;
  params.BBOX = '{bbox-epsg-3857}';
  params.WIDTH = options.tileSize || options.defaultTileSize;
  params.HEIGHT = options.tileSize || options.defaultTileSize;
  params.SRS = layerOptions.srs;
  params.TRANSPARENT = layerOptions.transparent;
  let wmsUrl = '';
  Object.keys(params).map((key, idx) => {
    if (idx !== 0) {
      wmsUrl += '&';
    }
    wmsUrl += `${encodeURIComponent(key)}=${params[key]}`;
  });
  wmsUrl = `${url}${url.indexOf('?') === -1 ? '?' : '&'}${wmsUrl}`;
  isProxyUrl && (wmsUrl = `${own.proxyURL}${wmsUrl}`);
  // 构建数据源
  const source = getServicesLayerSource(options);
  source.tileSize = options.tileSize || options.defaultTileSize;
  source.tiles = [wmsUrl];
  // 构建图层
  const layer = getServicesBaseLayer(options);
  layer.id = id;
  layer.source = source;
  layer.metadata = assign({}, layer.metadata, {
    serviceType: 'WMS',
    serviceName: options.name || '',
    template: wmsUrl,
    ...layerOptions,
  });
  console.log(layer);
  return layer;
};

class WMS {
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
   * 获取解析WMS服务的图层对象
   * @param {String} id 图层Id名称
   * @param {String} name 图层Name名
   * @param {String} url 服务地址
   * @param {Object} options 解析服务的参数选项
   */
  async getLayer(id, name = '', url, options = {}) {
    const opts = assign(this.options, options);
    // 获取服务信息
    const layerOptions = await fetchWMSCapabilities(this, url, opts);
    // // 获取WMS图层
    return fetchWMSLayerStyles(this, id, url, layerOptions, { ...opts, name });
  }
}

export default WMS;
