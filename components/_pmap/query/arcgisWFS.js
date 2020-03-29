/**
 * @文件说明: Query.ArcgisWFS - Arcgis WFS服务
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-28 15:53:18
 */

import assign from 'lodash/assign';
import hat from 'hat';
import { defaultQueryOptions, getWFSQuery, getQueryFilters, fetchTotalTask } from './wfs';

class ArcgisWFS {
  constructor(GeoGlobe) {
    this.GeoGlobe = GeoGlobe;
  }

  /**
   * 发送ArcgisWFS服务任务，获取指定过滤条件的GeoJSON要素数据集合
   * @param {String} url 服务地址
   * @param {String} typeName 要素图层标识名
   * @param {Object} options 解析服务的参数选项
   */
  async queryTask(url, typeName = '', options = {}) {
    const opts = assign({}, defaultQueryOptions, options);
    return new Promise((resolve, reject) => {
      // 获取查询服务实例
      const wfsQuery = getWFSQuery(this.GeoGlobe, url, typeName, opts);
      if (wfsQuery.geometryName === 'GEOMETRY') {
        wfsQuery.geometryName = 'SHAPE';
      }
      // 获取查询过滤条件
      const filters = getQueryFilters(this.GeoGlobe, opts, wfsQuery);
      // 发送查询请求任务
      const errorMsg = `Arcgis WFS查询服务[ ${url} ]要素数据解析失败，请检查[filters]过滤条件或属性信息等是否有误.`;
      const failFun = () => {
        console.error(errorMsg);
        reject();
      };
      const successFun = data => {
        if (opts.mode !== 'count') {
          const geojson = data && data.features && data.features.length > 0 ? data.geojson : { type: 'FeatureCollection', features: [] };
          geojson.features.map(f => {
            f.id = opts.idField ? f.properties[opts.idField].toString() : hat();
          });
          resolve(geojson);
        } else {
          resolve(data);
        }
      };
      if (wfsQuery) {
        switch (opts.mode) {
          case 'count': {
            fetchTotalTask(GeoGlobe, wfsQuery)
              .then(successFun)
              .catch(failFun);
            break;
          }
          default: {
            wfsQuery.query(filters, successFun, failFun);
            break;
          }
        }
      } else {
        failFun();
      }
    });
  }
}

export default ArcgisWFS;
