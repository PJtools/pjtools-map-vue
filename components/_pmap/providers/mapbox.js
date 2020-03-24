/**
 * @文件说明: Providers.Mapbox 原生Mapbox数据源
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-23 22:05:31
 */

import assign from 'lodash/assign';
import { fetchGetJson } from '../../_util/methods-util';

// Mapbox地图图层服务源的类型
export const mapboxLayersTypes = ['vec'];

// Mapbox地图的限制地图Map属性
export const mapboxMapOptions = {
  mapCRS: null,
};

// 默认服务数据源的参数选项
const DEFAULT_OPTIONS = {
  // Mapbox地图的样式地址
  style: null,
  // Mapbox地图的Token密钥
  accessToken: null,
};

/**
 * 解析Mapbox服务的服务地址获取图层、样式等信息
 * @param {String} style Mapbox地图的样式链接
 * @param {String} accessToken Mapbox地图的token密钥
 */
const fetchMapboxService = (style, accessToken) => {
  return new Promise((resolve, reject) => {
    // 转换真实的服务信息地址
    const url = `https://api.mapbox.com/${style.replace(/mapbox:\/\/styles\//g, 'styles/v1/')}?access_token=${accessToken}`;
    fetchGetJson(url)
      .then(data => {
        const layers = [];
        const layersSource = [];
        data &&
          data.layers &&
          data.layers.map(item => {
            // 拼接必要的metadata属性
            const metadata = { serviceType: 'VTS' };
            metadata.visibility = item.layout && item.layout.visibility && item.layout.visibility === 'none' ? 'none' : 'visible';
            const layer = assign({}, item, {
              metadata: assign({}, item.metadata || {}, metadata),
            });
            const layerSource = assign({}, layer);
            // 替换数据源
            if (layerSource.source) {
              layerSource.source = {
                id: layerSource.source,
                ...data.sources[layerSource.source],
              };
            }
            layers.push(layer);
            layersSource.push(layerSource);
          });
        data.layers = layers;
        resolve({ style: data, layers: { vec: layersSource } });
      })
      .catch(() => {
        console.error('解析Mapbox样式服务失败，请检查[style]或[accessToken]属性是否有效.');
        reject();
      });
  });
};

class Mapbox {
  constructor(iMapApi) {
    this.iMapApi = iMapApi;
  }

  /**
   * 获取Mapbox服务源的图层对象
   * @param {Object} options 服务源的参数选项
   */
  async getLayers(options = {}) {
    const opts = assign({}, DEFAULT_OPTIONS, options);
    if (!opts.style || !opts.accessToken || !GeoGlobe) {
      console.error('渲染Mapbox地图的[style]、[accessToken]必填项属性不可缺少.');
      return null;
    }
    return await fetchMapboxService(opts.style, opts.accessToken, GeoGlobe);
  }
}

export default Mapbox;
