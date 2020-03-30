/**
 * @文件说明: Query.GeoQuery - GeoQuery服务
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-30 10:40:52
 */

import assign from 'lodash/assign';
import hat from 'hat';
import { isEmpty, isBooleanFlase, isNotEmptyArray, fetchPostJson } from '../../_util/methods-util';
import { arcgisToGeoJSON } from '@esri/arcgis-to-geojson-utils';
import { toArcgisFilterValue } from './arcgisQuery';

const defaultQueryOptions = {
  // 返回结果模式，可选值：[ result | count | ids ]
  mode: 'result',
  // 图层关联显示字段的快捷关键词搜索，如设置[filters]属性则忽略；
  text: null,
  // 查询图层的默认Object ID属性，多个以逗号分割
  objectIds: null,
  // 空间参考
  srs: null,
  // 输出空间参考
  outSRS: null,
  // 输出的属性字段
  outFields: null,
  // 几何空间关系
  spatialRel: 'SpatialRelIntersects',
  // 是否返回空间Geometry数据
  returnGeometry: true,
  // 指定允许最大偏差范围
  maxAllowableOffset: null,
  // GeoQuery的关系参数
  relationParam: null,
};

/**
 * 获取GeoQuery的选项
 */
const getGeoQueryParams = options => {
  const params = {};
  !isEmpty(options.text) && (params.text = options.text);
  params.inSR = !isEmpty(options.srs) ? options.srs : '';
  params.outSR = !isEmpty(options.outSRS) ? options.outSRS : params.inSR;
  params.outFields = !isEmpty(options.outFields) ? options.outFields : '';
  params.spatialRel = options.spatialRel || defaultQueryOptions.spatialRel;
  params.returnGeometry = isBooleanFlase(options.returnGeometry) ? false : true;
  !isEmpty(options.relationParam) && (params.relationParam = options.relationParam);
  !isEmpty(options.objectIds) && (params.objectIds = options.objectIds);
  !isEmpty(options.maxAllowableOffset) && (params.maxAllowableOffset = options.maxAllowableOffset);
  params.mode = !isEmpty(options.mode) && ['count', 'ids', 'result'].indexOf(options.mode) !== -1 ? options.mode : 'result';
  params.returnIdsOnly = params.mode === 'ids' || params.mode === 'count' ? true : false;
  params.f = 'json';
  return params;
};

/**
 * 查询过滤条件进行数据转换
 */
const getQueryFilters = options => {
  if (isNotEmptyArray(options.filters)) {
    const toQueryFilters = filters => {
      let where = null;
      let geometryWhere = null;
      const logical = filters[0] && filters[0].toUpperCase();
      // 判断过滤条件是否为复合逻辑条件
      if (logical && ['AND', 'OR'].indexOf(logical) !== -1) {
        const condition = [];
        for (let i = 1, len = filters.length; i < len; i++) {
          if (isNotEmptyArray(filters[i])) {
            const result = toQueryFilters(filters[i]);
            result.where && condition.push(result.where);
            result.geometryWhere && (geometryWhere = result.geometryWhere);
          }
        }
        if (isNotEmptyArray(condition)) {
          const xfilters = [];
          condition.map(item => {
            xfilters.push(`(${item})`);
          });
          where = xfilters.join(` ${logical} `);
        }
      } else {
        // 判断过滤条件是否为一般逻辑条件
        if (logical && ['==', '!=', '<', '>', '<=', '>=', '..', 'BETWEEN', '~', 'LIKE', 'NULL', '*'].indexOf(logical) !== -1) {
          // 根据类型设置属性
          switch (logical) {
            case '==':
              where = `${filters[1]} = ${toArcgisFilterValue(filters[2], filters[3])}`;
              break;
            case '!=':
              where = `${filters[1]} != ${toArcgisFilterValue(filters[2], filters[3])}`;
              break;
            case '<':
              where = `${filters[1]} < ${filters[2]}`;
              break;
            case '>':
              where = `${filters[1]} > ${filters[2]}`;
              break;
            case '<=':
              where = `${filters[1]} <= ${filters[2]}`;
              break;
            case '>=':
              where = `${filters[1]} >= ${filters[2]}`;
              break;
            case '..':
            case 'BETWEEN':
              where = `${filters[1]} BETWEEN ${toArcgisFilterValue(filters[2], filters[4])} AND ${toArcgisFilterValue(filters[3], filters[4])}`;
              break;
            case '~':
            case 'LIKE':
              where = `${filters[1]} LIKE '${filters[2].indexOf('%') !== -1 ? filters[2] : `%${filters[2]}%`}'`;
              break;
            case 'NULL':
              where = `${filters[1]} IS NULL`;
              break;
            case '*':
              where = `${String(filters[1]).replace(/"/g, `'`)}`;
              break;
          }
        } else if (logical && ['BBOX', 'POINT', 'LINE', 'PATH', 'POLYGON'].indexOf(logical) !== -1) {
          // 根据类型设置空间属性
          switch (logical) {
            case 'BBOX':
              geometryWhere = {
                geometryType: 'GeometryEnvelope',
                geometry: { xmin: filters[1][0][0], ymin: filters[1][0][1], xmax: filters[1][1][0], ymax: filters[1][1][1] },
              };
              break;
            case 'POINT':
              geometryWhere = {
                geometryType: 'GeometryPoint',
                geometry: { x: filters[1][0], y: filters[1][1] },
              };
              break;
            case 'LINE':
            case 'PATH':
              geometryWhere = {
                geometryType: 'GeometryPolyline',
                geometry: { paths: [filters[1]] },
              };
              break;
            case 'POLYGON':
              geometryWhere = {
                geometryType: 'GeometryPolygon',
                geometry: { rings: filters[1] },
              };
              break;
          }
        }
      }
      return { where, geometryWhere };
    };
    return toQueryFilters(options.filters);
  }
  return null;
};

class GeoQuery {
  /**
   * 发送GeoQuery服务任务，获取指定过滤条件的GeoJSON要素数据集合
   * @param {String} url 服务地址
   * @param {String} typeName 要素图层标识名
   * @param {Object} options 解析服务的参数选项
   */
  async queryTask(url, typeName = '', options = {}) {
    const opts = assign({}, defaultQueryOptions, options);
    return new Promise((resolve, reject) => {
      // 获取查询服务的参数选项
      const params = getGeoQueryParams(opts);
      // 获取查询过滤条件
      const filters = getQueryFilters(opts, params);
      if (filters) {
        params.where = filters.where || '';
        if (filters.geometryWhere && filters.geometryWhere.geometry) {
          params.geometry = filters.geometryWhere.geometry;
          params.geometryType = filters.geometryWhere.geometryType || 'esriGeometryEnvelope';
        }
      } else {
        params.where = 'OID<=10';
      }
      // 判断是否为统计模式
      if (params.mode === 'count') {
        params.where = 'OID>=0';
        params.geometry = '';
        params.returnGeometry = false;
      }
      // 发送查询请求任务
      const errorMsg = `GeoQuery查询服务[ ${url} ]要素数据解析失败，请检查[filters]过滤条件或属性信息等是否有误.`;
      fetchPostJson(url.replace(/\/MapServer/g, `/MapServer/${typeName}/query`), params)
        .then(data => {
          switch (params.mode) {
            case 'count': {
              resolve((data && data.objectIds && data.objectIds.length) || 0);
              break;
            }
            case 'ids': {
              resolve(data && data.objectIds ? data.objectIds : []);
              break;
            }
            default: {
              const geojson = {
                type: 'FeatureCollection',
                features: [],
              };
              const xdata = arcgisToGeoJSON(data);
              if (xdata && xdata.features) {
                xdata.features.map(f => {
                  f.id = opts.idField ? f.properties[opts.idField].toString() : hat();
                  geojson.features.push(f);
                });
              }
              resolve(geojson);
              break;
            }
          }
        })
        .catch(e => {
          console.error(errorMsg);
          reject();
        });
    });
  }
}

export default GeoQuery;
