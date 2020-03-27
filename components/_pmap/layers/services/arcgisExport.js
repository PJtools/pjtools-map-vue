/**
 * @文件说明: Services.ArcgisExport - Arcgis Export服务
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-27 15:02:59
 */

import assign from 'lodash/assign';
import { isBooleanFlase, isEmpty, fetchGetJson } from '../../../_util/methods-util';
import { defaultServicesSourceOptions, defaultServicesLayerOptions, getServicesLayerSource, getServicesBaseLayer } from './index';

const defaultServicesOptions = {
  // 图层名标识，多个以,逗号分割
  layerName: null,
  // 输入空间坐标系统
  srs: null,
  // 输出空间坐标系统
  outSRS: null,
  // 过滤条件
  layerDefs: null,
  // 图片格式，可选值：[ image/png | image/jpeg | image/gif ]
  format: null,
  // 是否支持透明
  transparent: true,
  // 图片DPI
  dpi: null,
  // 多时服务的时间戳
  time: null,
  // 图层的时间选项
  layerTimeOptions: null,
  // 动态图层的选项（10.1版本的新特性）
  dynamicLayers: null,
  // 地理数据库版本（10.1版本的新特性）
  gdbVersion: null,
  // 地图比例尺（10.1版本的新特性）
  mapScale: null,
};

/**
 * 解析ArcgisExport类型的服务地址获取图层服务数据信息
 */
const fetchArcgisExportCapabilities = (own, url, options) => {
  const isProxyUrl = isBooleanFlase(options.proxy) ? false : true;

  return new Promise((resolve, reject) => {
    let capabilitiesUrl = `${url.replace(/\/export/, '')}${url.indexOf('?') === -1 ? '?' : '&'}f=pjson`;
    isProxyUrl && (capabilitiesUrl = `${own.proxyURL}${capabilitiesUrl}`);

    // 请求图层数据信息
    const errorMsg = `ArcgisExport服务地址[ ${url} ]数据解析失败.`;
    fetchGetJson(capabilitiesUrl)
      .then(capabilities => {
        let opts = {};
        try {
          // 获取版本号
          opts.version = capabilities.currentVersion;
          // 图层标识
          const layers = {};
          const layersName = [];
          capabilities.layers.map(item => {
            layers[item.id] = {
              id: item.id,
              name: item.name,
              minScale: item.minScale,
              maxScale: item.maxScale,
            };
            layersName.push(item.id);
          });
          opts.layers = layers;
          opts.layersName = layersName;
          opts.layerName = !isEmpty(options.layerName)
            ? /show:|hide:|include:|exclude:/i.test(options.layerName)
              ? options.layerName
              : `show:${options.layerName}`
            : 'show';
          // 图片格式
          opts.formats = capabilities.supportedImageFormatTypes.split(',');
          opts.format = !isEmpty(options.format) && opts.formats.indexOf(options.format) !== -1 ? options.format : 'PNG';
          // SRS
          const defaultSRS = capabilities.spatialReference.wkid;
          opts.srs = !isEmpty(options.srs) ? (options.srs.indexOf(':') !== -1 ? options.srs.split(':')[1] : options.srs) : defaultSRS;
          // 矩形范围
          opts.tileBBox = [
            [Number(capabilities.fullExtent.xmin), Number(capabilities.fullExtent.ymin)],
            [Number(capabilities.fullExtent.xmax), Number(capabilities.fullExtent.ymax)],
          ];
          opts.initialExtent = [
            [Number(capabilities.initialExtent.xmin), Number(capabilities.initialExtent.ymin)],
            [Number(capabilities.initialExtent.xmax), Number(capabilities.initialExtent.ymax)],
          ];
          // 透明度
          opts.transparent = isBooleanFlase(options.transparent) ? false : true;
          opts.units = capabilities.units;
          opts.minScale = capabilities.minScale;
          opts.maxScale = capabilities.maxScale;
          opts.isTile = true;
        } catch (e) {
          console.error(errorMsg);
          reject();
        }
        resolve(opts);
      })
      .catch(() => {
        console.error(errorMsg);
        reject();
      });
  });
};

/**
 * 解析ArcgisExport类型的服务地址获取图层样式信息
 */
const fetchArcgisExportLayerStyles = (own, id, url, layerOptions, options) => {
  const isProxyUrl = isBooleanFlase(options.proxy) ? false : true;
  // 构建数据源
  const source = getServicesLayerSource(options);
  // 拼接数据源的ArcgisExport服务地址
  const params = {};
  params.LAYERS = layerOptions.layerName;
  params.BBOX = '{bbox-epsg-3857}';
  params.BBOXSR = layerOptions.srs;
  params.IMAGESR = !isEmpty(options.outSRS) ? (options.outSRS.indexOf(':') !== -1 ? options.outSRS.split(':')[1] : options.outSRS) : layerOptions.srs;
  params.FORMAT = layerOptions.format;
  params.DPI = !isEmpty(options.dpi) ? options.dpi : 96;
  const tileSize = options.tileSize || source.defaultTileSize;
  params.SIZE = [tileSize, tileSize].join(',');
  params.TRANSPARENT = layerOptions.transparent;
  !isEmpty(options.layerDefs) && (params.LAYERDEFS = String(options.layerDefs));
  !isEmpty(options.time) && (params.TIME = String(options.time));
  if (!isEmpty(options.layerTimeOptions)) {
    params.LAYERTIMEOPTIONS = typeof options.layerTimeOptions !== 'string' ? JSON.stringify(options.layerTimeOptions) : options.layerTimeOptions;
  }
  if (!isEmpty(options.dynamicLayers)) {
    params.DYNAMICLAYERS = typeof options.dynamicLayers !== 'string' ? JSON.stringify(options.dynamicLayers) : options.dynamicLayers;
  }
  !isEmpty(options.gdbVersion) && (params.GDBVERSION = options.gdbVersion);
  !isEmpty(options.mapScale) && (params.MAPSCALE = options.mapScale);
  params.F = 'image';
  let exportUrl = url;
  let urlParams = '';
  Object.keys(params).map((key, idx) => {
    if (idx !== 0) {
      urlParams += '&';
    }
    urlParams += `${encodeURIComponent(key)}=${params[key]}`;
  });
  if (exportUrl.indexOf('?') !== -1) {
    const urlSplit = exportUrl.split('?');
    exportUrl = urlSplit[0];
    urlParams = `&${urlSplit[1]}`;
  }
  exportUrl.indexOf('/export') === -1 && (exportUrl += '/export');
  urlParams && (exportUrl = `${exportUrl}?${urlParams}`);
  isProxyUrl && (exportUrl = `${own.proxyURL}${exportUrl}`);
  // 设定服务源
  source.tileSize = options.tileSize || source.defaultTileSize;
  source.tiles = [exportUrl];
  // 构建图层
  const layer = getServicesBaseLayer(options);
  layer.id = id;
  layer.source = source;
  layer.metadata = assign({}, layer.metadata, {
    serviceType: 'ArcgisExport',
    serviceName: options.name || '',
    ...layerOptions,
  });
  return layer;
};

class ArcgisExport {
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
   * 获取解析ArcgisExport服务的图层对象
   * @param {String} id 图层Id名称
   * @param {String} name 图层Name名
   * @param {String} url 服务地址
   * @param {Object} options 解析服务的参数选项
   */
  async getLayer(id, name = '', url, options = {}) {
    const opts = assign(this.options, options);
    // 获取服务信息
    const layerOptions = await fetchArcgisExportCapabilities(this, url, opts);
    // 获取ArcgisExport图层
    return fetchArcgisExportLayerStyles(this, id, url, layerOptions, { ...opts, name });
  }
}

export default ArcgisExport;
