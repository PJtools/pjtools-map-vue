/**
 * @文件说明: 构建Map.Services地图Web GIS服务图层对象
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-20 22:14:55
 */

import BasicMapApi from '../../util/basicMapApiClass';
import omit from 'omit.js';
import { isHttpUrl, isArray, isEmpty, isNumeric } from '../../../_util/methods-util';
import XYZTile from './xyzTile';

// 内置地图Web GIS服务的服务类型枚举名
export const mapServicesTypeKeys = ['XYZTile', 'WMTS', 'WMS', 'GeoTile', 'GeoExport', 'VTS', 'ArcgisWMTS', 'ArcgisWMS', 'ArcgisExport'];

// 服务数据源的默认参数选项
export const defaultServicesSourceOptions = {
  // 瓦片的大小
  tileSize: 256,
  // 瓦片的计算方案，可选值：[ xyz | tms ]
  scheme: null,
  // 瓦片类型
  rasterType: null,
  // 瓦片计算偏移量
  zoomOffset: null,
  // 是否拼接代理服务地址
  proxy: true,
  // 瓦片数据源的属性描述
  attribution: null,
  // 瓦片的请求范围
  bounds: null,
  // 瓦片的最小层级
  minzoom: null,
  // 瓦片的最大层级
  maxzoom: null,
};

// 服务图层的默认参数选项
export const defaultServicesLayerOptions = {
  // 图层的Layout属性
  layout: null,
  // 图层的Paint属性
  paint: null,
  // 图层的扩展属性，不影响图层的渲染，自定义扩展
  metadata: null,
  // 图层的[source-layer]属性
  sourceLayer: null,
  // 图层的不透明度，范围：0-1
  opacity: 1,
  // 图层的显隐状态，可选项: [ visible | none ]
  visibility: 'visible',
};

// 获取图层的数据源
export const getServicesLayerSource = options => {
  const source = {};
  source.type = 'raster';
  source.tileSize = options.tileSize;
  if (!isEmpty(options.scheme)) {
    source.scheme = options.scheme === 'tms' ? 'tms' : 'xyz';
  }
  options.rasterType && (source.rasterType = options.rasterType);
  options.attribution && (source.attribution = options.attribution);
  options.bounds && (source.bounds = options.bounds);
  options.minzoom && (source.minzoom = options.minzoom);
  options.maxzoom && (source.maxzoom = options.maxzoom);
  if (!isEmpty(options.zoomOffset) && isNumeric(options.zoomOffset)) {
    source.zoomOffset = parseInt(options.zoomOffset) || 0;
  }
  return source;
};

// 获取服务图层的基础对象
export const getServicesBaseLayer = options => {
  const layer = {};
  layer.type = 'raster';
  layer.layout = options.layout || {};
  layer.paint = options.paint || {};
  layer.metadata = options.metadata || {};
  options.minzoom && (layer.minzoom = options.minzoom);
  options.maxzoom && (layer.maxzoom = options.maxzoom);
  options.sourceLayer && (layer['source-layer'] = options.sourceLayer);
  let opacity = !isEmpty(options.opacity) && isNumeric(opacity) ? Number(opacity) : 1;
  opacity > 1 && (opacity = 1);
  opacity < 0 && (opacity = 0);
  layer.paint['raster-opacity'] = opacity;
  const visibility = !isEmpty(options.visibility) && options.visibility === 'none' ? 'none' : 'visible';
  layer.layout['visibility'] = visibility;
  return layer;
};

// 效验Services服务的基础属性的有效性
const validateServicesOptions = (id, url, options) => {
  if (!id || !url) {
    console.error(`WebGIS Services服务[id]、[url]必须属性必需设定`);
    return;
  }
  const errorUrlMsg = 'WebGIS Services服务[url]属性格式不是一个有效的链接地址.';
  if (isArray(url)) {
    for (let i = 0, len = url.length; i < len; i++) {
      if (!isHttpUrl(url[i])) {
        console.error(errorUrlMsg);
        return;
      }
    }
  } else if (!isHttpUrl(url)) {
    console.error(errorUrlMsg);
    return;
  }

  return {
    id,
    name: options && options.name ? String(options.name) : '',
    url,
    options: omit(options, ['name']),
  };
};

class Services extends BasicMapApi {
  /**
   * 获取Web GIS服务的服务类型的名称
   * @readonly
   */
  get typeKeys() {
    return mapServicesTypeKeys;
  }

  /**
   * Services地图Web GIS服务
   * @param {MapApi} iMapApi 地图Api实例化对象
   */
  constructor(...arg) {
    super(...arg);
  }

  /**
   * 获取XYZTile类型服务的图层对象
   * @param {String} id 图层Id名称
   * @param {String} url 服务地址
   * @param {Object} options 解析服务的参数选项
   */
  getXYZTileLayer(id, url, options = {}) {
    const result = validateServicesOptions(id, url, options);
    if (!result) {
      return null;
    }
    let xyzTile = new XYZTile(this.iMapApi);
    const layer = xyzTile.getLayer(result.id, result.name, result.url, result.options);
    xyzTile = null;
    return layer;
  }

  /**
   * 根据对应内置的Web GIS Service服务类型获取解析的服务类型
   * @param {String} type 内置Web GIS Service服务类型
   * @param {String} id 图层Id名称
   * @param {String} url 服务地址
   * @param {Object} options 解析服务的参数选项
   */
  getServicesLayer(type, id, url, options = {}) {
    switch (type) {
      case 'XYZTile':
        return this.getXYZTileLayer(id, url, options);
      default:
        return null;
    }
  }
}

export default Services;
