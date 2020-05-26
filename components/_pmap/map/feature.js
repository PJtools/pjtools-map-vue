/**
 * @文件说明: 构建Map地图的“要素”管理函数方法
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-26 11:06:52
 */

import assign from 'lodash/assign';
import { isNotEmptyArray } from '../../_util/methods-util';

const feature = {
  /**
   * 获取FeatureCollection要素集合GeoJSON对象
   * @param {FeatureCollection} features 要素集合对象
   */
  getFeatureCollection(features) {
    const { turf } = this.exports;
    if (turf) {
      if (isNotEmptyArray(features)) {
        return turf.featureCollection(features);
      } else if (features && features.type) {
        switch (features.type) {
          case 'FeatureCollection':
            return features;
          case 'Feature':
            return turf.featureCollection([features]);
        }
      }
    }
    return null;
  },

  /**
   * 获取Feature要素的几何矩形范围
   * @param {FeatureCollection} features 要素集合对象
   */
  getFeaturesToBounds(features) {
    const { turf } = this.exports;
    // 计算集合的BBOX范围
    const featuresCollection = this.getFeatureCollection(features);
    const bounds = featuresCollection && turf.bbox(featuresCollection);
    return bounds
      ? [
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]],
        ]
      : null;
  },

  /**
   * 根据Feature要素集合缩放到合适层级
   * @param {FeatureCollection} features 要素集合对象
   */
  boundsToFeatures(features, options = {}) {
    // 合并缩放参数
    const defaultPadding = {
      top: 100,
      bottom: 100,
      left: 50,
      right: 50,
    };
    options.padding = assign({}, defaultPadding, options.padding || {});
    // 获取范围
    const bounds = this.getFeaturesToBounds(features);
    return new Promise((resolve, reject) => {
      if (bounds) {
        this.boundsTo(bounds, 500, options)
          .then(() => {
            resolve();
          })
          .catch(() => {
            reject();
          });
      } else {
        resolve();
      }
    });
  },

  /**
   * 获取Feature要素的绝对中心点
   * @param {FeatureCollection} features 要素集合对象
   */
  getFeaturesToCenter(features) {
    const { turf } = this.exports;
    const featureCollection = this.getFeatureCollection(features);
    return featureCollection && featureCollection.features.length ? turf.center(featureCollection) : null;
  },

  /**
   * 获取Feature要素的质心点
   * @param {FeatureCollection} features 要素集合对象
   */
  getFeaturesToCentroid(features) {
    const { turf } = this.exports;
    const featureCollection = this.getFeatureCollection(features);
    return featureCollection && featureCollection.features.length ? turf.centroid(featureCollection) : null;
  },

  /**
   * 生成Point Feature要素对象
   * @param {String} id Feature要素的唯一Id
   * @param {Coordinates} coordinates Feature要素的坐标点
   * @param {Object} properties Feature要素的属性对象
   */
  createPointFeature(id, coordinates, properties = {}) {
    const { turf } = this.exports;
    if (turf && id) {
      return turf.point(coordinates, properties, { id });
    }
    return null;
  },

  /**
   * 生成MultiPoint Feature要素对象
   * @param {String} id Feature要素的唯一Id
   * @param {Coordinates} coordinates Feature要素的坐标点
   * @param {Object} properties Feature要素的属性对象
   */
  createMultiPointFeature(id, coordinates, properties = {}) {
    const { turf } = this.exports;
    if (turf && id) {
      return turf.multiPoint(coordinates, properties, { id });
    }
    return null;
  },

  /**
   * 生成Line Feature要素对象
   * @param {String} id Feature要素的唯一Id
   * @param {Coordinates} coordinates Feature要素的坐标点
   * @param {Object} properties Feature要素的属性对象
   */
  createLineFeature(id, coordinates, properties = {}) {
    const { turf } = this.exports;
    if (turf && id) {
      return turf.lineString(coordinates, properties, { id });
    }
    return null;
  },

  /**
   * 生成MultiLineString Feature要素对象
   * @param {String} id Feature要素的唯一Id
   * @param {Coordinates} coordinates Feature要素的坐标点
   * @param {Object} properties Feature要素的属性对象
   */
  createMultiLineFeature(id, coordinates, properties = {}) {
    const { turf } = this.exports;
    if (turf && id) {
      return turf.multiLineString(coordinates, properties, { id });
    }
    return null;
  },

  /**
   * 生成Polygon Feature要素对象
   * @param {String} id Feature要素的唯一Id
   * @param {Coordinates} coordinates Feature要素的坐标点
   * @param {Object} properties Feature要素的属性对象
   */
  createPolygonFeature(id, coordinates, properties = {}) {
    const { turf } = this.exports;
    if (turf && id) {
      return turf.polygon(coordinates, properties, { id });
    }
    return null;
  },

  /**
   * 生成MultiPolygon Feature要素对象
   * @param {String} id Feature要素的唯一Id
   * @param {Coordinates} coordinates Feature要素的坐标点
   * @param {Object} properties Feature要素的属性对象
   */
  createMultiPolygonFeature(id, coordinates, properties = {}) {
    const { turf } = this.exports;
    if (turf && id) {
      return turf.multiPolygon(coordinates, properties, { id });
    }
    return null;
  },

  /**
   * 生成圆形Circle Feature要素对象
   * @param {String} id Feature要素的唯一Id
   * @param {Coordinates} center 圆形的中心点
   * @param {Number} radius 圆形的半径，单位：KM(千米)
   * @param {Object} properties Feature要素的属性对象
   * @param {Object} options 圆形参数选项；<steps>形成圆形坐标的个数，默认99，既闭合为100个点
   */
  createCircleFeature(id, center, radius = 0.5, properties = {}, options = {}) {
    const { turf } = this.exports;
    const opts = assign({}, { steps: 99 }, options);
    // 转换中心点位为WGS84
    const wgs84Center = this.toWGS84(center);
    // 获取半径对应的圆形
    const circleFeature = turf.circle(wgs84Center, radius, {
      units: 'kilometers',
      steps: opts.steps,
    });
    let coordinates = turf.getCoords(circleFeature);
    // 反转回对应的投影坐标
    coordinates = this.fromWGS84(coordinates);
    // 生成Feature对象
    return coordinates ? this.createPolygonFeature(id, coordinates, properties) : null;
  },

  /**
   * 生成矩形Rectangle Feature要素对象
   * @param {String} id Feature要素的唯一Id
   * @param {Coordinates} point 矩形的起始点
   * @param {Number} width 矩形的宽度，单位：KM(千米)
   * @param {Number} height 矩形的高度，单位：KM(千米)
   * @param {Object} properties Feature要素的属性对象
   */
  createRectangleFeature(id, point, width, height, properties = {}) {
    const { turf } = this.exports;
    // 转换中心点位为WGS84
    const wgs84Point = this.toWGS84(point);
    // 计算对角线距离的点位
    const widthFeature = turf.destination(wgs84Point, Math.abs(width), 90, { units: 'kilometers' });
    const widthPoint = turf.getCoord(widthFeature);
    const heightFeature = turf.destination(widthPoint, Math.abs(height), 180, { units: 'kilometers' });
    const heightPoint = turf.getCoord(heightFeature);
    // 生成矩形的坐标点
    let coordinates = [
      [
        [point[0], point[1]],
        [widthPoint[0], widthPoint[1]],
        [heightPoint[0], heightPoint[1]],
        [point[0], heightPoint[1]],
        [point[0], point[1]],
      ],
    ];
    // 反转回对应的投影坐标
    coordinates = this.fromWGS84(coordinates);
    // 生成Feature对象
    return coordinates ? this.createPolygonFeature(id, coordinates, properties) : null;
  },
};

export default feature;
