/**
 * @文件说明: Services.WMTS - WMTS服务
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-25 16:58:54
 */

import assign from 'lodash/assign';
import { isBooleanFlase, isEmpty } from '../../../_util/methods-util';
import { defaultServicesSourceOptions, defaultServicesLayerOptions, getServicesLayerSource, getServicesBaseLayer } from './index';
import { topTileExtentToWMTS } from '../../util/topTileExtent';

export const defaultServicesOptions = {
  // 版本号
  version: null,
  // 图层名标识
  layerName: null,
  // 图层矩阵集名
  layerMatrixSet: null,
  // 图层样式名
  styleName: null,
  // 图片格式，可选值：[ image/tile | image/png | image/jpeg ]
  format: null,
  // 顶级金字塔内部计算方式
  units: null,
};

/**
 * 解析标准WMTS类型服务Capabilities信息
 */
export const getWMTSCapabilities = (capabilities, options, GeoGlobe) => {
  try {
    const opts = {};
    // 图层标识
    const defaultLayer = capabilities.contents.layers && capabilities.contents.layers[0];
    const defaultLayerName = defaultLayer.identifier;
    opts.layerName = !isEmpty(options.layerName) ? options.layerName : defaultLayerName;
    // 图片格式
    opts.formats = defaultLayer.formats;
    opts.format = !isEmpty(options.format) && opts.formats.indexOf(options.format) !== -1 ? options.format : 'image/png';
    // 矩阵集名称
    const matrixSet = capabilities.contents.tileMatrixSets;
    const defaultMatrixSet = matrixSet[defaultLayer.tileMatrixSetLinks[0].tileMatrixSet];
    opts.matrixSet = !isEmpty(options.layerMatrixSet) ? options.layerMatrixSet : defaultMatrixSet.identifier;
    // 图层样式名称
    const defaultStyleName = defaultLayer.styles[0].identifier;
    opts.styleName = !isEmpty(options.styleName) ? options.styleName : defaultStyleName;
    // 版本号
    const version = capabilities.serviceIdentification.serviceTypeVersion;
    opts.version = !isEmpty(options.version) && options.version === '1.0.0' ? options.version : version;
    // 瓦片层级信息
    const tileMatrix = defaultMatrixSet.matrixIds;
    const zoom = [];
    const tileMatrixs = [];
    tileMatrix.forEach(item => {
      const currentZoom = parseInt(item.identifier, 10);
      zoom.push(currentZoom);
      tileMatrixs.push({
        identifier: currentZoom,
        scale: Number(item.scaleDenominator),
        tileWidth: Number(item.tileWidth),
        tileHeight: Number(item.tileHeight),
        matrixWidth: Number(item.matrixWidth),
        matrixHeight: Number(item.matrixHeight),
      });
    });
    opts.tileSize = tileMatrixs[0].tileWidth || 256;
    opts.tileMatrixs = tileMatrixs;
    opts.zoom = zoom;
    // CRS
    opts.crs = defaultMatrixSet.supportedCRS.replace(/urn:ogc:def:crs:(\w+):(.*:)?(\w+)$/, '$1:$3');
    // 金字塔顶级范围
    const topLeftCorner =
      tileMatrix[0].topLeftCorner.lng < 0
        ? [tileMatrix[0].topLeftCorner.lng, tileMatrix[0].topLeftCorner.lat]
        : [tileMatrix[0].topLeftCorner.lat, tileMatrix[0].topLeftCorner.lng];
    const result = topTileExtentToWMTS(GeoGlobe, {
      identifier: Number(tileMatrix[0].identifier),
      scaleDenominator: tileMatrix[0].scaleDenominator,
      topLeftCorner,
      tileSize: opts.tileSize,
      matrixWidth: tileMatrix[0].matrixWidth,
      matrixHeight: tileMatrix[0].matrixHeight,
      units: !isEmpty(options.units) && ['degrees', 'm'].indexOf(options.units) !== -1 ? options.units : 'm',
    });
    opts.topTileExtent = result.topTileExtent;
    opts.zoomOffset = result.zoomOffset;
    opts.zoom = opts.zoom.map(zoom => zoom + opts.zoomOffset);
    opts.minZoom = opts.zoom[0];
    opts.maxZoom = opts.zoom[opts.zoom.length - 1];
    return opts;
  } catch (e) {
    return null;
  }
};

/**
 * 解析WMTS类型的服务地址获取图层服务数据信息
 */
const fetchWMTSCapabilities = (own, url, options) => {
  const { GeoGlobe } = own.exports;
  const isProxyUrl = isBooleanFlase(options.proxy) ? false : true;

  return new Promise((resolve, reject) => {
    let capabilitiesUrl = `${url}${url.indexOf('?') === -1 ? '?' : '&'}SERVICE=WMTS&REQUEST=GetCapabilities`;
    isProxyUrl && (capabilitiesUrl = `${own.proxyURL}${capabilitiesUrl}`);

    // 请求图层数据信息
    const errorMsg = `WMTS服务地址[ ${url} ]数据解析失败.`;
    GeoGlobe.Request.GET({
      url: capabilitiesUrl,
      success: data => {
        let opts = {};
        try {
          // 获取WMTS服务的Capabilities信息
          let capabilities = !data.responseXML || !data.responseXML.documentElement ? data.responseText : data.responseXML;
          capabilities = new GeoGlobe.Format.WMTSCapabilities.v1_0_0().read(capabilities);
          const wmtsOpts = getWMTSCapabilities(capabilities, options, GeoGlobe);
          if (wmtsOpts) {
            opts = assign({}, opts, wmtsOpts);
            const defaultLayer = capabilities.contents.layers && capabilities.contents.layers[0];
            // 矩形范围
            const bounding = defaultLayer.bounds;
            const defaultBounds = [
              [Number(bounding._sw.lng), Number(bounding._sw.lat)],
              [Number(bounding._ne.lng), Number(bounding._ne.lat)],
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

/**
 * 解析WMTS类型的服务地址获取图层样式信息
 */
export const fetchWMTSLayerStyles = (own, id, url, layerOptions, options) => {
  const isProxyUrl = isBooleanFlase(options.proxy) ? false : true;
  // 拼接数据源的WMTS服务地址
  const params = {};
  params.SERVICE = 'WMTS';
  params.REQUEST = 'GetTile';
  params.VERSION = layerOptions.version;
  params.LAYER = layerOptions.layerName;
  params.STYLE = layerOptions.styleName;
  params.TILEMATRIXSET = layerOptions.matrixSet;
  params.FORMAT = layerOptions.format;
  params.TILEMATRIX = '{z}';
  params.TILEROW = '{y}';
  params.TILECOL = '{x}';
  let wmtsUrl = '';
  Object.keys(params).map((key, idx) => {
    if (idx !== 0) {
      wmtsUrl += '&';
    }
    wmtsUrl += `${encodeURIComponent(key)}=${params[key]}`;
  });
  wmtsUrl = `${url}${url.indexOf('?') === -1 ? '?' : '&'}${wmtsUrl}`;
  isProxyUrl && (wmtsUrl = `${own.proxyURL}${wmtsUrl}`);
  // 构建数据源
  const source = getServicesLayerSource(options);
  source.tileSize = options.tileSize || layerOptions.tileSize || options.defaultTileSize;
  source.tiles = [wmtsUrl];
  source.zoomOffset = !isEmpty(options.zoomOffset) ? options.zoomOffset : !isEmpty(layerOptions.zoomOffset) ? layerOptions.zoomOffset : 0;
  // 构建图层
  const layer = getServicesBaseLayer(options);
  layer.id = id;
  layer.source = source;
  layer.minzoom = isEmpty(layer.minzoom) || layer.minzoom < layerOptions.minZoom ? layerOptions.minZoom : layer.minzoom;
  layer.maxzoom = isEmpty(layer.maxzoom) || layer.maxzoom > layerOptions.maxZoom + 1 ? layerOptions.maxZoom + 1 : layer.maxzoom;
  layer.metadata = assign({}, layer.metadata, {
    serviceType: 'WMTS',
    serviceName: options.name || '',
    zoomOffset: source.zoomOffset || 0,
    ...layerOptions,
  });
  return layer;
};

class WMTS {
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
   * 获取解析WMTS服务的图层对象
   * @param {String} id 图层Id名称
   * @param {String} name 图层Name名
   * @param {String} url 服务地址
   * @param {Object} options 解析服务的参数选项
   */
  async getLayer(id, name = '', url, options = {}) {
    const opts = assign(this.options, options);
    // 获取服务信息
    const layerOptions = await fetchWMTSCapabilities(this, url, opts);
    // 获取WMTS图层
    return fetchWMTSLayerStyles(this, id, url, layerOptions, { ...opts, name });
  }
}

export default WMTS;
