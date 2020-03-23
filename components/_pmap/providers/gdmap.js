/**
 * @文件说明: Providers.GDMap 高德Map数据源
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-23 19:41:09
 */

import hat from 'hat';
import assign from 'lodash/assign';
import { isBooleanFlase } from '../../_util/methods-util';

// GDMap地图图层服务源的类型
export const gdLayersTypes = ['vec', 'img'];

// GDMap地图的限制地图Map属性
export const gdMapOptions = {
  minZoom: 2,
  maxZoom: 17,
};

// GDMap地图瓦片服务地址
const gdTilesUrls = {
  vec: [1, 2, 3, 4].map(key => `http://webrd0${key}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=8`),
  img: {
    default: [1, 2, 3, 4].map(key => `https://wprd0${key}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=6&ltype=11`),
    labels: [1, 2, 3, 4].map(key => `http://webst0${key}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8`),
  },
};

// 默认服务数据源的参数选项
const DEFAULT_OPTIONS = {
  // 是否配置地名文本标注
  labels: true,
};

/**
 * 根据服务源的规则生成图层的数据源对象
 * @param {String} type 服务源类型
 * @param {Object} options 服务源的参数选项
 * @param {String} key 数据源的二级Key名
 */
const getGDSource = function(type, options, key) {
  const source = {
    type: 'raster',
    tileSize: 256,
    minzoom: gdMapOptions.minZoom,
    maxzoom: gdMapOptions.maxZoom + 1,
  };
  // 添加数据源地址
  switch (type) {
    case 'vec': {
      source.tiles = gdTilesUrls[type];
      break;
    }
    case 'img': {
      source.tiles = gdTilesUrls[type][key || 'default'];
      break;
    }
  }
  return source;
};

/**
 * 根据服务图层源生成对应的MapboxGL支持的Layer图层对象
 * @param {String} id 图层id
 * @param {String} layerName 图层名称
 * @param {Object} source 图层服务源
 */
const getGDLayer = function(id, layerName, source) {
  const prefix = 'providers_gdmap';
  return {
    id: `${prefix}_${layerName}_${id}`,
    type: 'raster',
    source,
    minzoom: gdMapOptions.minZoom,
    maxzoom: gdMapOptions.maxZoom + 1,
    metadata: {
      serviceType: 'XYZTile',
    },
  };
};

class GDMap {
  constructor(iMapApi) {
    this.iMapApi = iMapApi;
    this.id = hat();
  }

  /**
   * 获取GDMap地图服务源的图层对象
   * @param {Object} options 服务源的参数选项
   */
  getLayers(options = {}) {
    const opts = assign({}, DEFAULT_OPTIONS, options);
    const layers = {};
    // 生成高德对应类型的图层集合
    gdLayersTypes.map(key => {
      layers[key] = [];
      // 基础底图
      const baseSource = getGDSource(key, opts);
      baseSource && layers[key].push(getGDLayer(this.id, key, baseSource));
      // 中文标注瓦片
      if (key !== 'vec' && !isBooleanFlase(opts.labels)) {
        const labelsSource = getGDSource(key, opts, 'labels');
        labelsSource && layers[key].push(getGDLayer(this.id, `${key}_labels`, labelsSource));
      }
    });
    return layers;
  }
}

export default GDMap;
