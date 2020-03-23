/**
 * @文件说明: Providers.Bing 必应Map数据源
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-23 19:03:27
 */

import hat from 'hat';

// Bing地图图层服务源的类型
export const bingLayersTypes = ['vec'];

// Bing地图的限制地图Map属性
export const bingMapOptions = {
  minZoom: 1,
  maxZoom: 20,
  transformRequest: function(url, resourceType) {
    if (resourceType === 'Tile' && url.startsWith('http://dynamic.t') && url.indexOf('tiles.ditu.live.com/comp/ch/') !== -1) {
      const format = url.match(/\{[\S\s]+\}/);
      // 提取x, y, z
      if (format && format[0]) {
        let xyz = format[0].replace(/\{/g, '').replace(/\}/g, '');
        xyz = xyz.split(',');
        const z = parseInt(xyz[2], 10);
        let x = parseInt(xyz[0], 10);
        let y = parseInt(xyz[1], 10) - 1;
        let idx = 0;
        let result = '';
        for (; idx < z; idx++) {
          result = ((x & 1) + 2 * (y & 1)).toString() + result;
          x >>= 1;
          y >>= 1;
        }
        // 替换xyz
        return {
          url: url.replace(format, result),
          credentials: 'same-origin',
        };
      }
    }
  },
};

// Bing地图瓦片服务地址
const bingTilesUrls = {
  vec: [0, 1, 2, 3].map(key => `http://dynamic.t${key}.tiles.ditu.live.com/comp/ch/{{x},{y},{z}}?it=G,VE,BX,L,LA&mkt=zh-cn,syr&n=z&og=111&ur=CN`),
};

class Bing {
  constructor(iMapApi) {
    this.iMapApi = iMapApi;
    this.id = hat();
  }

  /**
   * 获取Bing地图服务源的图层对象
   * @param {Object} options 服务源的参数选项
   */
  getLayers(options = {}) {
    const layers = {};
    // 生成Bing对应类型的图层集合
    bingLayersTypes.map(key => {
      layers[key] = [];
      const layer = {
        id: `providers_bing_${key}_${this.id}`,
        type: 'raster',
        source: {
          type: 'raster',
          tileSize: 256,
          minzoom: bingMapOptions.minZoom,
          maxzoom: bingMapOptions.maxZoom + 1,
          tiles: bingTilesUrls[key],
        },
        minzoom: bingMapOptions.minZoom,
        maxzoom: bingMapOptions.maxZoom + 1,
        metadata: {
          serviceType: 'XYZTile',
        },
      };
      layers[key].push(layer);
    });
    return layers;
  }
}

export default Bing;
