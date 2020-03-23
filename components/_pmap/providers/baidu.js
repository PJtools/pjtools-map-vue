/**
 * @文件说明: Providers.Baidu 百度数据源
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-23 14:45:39
 */

import hat from 'hat';
import assign from 'lodash/assign';
import { isEmpty, isBooleanFlase } from '../../_util/methods-util';

// 百度的图层服务源的类型
export const bdLayersTypes = ['vec', 'img'];

// 百度地图的限制地图Map属性
export const bdMapOptions = {
  mapCRS: 'baidu',
  minZoom: 3,
  maxZoom: 18,
};

// 百度瓦片服务地址
const baiduTilesUrls = {
  vec: {
    default: [0, 1, 2, 3, 4].map(
      key => `http://online${key}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&scaler={{scale}}&styles=pl&p=1&udt=20200317`,
    ),
    custom: [0, 1, 2].map(key => `http://api${key}.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&scale={{scale}}&udt=20200317`),
  },
  img: {
    default: [0, 1, 2, 3].map(
      key => `https://maponline${key}.bdimg.com/starpic/?qt=satepc&u=x={x};y={y};z={z};v=009;type=sate&fm=46&app=webearth2&v=009&udt=20200317`,
    ),
    labels: [0, 1, 2, 3].map(
      key => `https://maponline${key}.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=sl&scaler={{scale}}&showtext=1&v=083&udt=20200317`,
    ),
  },
  traffic: [0, 1, 2, 3].map(key => `http://its.map.baidu.com:8002/traffic/TrafficTileService?v=016&scaler={{scale}}&level={z}&x={x}&y={y}`),
};

// 默认服务数据源的参数选项
const DEFAULT_OPTIONS = {
  // 地图缩放比
  scale: 2,
  // 百度个性化地图的样式
  styles: null,
  // 是否配置地名文本标注
  labels: true,
};

/**
 * 根据百度服务源的规则生成图层的数据源对象
 * @param {String} type 服务源类型
 * @param {Object} options 服务源的参数选项
 * @param {String} key 数据源的二级Key名
 */
const getBDSource = function(type, options, key) {
  const source = {
    type: 'raster',
    rasterType: 'baidu',
    tileSize: 256,
    minzoom: bdMapOptions.minZoom,
    maxzoom: bdMapOptions.maxZoom + 1,
  };
  const scale = options.scale && String(options.scale) === '1' ? '1' : '2';
  // 添加数据源地址
  switch (type) {
    case 'vec': {
      // 判断是否有个性化样式
      if (!isEmpty(options.styles)) {
        source.tiles = baiduTilesUrls[type].custom.map(item => `${item.replace(/{{scale}}/g, scale)}&styles=${options.styles}`);
      } else {
        source.tiles = baiduTilesUrls[type].default.map(item => item.replace(/{{scale}}/g, scale));
      }
      break;
    }
    case 'img': {
      source.tiles = baiduTilesUrls[type][key || 'default'].map(item => item.replace(/{{scale}}/g, scale));
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
const getBDLayer = function(id, layerName, source) {
  const prefix = 'providers_baidu';
  return {
    id: `${prefix}_${layerName}_${id}`,
    type: 'raster',
    source,
    minzoom: bdMapOptions.minZoom,
    maxzoom: bdMapOptions.maxZoom + 1,
    metadata: {
      serviceType: 'XYZTile',
    },
  };
};

class Baidu {
  constructor(iMapApi) {
    this.iMapApi = iMapApi;
    this.id = hat();
  }

  /**
   * 获取百度服务源的图层对象
   * @param {Object} options 服务源的参数选项
   */
  getLayers(options = {}) {
    const opts = assign({}, DEFAULT_OPTIONS, options);
    const layers = {};
    // 生成百度对应类型的图层集合
    bdLayersTypes.map(key => {
      layers[key] = [];
      // 基础底图
      const baseSource = getBDSource(key, opts);
      baseSource && layers[key].push(getBDLayer(this.id, key, baseSource));
      // 中文标注瓦片
      if (key !== 'vec' && !isBooleanFlase(opts.labels)) {
        const labelsSource = getBDSource(key, opts, 'labels');
        labelsSource && layers[key].push(getBDLayer(this.id, `${key}_labels`, labelsSource));
      }
    });
    return layers;
  }

  /**
   * 获取百度的实时路况瓦片服务图层
   * @param {String} id 图层Id名称
   */
  getTrafficLayer(id, options = {}) {
    const time = new Date().getTime();
    const scale = options && options.scale && String(options.scale) === '1' ? '1' : '2';
    const layer = {
      id: id || hat(),
      type: 'raster',
      source: {
        type: 'raster',
        rasterType: 'baidu',
        minzoom: 7,
        maxzoom: bdMapOptions.maxZoom,
        tileSize: 256,
        tiles: baiduTilesUrls.traffic.map(item => `${item.replace(/{{scale}}/g, scale)}&time=${time}`),
      },
      metadata: {
        serviceType: 'XYZTile',
      },
    };
    return layer;
  }
}

export default Baidu;
