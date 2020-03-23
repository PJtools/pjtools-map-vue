/**
 * @文件说明: Providers.Google 谷歌Map数据源
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-23 19:21:44
 */

import hat from 'hat';

// Google地图图层服务源的类型
export const googleLayersTypes = ['vec', 'img'];

// Google地图的限制地图Map属性
export const googleMapOptions = {
  minZoom: 0,
  maxZoom: 19,
};

// Google地图瓦片服务地址
const googleTilesUrls = {
  vec: [
    `http://www.google.cn/maps/vt/pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i345013117!3m8!2szh-CN!3scn!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0`,
  ],
  img: [0, 1, 2].map(key => `http://mt${key}.google.cn/vt/lyrs=y&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=G`),
};

class Google {
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
    googleLayersTypes.map(key => {
      layers[key] = [];
      const layer = {
        id: `providers_google_${key}_${this.id}`,
        type: 'raster',
        source: {
          type: 'raster',
          tileSize: 256,
          minzoom: googleMapOptions.minZoom,
          maxzoom: googleMapOptions.maxZoom + 1,
          tiles: googleTilesUrls[key],
        },
        minzoom: googleMapOptions.minZoom,
        maxzoom: googleMapOptions.maxZoom + 1,
        metadata: {
          serviceType: 'XYZTile',
        },
      };
      layers[key].push(layer);
    });
    return layers;
  }
}

export default Google;
