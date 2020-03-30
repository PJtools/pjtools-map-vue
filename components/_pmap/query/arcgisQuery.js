/**
 * @文件说明: Query.ArcgisQuery - Arcgis Query服务
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-29 18:14:00
 */

import assign from 'lodash/assign';
import hat from 'hat';
import { isEmpty, isBooleanFlase, isBooleanTrue, isArray, isNotEmptyArray, isString, fetchPostJson } from '../../_util/methods-util';
import { arcgisToGeoJSON } from '@esri/arcgis-to-geojson-utils';

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
  outFields: '*',
  // 几何空间关系
  spatialRel: 'esriSpatialRelIntersects',
  // 是否返回空间Geometry数据
  returnGeometry: true,
  // 排序条件，规则：['name', 'DESC'] 或 [['name', 'ASC'], ['name', 'DESC'], ...]
  sort: null,
  // Arcgis Query的关系参数
  relationParam: null,
  // 针对多时态，时间戳
  time: null,
  // 指定允许最大偏差范围
  maxAllowableOffset: null,
  // 指定Geometry的空间数据的精度位数
  geometryPrecision: null,
  // 作用于分组统计分析计算的条件
  outStatistics: null,
  // Group分组的字段
  groupByFieldsForStatistics: null,
  // 是否返回几何数据的Z值
  returnZ: false,
  // 是否返回几何数据的M值
  returnM: false,
  // 地理数据库版本
  gdbVersion: null,
  // 返回数据去重
  returnDistinctValues: false,
  // 返回Curves曲线（10.3版本的新特性）
  returnTrueCurves: false,
  // 开始条目数（10.3版本的新特性）
  resultOffset: null,
  // 返回结果条目数（10.3版本的新特性）
  resultRecordCount: null,
};

/**
 * 获取Arcgis Query的选项
 */
const getArcgisQueryParams = options => {
  const params = {};
  !isEmpty(options.text) && (params.text = options.text);
  params.inSR = !isEmpty(options.srs) ? options.srs : '';
  params.outSR = !isEmpty(options.outSRS) ? options.outSRS : params.inSR;
  params.outFields = !isEmpty(options.outFields) ? options.outFields : '*';
  params.spatialRel = options.spatialRel || defaultQueryOptions.spatialRel;
  params.returnGeometry = isBooleanFlase(options.returnGeometry) ? false : true;
  !isEmpty(options.relationParam) && (params.relationParam = options.relationParam);
  !isEmpty(options.objectIds) && (params.objectIds = options.objectIds);
  !isEmpty(options.time) && (params.time = options.time);
  !isEmpty(options.maxAllowableOffset) && (params.maxAllowableOffset = options.maxAllowableOffset);
  !isEmpty(options.geometryPrecision) && (params.geometryPrecision = options.geometryPrecision);
  params.mode = !isEmpty(options.mode) && ['count', 'ids', 'result'].indexOf(options.mode) !== -1 ? options.mode : 'result';
  params.returnCountOnly = params.mode === 'count' ? true : false;
  params.returnIdsOnly = params.mode === 'ids' ? true : false;
  !isEmpty(options.outStatistics) && (params.outStatistics = options.outStatistics);
  !isEmpty(options.groupByFieldsForStatistics) && (params.groupByFieldsForStatistics = options.groupByFieldsForStatistics);
  isBooleanTrue(options.returnZ) && (params.returnZ = true);
  isBooleanTrue(options.returnM) && (params.returnM = true);
  !isEmpty(options.gdbVersion) && (params.gdbVersion = options.gdbVersion);
  isBooleanTrue(options.returnDistinctValues) && (params.returnDistinctValues = true);
  isBooleanTrue(options.returnTrueCurves) && (params.returnTrueCurves = true);
  !isEmpty(options.resultOffset) && (params.resultOffset = options.resultOffset);
  !isEmpty(options.resultRecordCount) && (params.resultRecordCount = options.resultRecordCount);
  // 排序
  let sortBy = null;
  if (isArray(options.sort)) {
    sortBy = [];
    // 判断是否为多字段排序
    if (isArray(options.sort[0])) {
      options.sort.map(item => {
        sortBy.push(`${item[0]} ${item[1] && ['ASC', 'DESC'].indexOf(item[1].toUpperCase()) !== -1 ? item[1].toUpperCase() : 'ASC'}`);
      });
    } else {
      sortBy.push(
        `${options.sort[0]} ${
          options.sort[1] && ['ASC', 'DESC'].indexOf(options.sort[1].toUpperCase()) !== -1 ? options.sort[1].toUpperCase() : 'ASC'
        }`,
      );
    }
  }
  sortBy && (params.orderByFields = sortBy.join(','));
  params.f = 'pjson';
  return params;
};

/**
 * 处理Value值是否增加字符串单引号
 * @param {Number|String} value 待转换的值
 * @param {Boolean} string 是否强制转换成字符串格式
 */
const toArcgisFilterValue = (value, string = false) => {
  // 判断是否强制处理为字符串
  if (isBooleanTrue(string)) {
    return `'${value}'`;
  } else {
    if (isString(value)) {
      value = value.replace(/"/g, `'`);
      // 判断首尾是否已增加单引号
      const splitString = value.split('');
      if (splitString[0] === "'" && splitString[splitString.length - 1] === "'") {
        return value;
      } else {
        return `'${value}'`;
      }
    } else if (typeof value === 'number') {
      return value;
    } else {
      return String(value);
    }
  }
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
                geometryType: 'esriGeometryEnvelope',
                geometry: { xmin: filters[1][0][0], ymin: filters[1][0][1], xmax: filters[1][1][0], ymax: filters[1][1][1] },
              };
              break;
            case 'POINT':
              geometryWhere = {
                geometryType: 'esriGeometryPoint',
                geometry: { x: filters[1][0], y: filters[1][1] },
              };
              break;
            case 'LINE':
            case 'PATH':
              geometryWhere = {
                geometryType: 'esriGeometryPolyline',
                geometry: { paths: [filters[1]] },
              };
              break;
            case 'POLYGON':
              geometryWhere = {
                geometryType: 'esriGeometryPolygon',
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

class ArcgisQuery {
  /**
   * 发送WFS服务任务，获取指定过滤条件的GeoJSON要素数据集合
   * @param {String} url 服务地址
   * @param {String} typeName 要素图层标识名
   * @param {Object} options 解析服务的参数选项
   */
  async queryTask(url, typeName = '', options = {}) {
    const opts = assign({}, defaultQueryOptions, options);
    return new Promise((resolve, reject) => {
      // 获取查询服务的参数选项
      const params = getArcgisQueryParams(opts);
      // 获取查询过滤条件
      const filters = getQueryFilters(opts, params);
      if (filters) {
        params.where = filters.where;
        if (filters.geometryWhere && filters.geometryWhere.geometry) {
          params.geometry = filters.geometryWhere.geometry;
          params.geometryType = filters.geometryWhere.geometryType || 'esriGeometryEnvelope';
        }
      } else {
        params.where = '1=1';
      }
      // 发送查询请求任务
      const errorMsg = `Arcgis Query查询服务[ ${url} ]要素数据解析失败，请检查[filters]过滤条件或属性信息等是否有误.`;
      let queryUrl = '';
      if (url.indexOf('/FeatureServer') !== -1) {
        queryUrl = url.replace(/\/FeatureServer/g, `/FeatureServer/${typeName}/query`);
      } else {
        queryUrl = url.replace(/\/MapServer/g, `/MapServer/${typeName}/query`);
      }
      fetchPostJson(queryUrl, params)
        .then(data => {
          switch (params.mode) {
            case 'count': {
              resolve((data && data.count) || 0);
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
        .catch(() => {
          console.error(errorMsg);
          reject();
        });
    });
  }
}

export default ArcgisQuery;
