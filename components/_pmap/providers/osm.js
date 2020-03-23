/**
 * @文件说明: Providers.OSM Open Street Map数据源
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-23 17:31:25
 */

import hat from 'hat';

// OSM地图图层服务源的类型
export const osmLayersTypes = ['vec', 'bike', 'traffic', 'humanitarian'];

// OSM地图的限制地图Map属性
export const osmMapOptions = {
  minZoom: 1,
  maxZoom: 18,
};

// OSM地图瓦片服务地址
const osmTilesUrls = {
  vec: ['a', 'b', 'c'].map(key => `http://${key}.tile.openstreetmap.org/{z}/{x}/{y}.png`),
  bike: ['a', 'b', 'c'].map(key => `http://${key}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png`),
  traffic: ['a', 'b', 'c'].map(key => `http://${key}.tile.thunderforest.com/transport/{z}/{x}/{y}.png`),
  humanitarian: ['a', 'b', 'c'].map(key => `http://tile-${key}.openstreetmap.fr/hot/{z}/{x}/{y}.png`),
};

class OSM {
  constructor(iMapApi) {
    this.iMapApi = iMapApi;
    this.id = hat();
  }

  /**
   * 获取OSM地图服务源的图层对象
   * @param {Object} options 服务源的参数选项
   */
  getLayers(options = {}) {
    const layers = {};
    // 生成OSM对应类型的图层集合
    osmLayersTypes.map(key => {
      layers[key] = [];
      const layer = {
        id: `providers_osm_${key}_${this.id}`,
        type: 'raster',
        source: {
          type: 'raster',
          tileSize: 256,
          minzoom: osmMapOptions.minZoom,
          maxzoom: osmMapOptions.maxZoom,
          tiles: osmTilesUrls[key],
        },
        minzoom: osmMapOptions.minZoom,
        maxzoom: osmMapOptions.maxZoom,
        metadata: {
          serviceType: 'XYZTile',
        },
      };
      layers[key].push(layer);
    });
    return layers;
  }
}

export default OSM;
