/**
 * @文件说明: Services.GeoTile 吉奥瓦片服务
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-25 12:13:14
 */

import assign from 'lodash/assign';
import { isBooleanFlase, isEmpty } from '../../../_util/methods-util';
import { defaultServicesSourceOptions, defaultServicesLayerOptions, getServicesLayerSource, getServicesBaseLayer } from './index';

const defaultServicesOptions = {
  // 版本号
  version: null,
};

/**
 * 解析GeoTile类型的服务地址获取图层服务数据信息
 */
const fetchGeoTileCapabilities = (own, url, options) => {
  const { GeoGlobe } = own.exports;
  const isProxyUrl = isBooleanFlase(options.proxy) ? false : true;

  return new Promise((resolve, reject) => {
    let capabilitiesUrl = url;
    // 处理吉奥瓦片服务的地址
    const urlParams = url.indexOf('?') !== -1 ? url.split('?')[1] : '';
    if (url.indexOf('/DataServer') !== -1) {
      capabilitiesUrl = url.replace(/\/DataServer/g, '/services/tile/GetCapabilities');
    } else if (url.indexOf('/services/tile') !== -1) {
      capabilitiesUrl = `${url}/GetCapabilities`;
    }
    isProxyUrl && (capabilitiesUrl = `${own.proxyURL}${capabilitiesUrl}`);
    urlParams && (capabilitiesUrl = `${capabilitiesUrl}?${urlParams}`);

    // 请求图层数据信息
    GeoGlobe.Request.GET({
      url: capabilitiesUrl,
      success: data => {
        const opts = {};
        try {
          const capabilities = new GeoGlobe.Format.XML().read(data.responseText);
          if (capabilities) {
            const tileData = capabilities.querySelector('Data').querySelector('TileData');
            // 图层标识
            opts.layerName = capabilities.querySelector('Name').textContent;
            // 版本号
            const version = capabilities.querySelector('Version').textContent;
            opts.version = !isEmpty(options.version) ? options.version : version;
            // 瓦片大小
            const tileSize = tileData.querySelector('TilePixelsX').textContent;
            opts.tileSize = tileSize || 256;
            // CRS
            opts.crs = tileData.querySelector('CRS').textContent;
            // 矩形范围
            const bounding = tileData.querySelector('BoundBox');
            opts.tileBBox = [
              bounding.getAttribute('minx'),
              bounding.getAttribute('miny'),
              bounding.getAttribute('maxx'),
              bounding.getAttribute('maxy'),
            ].join(',');
            // 层级
            opts.minZoom = parseInt(tileData.querySelector('TopLevel').textContent, 10);
            opts.maxZoom = parseInt(tileData.querySelector('BottomLevel').textContent, 10) + 1;
            // 金字塔顶级范围
            const topTile = tileData.querySelector('Pyramid').querySelector('TopTile');
            opts.topTileExtent = [
              Number(topTile.getAttribute('FromX')),
              Number(topTile.getAttribute('ToY')),
              Number(topTile.getAttribute('ToX')),
              Number(topTile.getAttribute('FromY')),
            ];
          }
        } catch (e) {
          console.error(e);
          reject();
        }
        resolve(opts);
      },
      failure: () => {
        console.error(`吉奥瓦片GeoTile服务地址[${url}]数据解析失败.`);
        reject();
      },
    });
  });
};

/**
 * 解析GeoTile类型的服务地址获取图层样式信息
 */
const fetchGeoTileLayerStyles = (own, id, url, layerOptions, options) => {
  const isProxyUrl = isBooleanFlase(options.proxy) ? false : true;
  // 构建数据源
  const source = getServicesLayerSource(options);
  source.tileSize = options.tileSize || layerOptions.tileSize || options.defaultTileSize;
  // 拼接数据源瓦片地址
  const urlParams = url.indexOf('?') !== -1 ? url.split('?')[1] : '';
  let tileUrl = url;
  if (tileUrl.indexOf('/services/tile') !== -1) {
    tileUrl = tileUrl.replace(/\/services\/tile/g, '/DataServer');
  }
  tileUrl += '?T=tile&X={x}&Y={y}&L={z}';
  urlParams && (tileUrl += `&${urlParams}`);
  isProxyUrl && (tileUrl = `${own.proxyURL}${tileUrl}`);
  source.tiles = [tileUrl];
  // 构建图层
  const layer = getServicesBaseLayer(options);
  layer.id = id;
  layer.source = source;
  layer.minzoom = !layer.minzoom || layer.minzoom < layerOptions.minZoom ? layerOptions.minZoom : layer.minzoom;
  layer.maxzoom = !layer.maxzoom || layer.maxzoom > layerOptions.maxZoom ? layerOptions.maxZoom : layer.maxzoom;
  layer.metadata = assign({}, layer.metadata, {
    serviceType: 'VTS',
    serviceName: options.name || '',
    ...layerOptions,
  });
  if (layer.metadata.tileBBox) {
    const bbox = layer.metadata.tileBBox.split(',');
    layer.metadata.tileBBox = [
      [Number(bbox[0]), Number(bbox[1])],
      [Number(bbox[2]), Number(bbox[3])],
    ];
  }
  return layer;
};

class GeoTile {
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
   * 获取解析GeoTile服务的图层对象
   * @param {String} id 图层Id名称
   * @param {String} name 图层Name名
   * @param {String} url 服务地址
   * @param {Object} options 解析服务的参数选项
   */
  async getLayer(id, name = '', url, options = {}) {
    const opts = assign(this.options, options);
    // 获取服务信息
    const layerOptions = await fetchGeoTileCapabilities(this, url, opts);
    // 获取吉奥瓦片图层
    return fetchGeoTileLayerStyles(this, id, url, layerOptions, { ...opts, name });
  }
}

export default GeoTile;
