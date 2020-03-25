/**
 * @文件说明: Services.VTS 吉奥VTS矢量瓦片服务
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-24 16:18:34
 */

import assign from 'lodash/assign';
import { isBooleanFlase, fetchGetJson, isEmpty } from '../../../_util/methods-util';
import { defaultServicesSourceOptions, defaultServicesLayerOptions, getServicesLayerSource } from './index';

const defaultServicesOptions = {
  // 版本号
  version: null,
  // 图层名标识
  layerName: null,
  // 矢量瓦片格式，可选值：[ protobuf | image/png | image/jpeg ]
  format: 'protobuf',
  // 图层矩阵集名
  layerMatrixSet: null,
  // 图层样式名
  styleName: null,
};

/**
 * 解析VTS类型的服务地址获取图层服务数据信息
 */
const fetchVTSCapabilities = (own, url, options) => {
  const { GeoGlobe } = own.exports;
  const isProxyUrl = isBooleanFlase(options.proxy) ? false : true;

  return new Promise((resolve, reject) => {
    let capabilitiesUrl = `${url}${url.indexOf('?') === -1 ? '?' : '&'}SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities`;
    isProxyUrl && (capabilitiesUrl = `${own.proxyURL}${capabilitiesUrl}`);
    isProxyUrl && (url = `${own.proxyURL}${url}`);

    const opts = { url };
    // 请求图层数据信息
    GeoGlobe.Request.GET({
      url: capabilitiesUrl,
      success: data => {
        try {
          const capabilities = new GeoGlobe.Format.XML().read(data.responseText);
          if (capabilities) {
            const layers = capabilities.querySelector('Contents').querySelectorAll('Layer');
            const defaultLayer = layers[0];
            // 图层标识
            const defaultLayerName = defaultLayer.querySelector('Identifier').textContent;
            opts.layer = !isEmpty(options.layerName) ? options.layerName : defaultLayerName;
            // 矢量瓦片格式
            const format = defaultLayer.querySelectorAll('Format');
            const formatList = [];
            if (format) {
              format.forEach(item => {
                formatList.push(item.textContent);
              });
            }
            opts.format = options.format && formatList.indexOf(options.format) !== -1 ? options.format : 'protobuf';
            // 矩阵集名称
            const matrixSet = capabilities.querySelector('Contents').querySelectorAll('Layer + TileMatrixSet');
            const defaultMatrixSet = matrixSet[0].querySelector('Identifier').textContent;
            opts.matrixSet = !isEmpty(options.layerMatrixSet) ? options.layerMatrixSet : defaultMatrixSet;
            // 图层样式名称
            const styles = defaultLayer.querySelector('Style').querySelectorAll('Identifier');
            const defaultStyleName = styles[0].textContent;
            opts.styleName = !isEmpty(options.styleName) ? options.styleName : defaultStyleName;
            // 版本号
            const version = capabilities.querySelector('ServiceTypeVersion').textContent;
            opts.version = !isEmpty(options.version) ? options.version : version;
            // 矩形范围
            const bounding = defaultLayer.querySelector('BoundingBox');
            const minbound = bounding.querySelector('LowerCorner').textContent.split(' ');
            const maxbound = bounding.querySelector('UpperCorner').textContent.split(' ');
            const defaultBounds = [...minbound, ...maxbound].join(',');
            opts.tileBBox = defaultBounds;
            // 层级
            const tileMatrix = matrixSet[0].querySelectorAll('TileMatrix');
            const zoom = [];
            const scales = [];
            let tileSize = 256;
            tileMatrix.forEach((item, idx) => {
              const currentZoom = parseInt(item.querySelector('Identifier').textContent, 10);
              zoom.push(currentZoom);
              scales.push({ zoom: currentZoom, scale: Number(item.querySelector('ScaleDenominator').textContent) });
              if (idx === 0) {
                tileSize = Number(item.querySelector('TileWidth').textContent);
              }
            });
            opts.tileSize = tileSize;
            opts.scales = scales;
            opts.zoom = zoom;
            opts.minZoom = zoom[0];
            opts.maxZoom = zoom[zoom.length - 1];
          }
        } catch (e) {
          console.error(e);
          reject();
        }
        resolve(opts);
      },
      failure: () => {
        console.error(`矢量瓦片VTS服务地址[${url}]数据解析失败.`);
        reject();
      },
    });
  });
};

/**
 * 解析VTS类型的服务地址获取图层样式信息
 */
const fetchVTSLayerStyles = (own, id, url, layerOptions, options) => {
  const isProxyUrl = isBooleanFlase(options.proxy) ? false : true;

  return new Promise((resolve, reject) => {
    let stylesUrl = `${url}${url.indexOf('?') === -1 ? '?' : '&'}REQUEST=GetStyle&SERVICE=WMTS&VERSION=1.0.0&STYLENAME=${layerOptions.styleName}`;
    isProxyUrl && (stylesUrl = `${own.proxyURL}${stylesUrl}`);

    fetchGetJson(stylesUrl)
      .then(data => {
        // 拼接数据源的矢量瓦片服务地址
        const params = {};
        params.service = 'WMTS';
        params.request = 'GetTile';
        layerOptions.version && (params.VERSION = layerOptions.version);
        layerOptions.layer && (params.LAYER = layerOptions.layer);
        layerOptions.matrixSet && (params.TILEMATRIXSET = layerOptions.matrixSet);
        layerOptions.format && (params.FORMAT = layerOptions.format);
        params.TILEMATRIX = '{z}';
        params.TILEROW = '{y}';
        params.TILECOL = '{x}';
        if (layerOptions.tileSize) {
          params.WIDTH = layerOptions.tileSize;
          params.HEIGHT = layerOptions.tileSize;
        }
        let vectorUrl = '';
        Object.keys(params).map((key, idx) => {
          if (idx !== 0) {
            vectorUrl += '&';
          }
          vectorUrl += `${encodeURIComponent(key)}=${params[key]}`;
        });
        vectorUrl = `${url}${url.indexOf('?') === -1 ? '?' : '&'}${vectorUrl}`;
        isProxyUrl && (vectorUrl = `${own.proxyURL}${vectorUrl}`);
        // 数据源
        const source = getServicesLayerSource(options);
        source.id = id;
        source.type = 'vector';
        source.tiles = [vectorUrl];
        source.defaultTileSize = 256;
        // Metadata信息
        const metadata = {
          ...layerOptions,
        };
        metadata.url = url;
        metadata.vtsStyleName = data.name || '';
        metadata.sprite = data.sprite ? `${isProxyUrl ? own.proxyURL : ''}${data.sprite}` : '';
        metadata.glyphs = data.glyphs ? `${isProxyUrl ? own.proxyURL : ''}${data.glyphs}` : '';
        metadata.serviceType = 'VTS';
        metadata.serviceName = options.name || '';
        metadata['vts:group'] = id;
        if (metadata.tileBBox) {
          const bbox = metadata.tileBBox.split(',');
          metadata.tileBBox = [
            [Number(bbox[0]), Number(bbox[1])],
            [Number(bbox[2]), Number(bbox[3])],
          ];
        }
        // 图层
        const vtsLayers = data.styleData || data.layers || [];
        const layers = vtsLayers.map(layer => {
          layer.metadata = metadata;
          if (layer.type !== 'background') {
            layer.source = id;
          }
          layer.metadata.visibility = layer.layout.visibility && layer.layout.visibility === 'none' ? 'none' : 'visible';
          return layer;
        });

        resolve({
          id,
          type: 'VTS',
          layers,
          source,
        });
      })
      .catch(() => {
        console.error(`矢量瓦片VTS服务地址[${url}]数据解析失败.`);
        reject();
      });
  });
};

class VTS {
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
   * 获取解析XYZTile服务的图层对象
   * @param {String} id 图层Id名称
   * @param {String} name 图层Name名
   * @param {String} url 服务地址
   * @param {Object} options 解析服务的参数选项
   */
  async getLayer(id, name = '', url, options = {}) {
    const opts = assign(this.options, options);
    // 获取服务信息
    const layerOptions = await fetchVTSCapabilities(this, url, opts);
    // 获取矢量瓦片图层
    const layer = await fetchVTSLayerStyles(this, id, url, layerOptions, { ...opts, name });
    return layer;
  }
}

export default VTS;
