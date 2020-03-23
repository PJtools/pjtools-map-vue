/**
 * @文件说明: Providers.QQMap 腾讯Map数据源
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-23 20:37:39
 */

import hat from 'hat';
import assign from 'lodash/assign';
import { isBooleanFlase } from '../../_util/methods-util';

// QQMap地图图层服务源的类型
export const qqLayersTypes = ['vec', 'img'];

// QQMap地图的限制地图Map属性
export const qqMapOptions = {
  minZoom: 1,
  maxZoom: 17,
  transformRequest: function(url, resourceType) {
    if (resourceType === 'Tile' && /^https:\/\/p[0-9].map.gtimg.com\/sateTiles.*$/.test(url)) {
      const format = url.match(/\{[\S\s]+\}/);
      // 提取x, y, z
      if (format && format[0]) {
        let xyz = format[0].replace(/\{/g, '').replace(/\}/g, '');
        xyz = xyz.split(',');
        const z = parseInt(xyz[2], 10);
        const x = parseInt(xyz[0], 10);
        const y = parseInt(xyz[1], 10);
        // 替换xyz
        return {
          url: url.replace(format, `${z}/${Math.floor(x / 16)}/${Math.floor(y / 16)}/${x}_${y}`),
        };
      }
    }
  },
};

// QQMap地图瓦片服务地址
const qqTilesUrls = {
  vec: [1, 2, 3].map(key => `http://rt${key}.map.gtimg.com/tile?z={z}&x={x}&y={y}&version=295`),
  img: {
    default: [1, 2, 3].map(key => `https://p${key}.map.gtimg.com/sateTiles/{{x},{y},{z}}.jpg?version=295`),
    labels: [1, 2, 3].map(key => `http://rt${key}.map.gtimg.com/tile?z={z}&x={x}&y={y}&styleid=2&version=295`),
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
const getQQSource = function(type, options, key) {
  const source = {
    type: 'raster',
    tileSize: 256,
    scheme: 'tms',
    minzoom: qqMapOptions.minZoom,
    maxzoom: qqMapOptions.maxZoom + 1,
  };
  // 添加数据源地址
  switch (type) {
    case 'vec': {
      source.tiles = qqTilesUrls[type];
      break;
    }
    case 'img': {
      source.tiles = qqTilesUrls[type][key || 'default'];
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
const getQQLayer = function(id, layerName, source) {
  const prefix = 'providers_qqmap';
  return {
    id: `${prefix}_${layerName}_${id}`,
    type: 'raster',
    source,
    minzoom: qqMapOptions.minZoom,
    maxzoom: qqMapOptions.maxZoom + 1,
    metadata: {
      serviceType: 'XYZTile',
    },
  };
};

class QQMap {
  constructor(iMapApi) {
    this.iMapApi = iMapApi;
    this.id = hat();
  }

  /**
   * 获取QQMap地图服务源的图层对象
   * @param {Object} options 服务源的参数选项
   */
  getLayers(options = {}) {
    const opts = assign({}, DEFAULT_OPTIONS, options);
    const layers = {};
    // 生成腾讯对应类型的图层集合
    qqLayersTypes.map(key => {
      layers[key] = [];
      // 基础底图
      const baseSource = getQQSource(key, opts);
      baseSource && layers[key].push(getQQLayer(this.id, key, baseSource));
      // 中文标注瓦片
      if (key !== 'vec' && !isBooleanFlase(opts.labels)) {
        const labelsSource = getQQSource(key, opts, 'labels');
        labelsSource && layers[key].push(getQQLayer(this.id, `${key}_labels`, labelsSource));
      }
    });
    return layers;
  }
}

export default QQMap;
