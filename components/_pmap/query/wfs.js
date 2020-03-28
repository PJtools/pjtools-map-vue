/**
 * @文件说明: Query.WFS - WFS服务
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-28 15:53:18
 */

import assign from 'lodash/assign';
import { isEmpty, isBooleanTrue, isNumeric, isBoolean, isArray, isNotEmptyArray } from '../../_util/methods-util';
import hat from 'hat';

export const defaultQueryOptions = {
  // 版本号，可选值：[ 1.0.0 | 1.1.0 ]
  version: '1.0.0',
  // 返回结果模式，可选值：[ result | pagination | count ]
  mode: 'result',
  // 要素命名空间
  featureNS: null,
  // 要素类型前缀
  featurePrefix: null,
  // 要素几何数据XY是否反转，布尔值，默认根据版本自动设置；
  isReverse: null,
  // Geometry属性名，例如：GeoGlobe：GEOMETRY；Arcgis：SHAPE
  geometryName: null,
  // 格式解析器构造参数
  formatOptions: null,
  // 查询结果是否按图层名分类
  isSeparate: false,
  // 空间参考
  srs: null,
  // 返回要素的最大条目数
  max: 10,
  // 针对多时态矢量数据集，要素版本时间
  time: null,
  // 是否追溯，布尔型
  userecent: null,
  // 排序条件，规则：['name', 'DESC'] 或 [['name', 'ASC'], ['name', 'DESC'], ...]
  sort: null,
  // 分页查询模式，当前页码
  curpage: 1,
  // 分页查询模式，每页条目数
  pagesize: 10,
  // 空间查询时，缓冲范围距离，默认为5
  distance: 5,
  // 空间查询时，缓冲范围的单位，可选项：[ m | degree ]
  units: 'm',
  // 空间查询时，Polygon分析时，是包含还是相交
  contain: false,
  // 主键字段，返回要素作为Feature的ID，若为空，则以随机值替代
  idField: null,
};

/**
 * 获取GeoGlobe WFS查询实例
 */
export const getWFSQuery = (GeoGlobe, url, typeName, options) => {
  const opts = {};
  opts.version = !isEmpty(options.version) && ['1.1.0', '1.0.0'].indexOf(options.version) !== -1 ? options.version : defaultQueryOptions.version;
  !isEmpty(options.featureNS) && (opts.featureNS = options.featureNS);
  !isEmpty(options.featurePrefix) && (opts.featurePrefix = options.featurePrefix);
  opts.geometryName = !isEmpty(options.geometryName) ? options.geometryName : 'GEOMETRY';
  const isReverse = isEmpty(options.isReverse) ? (options.version === '1.1.0' ? false : true) : isBooleanTrue(options.isReverse) ? true : false;
  opts.format = opts.version === '1.1.0' ? new GeoGlobe.Format.GML.v3({ xy: isReverse }) : new GeoGlobe.Format.GML.v2({ xy: isReverse });
  !isEmpty(options.formatOptions) && (opts.formatOptions = options.formatOptions);
  opts.isSeparate = isBooleanTrue(options.isSeparate) ? true : false;
  opts.maxFeatures = isNumeric(options.max) ? parseInt(options.max, 10) : defaultQueryOptions.max;
  opts.srsName = !isEmpty(options.srs) ? options.srs : null;
  !isEmpty(options.time) && (opts.time = options.time);
  isBoolean(options.userecent) && (opts.userecent = options.userecent);
  // 排序
  let sortBy = null;
  if (isArray(options.sort)) {
    sortBy = [];
    // 判断是否为多字段排序
    if (isArray(options.sort[0])) {
      options.sort.map(item => {
        sortBy.push({ property: item[0], order: item[1] && ['ASC', 'DESC'].indexOf(item[1].toUpperCase()) !== -1 ? item[1].toUpperCase() : 'ASC' });
      });
    } else {
      sortBy.push({
        property: options.sort[0],
        order: options.sort[1] && ['ASC', 'DESC'].indexOf(options.sort[1].toUpperCase()) !== -1 ? options.sort[1].toUpperCase() : 'ASC',
      });
    }
  }
  sortBy && (opts.sortBy = sortBy);
  !isEmpty(options.groupBy) && (opts.groupBy = options.groupBy);

  return new GeoGlobe.Query.WFSQuery(url, typeName, opts);
};

/**
 * 查询过滤条件进行数据转换
 */
export const getQueryFilters = (GeoGlobe, options, wfsQuery) => {
  if (isNotEmptyArray(options.filters)) {
    const toQueryFilters = filters => {
      // 获取条件项的关键词
      const logical = filters[0] && filters[0].toUpperCase();
      // 判断过滤条件是否为复合逻辑条件
      if (logical && ['AND', 'OR', 'NOT'].indexOf(logical) !== -1) {
        const condition = [];
        for (let i = 1, len = filters.length; i < len; i++) {
          if (isNotEmptyArray(filters[i])) {
            condition.push(toQueryFilters(filters[i]));
          }
        }
        return new GeoGlobe.Filter.Logical({
          type: GeoGlobe.Filter.Logical[logical],
          filters: condition,
        });
      } else {
        // 判断过滤条件是否为一般逻辑条件
        if (logical && ['==', '!=', '<', '>', '<=', '>=', '..', 'BETWEEN', '~', 'LIKE', 'NULL'].indexOf(logical) !== -1) {
          const comparison = {};
          comparison.property = filters[1];
          comparison.matchCase = true;
          // 根据类型设置属性
          switch (logical) {
            case '==':
              comparison.type = GeoGlobe.Filter.Comparison.EQUAL_TO;
              comparison.value = filters[2];
              break;
            case '!=':
              comparison.type = GeoGlobe.Filter.Comparison.NOT_EQUAL_TO;
              comparison.value = filters[2];
              break;
            case '<':
              comparison.type = GeoGlobe.Filter.Comparison.LESS_THAN;
              comparison.value = filters[2];
              break;
            case '>':
              comparison.type = GeoGlobe.Filter.Comparison.GREATER_THAN;
              comparison.value = filters[2];
              break;
            case '<=':
              comparison.type = GeoGlobe.Filter.Comparison.LESS_THAN_OR_EQUAL_TO;
              comparison.value = filters[2];
              break;
            case '>=':
              comparison.type = GeoGlobe.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO;
              comparison.value = filters[2];
              break;
            case '..':
            case 'BETWEEN':
              comparison.type = GeoGlobe.Filter.Comparison.BETWEEN;
              comparison.lowerBoundary = filters[2];
              comparison.upperBoundary = filters[3];
              break;
            case '~':
            case 'LIKE':
              comparison.type = GeoGlobe.Filter.Comparison.LIKE;
              comparison.value = filters[2].indexOf('*') !== -1 ? filters[2] : `*${filters[2]}*`;
              break;
            case 'NULL':
              comparison.type = GeoGlobe.Filter.Comparison.IS_NULL;
              break;
          }
          return new GeoGlobe.Filter.Comparison(comparison);
        } else if (logical && ['BBOX', 'POINT', 'LINE', 'PATH', 'POLYGON'].indexOf(logical) !== -1) {
          const spatial = {};
          spatial.property = wfsQuery.geometryName;
          spatial.value = filters[1];
          // 判断WFS服务是否为1.1.0版本，则空间几何数据需要反转
          if (wfsQuery.version === '1.1.0') {
            const xReverseFun = coords => {
              for (let i = 0, len = coords.length; i < len; i++) {
                // 判断是否还有坐标嵌套层级
                if (isArray(coords[i]) && coords[i][0] && isArray(coords[i][0])) {
                  coords[i] = xReverseFun(coords[i]);
                } else {
                  coords[i] = [coords[i][1], coords[i][0]];
                }
              }
              return coords;
            };
            spatial.value = logical === 'POINT' ? [spatial.value[1], spatial.value[0]] : isArray(spatial.value) && xReverseFun(spatial.value);
          }
          // 根据类型设置空间属性
          let points = null;
          let polygon = null;
          switch (logical) {
            case 'BBOX':
              spatial.type = GeoGlobe.Filter.Spatial.BBOX;
              spatial.value = new GeoGlobe.LngLatBounds(spatial.value[0], spatial.value[1]);
              break;
            case 'POINT':
              spatial.type = isBooleanTrue(options.contain) ? GeoGlobe.Filter.Spatial.DWITHIN : GeoGlobe.Filter.Spatial.INTERSECTS;
              spatial.distance = options.distance || defaultQueryOptions.distance;
              spatial.distanceUnits = options.units && ['degree', 'm'].indexOf(options.units) !== -1 ? options.units : defaultQueryOptions.units;
              spatial.value = new GeoGlobe.Geometry.Point(spatial.value[0], spatial.value[1]);
              break;
            case 'LINE':
            case 'PATH':
              spatial.type = isBooleanTrue(options.contain) ? GeoGlobe.Filter.Spatial.DWITHIN : GeoGlobe.Filter.Spatial.INTERSECTS;
              spatial.distance = options.distance || defaultQueryOptions.distance;
              spatial.distanceUnits = options.units && ['degree', 'm'].indexOf(options.units) !== -1 ? options.units : defaultQueryOptions.units;
              points = [];
              spatial.value.map(coord => {
                points.push(new GeoGlobe.Geometry.Point(coord[0], coord[1]));
              });
              spatial.value = new GeoGlobe.Geometry.LineString(points);
              break;
            case 'POLYGON':
              spatial.type = isBooleanTrue(options.contain) ? GeoGlobe.Filter.Spatial.CONTAINS : GeoGlobe.Filter.Spatial.INTERSECTS;
              polygon = [];
              spatial.value.map(coords => {
                points = [];
                coords.map(coord => {
                  points.push(new GeoGlobe.Geometry.Point(coord[0], coord[1]));
                });
                polygon.push(new GeoGlobe.Geometry.LinearRing(points));
              });
              spatial.value = new GeoGlobe.Geometry.Polygon(polygon);
              break;
          }
          return new GeoGlobe.Filter.Spatial(spatial);
        }
      }
      return null;
    };
    return toQueryFilters(options.filters);
  }
  return null;
};

/**
 * 指定图层名查询要素的统计总数
 */
const fetchTotalTask = (GeoGlobe, wfsQuery) => {
  return new Promise((resolve, reject) => {
    GeoGlobe.Request.GET({
      url: `${wfsQuery.url}?VERSION=${wfsQuery.version}&REQUEST=GetFeature&SERVICE=WFS&TYPENAME=${wfsQuery.featureType}&RESULTTYPE=hits`,
      success: data => {
        data = !data.responseXML || !data.responseXML.documentElement ? data.responseText : data.responseXML;
        if (data && data.querySelector('FeatureCollection')) {
          const total = parseInt(data.querySelector('FeatureCollection').getAttribute('numberOfFeatures'), 10);
          resolve(total || 0);
        } else {
          reject();
        }
      },
      failure: () => {
        reject();
      },
    });
  });
};

class WFS {
  constructor(GeoGlobe) {
    this.GeoGlobe = GeoGlobe;
  }

  /**
   * 获取解析WMS服务的图层对象
   * @param {String} id 图层Id名称
   * @param {String} name 图层Name名
   * @param {String} url 服务地址
   * @param {Object} options 解析服务的参数选项
   */
  async queryTask(url, typeName = '', options = {}) {
    const opts = assign({}, defaultQueryOptions, options);
    return new Promise((resolve, reject) => {
      // 获取查询服务实例
      const wfsQuery = getWFSQuery(this.GeoGlobe, url, typeName, opts);
      // 获取查询过滤条件
      const filters = getQueryFilters(this.GeoGlobe, opts, wfsQuery);
      // 发送查询请求任务
      const errorMsg = `WFS查询服务[ ${url} ]要素数据解析失败，请检查[filters]过滤条件或属性信息等是否有误.`;
      const failFun = () => {
        console.error(errorMsg);
        reject();
      };
      const successFun = data => {
        if (opts.mode !== 'count') {
          const geojson = data && data.features && data.features.length > 0 ? data.geojson : { type: 'FeatureCollection', features: [] };
          geojson.features.map((f, idx) => {
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
          case 'pagination': {
            wfsQuery.queryPage(filters, successFun, failFun, {
              pageNumber: parseInt(opts.curpage, 10),
              perPageNumber: parseInt(opts.pagesize, 10),
            });
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

export default WFS;
