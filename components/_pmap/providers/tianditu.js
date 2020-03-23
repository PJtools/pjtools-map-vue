/**
 * @文件说明: Providers.Tianditu 天地图数据源
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-19 23:22:32
 */

import hat from 'hat';
import assign from 'lodash/assign';
import { isBooleanFlase } from '../../_util/methods-util';

// 天地图的图层服务源的类型
export const tdtLayersTypes = ['vec', 'img', 'terrain'];

// 天地图地图的限制地图Map属性
export const tdtMapOptions = {
  minZoom: 0,
  maxZoom: 17,
};

// 默认服务数据源的参数选项
const DEFAULT_OPTIONS = {
  // 天地图服务的默认许可密钥
  tk: 'e90d56e5a09d1767899ad45846b0cefd',
  // 天地图服务的投影模式，默认采用Web墨卡托，可选值：[ wgs84 ]
  crs: null,
  // 天地图的服务类型，可选值：[ XYZTile | WMTS ]
  type: 'XYZTile',
  // 是否配置地名文本标注
  labels: true,
  // 是否配置行政边界线
  boundary: true,
};

// 天地图的服务源的基础瓦片名称
const DEFAULT_SOURCES_BASE = {
  vec: 'vec',
  img: 'img',
  terrain: 'ter',
};

// 天地图的服务源的行政边界名称
const DEFAULT_SOURCES_BOUNDARY = {
  vec: null,
  img: 'ibo',
  terrain: 'tbo',
};

// 天地图的服务源的中文标注名称
const DEFAULT_SOURCES_LABELS = {
  vec: 'cva',
  img: 'cia',
  terrain: 'cta',
};

/**
 * 根据天地图服务源的规则生成图层的数据源对象
 * @param {string} layerName 图层名称
 * @param {string} type 服务类型
 * @param {string} token 天地图token令牌
 * @param {number} maxzoom 最大层级限制
 */
const getTDTSource = function(layerName, type, token, maxzoom) {
  const source = {
    type: 'raster',
    tileSize: 256,
    maxzoom,
    tiles: [0, 1, 2, 3, 4].map(key => {
      let url = null;
      // 判断服务源类型的是否为WMTS服务
      if (type === 'WMTS') {
        const split = layerName.split('_');
        url = `http://t${key}.tianditu.gov.cn/${layerName}/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${split[0]}&STYLE=default&TILEMATRIXSET=${split[1]}&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${token}`;
      } else {
        url = `http://t${key}.tianditu.gov.cn/DataServer?T=${layerName}&x={x}&y={y}&l={z}&tk=${token}`;
      }
      return url;
    }),
  };
  return source;
};

/**
 * 根据服务图层源生成对应的MapboxGL支持的Layer图层对象
 * @param {string} id 图层id
 * @param {string} layerName 图层名称
 * @param {Object} source 图层服务源
 * @param {string} type 服务类型
 * @param {number} maxzoom 最大层级限制
 */
const getTDTLayer = function(id, layerName, source, type, maxzoom) {
  const prefix = 'providers_tianditu';
  return {
    id: `${prefix}_${layerName}_${id}`,
    type: 'raster',
    source,
    maxzoom,
    metadata: {
      serviceType: type === 'WMTS' ? 'WMTS' : 'XYZTile',
    },
  };
};

class Tianditu {
  constructor(iMapApi) {
    this.iMapApi = iMapApi;
    this.exports = iMapApi && iMapApi.exports ? iMapApi.exports : {};
    this.id = hat();
  }

  /**
   * 获取天地图服务源的图层对象
   * @param {Object} options 服务源的参数选项
   */
  getLayers(options = {}) {
    const opts = assign({}, DEFAULT_OPTIONS, options);
    const isWGS84 = !!(opts.crs === 'wgs84');
    const layers = {};
    // 生成天地图对应类型的图层集合
    tdtLayersTypes.map(key => {
      layers[key] = [];
      let maxzoom = key === 'terrain' ? 13 : 17;
      // 天地图的基础瓦片
      const baseLayerName = `${DEFAULT_SOURCES_BASE[key]}_${isWGS84 ? 'c' : 'w'}`;
      const baseSource = getTDTSource(baseLayerName, opts.type, opts.tk, maxzoom);
      baseSource && layers[key].push(getTDTLayer(this.id, baseLayerName, baseSource, opts.type, maxzoom));
      // 天地图的行政边界瓦片
      if (DEFAULT_SOURCES_BOUNDARY[key] && !isBooleanFlase(opts.boundary)) {
        const boundaryLayerName = `${DEFAULT_SOURCES_BOUNDARY[key]}_${isWGS84 ? 'c' : 'w'}`;
        const boundarySource = getTDTSource(boundaryLayerName, opts.type, opts.tk, maxzoom);
        boundarySource && layers[key].push(getTDTLayer(this.id, boundaryLayerName, boundarySource, opts.type, maxzoom));
      }
      // 天地图的中文标注瓦片
      if (DEFAULT_SOURCES_LABELS[key] && !isBooleanFlase(opts.labels)) {
        const labelsLayerName = `${DEFAULT_SOURCES_LABELS[key]}_${isWGS84 ? 'c' : 'w'}`;
        const labelsSource = getTDTSource(labelsLayerName, opts.type, opts.tk, maxzoom);
        labelsSource && layers[key].push(getTDTLayer(this.id, labelsLayerName, labelsSource, opts.type, maxzoom));
      }
    });
    return layers;
  }
}

export default Tianditu;
