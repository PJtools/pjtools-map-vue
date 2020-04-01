/**
 * @文件说明: 构建Map地图的“Proj4”管理函数方法
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-04-01 18:13:20
 */

import { isBooleanTrue, isCoordinate, isArray, isNotEmptyArray } from '../../_util/methods-util';
import transform from '../util/transform';

const proj4 = {
  /**
   * 获取Proj4投影坐标转换对象（如无设定名称则直接获取当前实例地图的投影坐标对象）
   * @param {String} name 转换投影名
   * @param {String} second 互转的投影名，当无设定时，默认为WGS84经纬度坐标
   */
  getProjection(name, second = null) {
    // 判断是否未指定投影坐标系，则获取当前地图的Proj4对象
    if (!name) {
      const mapCRS = this.options.mapCRS;
      let epsg = 'EPSG:4326';
      if (mapCRS && mapCRS.epsg) {
        if (['EPSG:4326', 'EPSG:3857'].indexOf(mapCRS.epsg) !== -1) {
          if (mapCRS.epsg === 'EPSG:3857' && isBooleanTrue(mapCRS.transform)) {
            epsg = 'EPSG:3857';
          }
        } else if (mapCRS.proj4) {
          epsg = mapCRS.epsg;
        }
      }
      return epsg === 'bd09' ? 'bd09' : this.proj4(epsg);
    } else {
      try {
        if (name === 'bd09') {
          return 'bd09';
        } else {
          if (!second) {
            return this.proj4(name);
          } else {
            return this.proj4(name, second);
          }
        }
      } catch (e) {
        return null;
      }
    }
  },

  /**
   * 将非标准投影的坐标数据转化成WGS84坐标数据
   * @param {Array} coordinate 待转换的坐标
   */
  toWGS84(coordinate) {
    if (!isArray(coordinate)) {
      return null;
    }
    const projection = this.getProjection();
    if (projection) {
      // 递归批量转换坐标
      const recursion = coord => {
        if (isCoordinate(coord)) {
          return projection === 'bd09' ? transform.bdmerc2ll(coord) : projection.inverse(coord);
        } else if (isNotEmptyArray(coord)) {
          return coord.map(item => recursion(item));
        }
        return data;
      };
      return recursion(coordinate);
    }
    return coordinate;
  },

  /**
   * 将标准WGS84坐标数据反转化成当前地图投影的坐标数据
   * @param {Array} coordinate 待转换的坐标
   */
  fromWGS84(coordinate) {
    if (!isArray(coordinate)) {
      return null;
    }
    const projection = this.getProjection();
    if (projection) {
      // 递归批量转换坐标
      const recursion = coord => {
        if (isCoordinate(coord)) {
          return projection === 'bd09' ? transform.ll2bdmerc(coord) : projection.forward(coord);
        } else if (isNotEmptyArray(coord)) {
          return coord.map(item => recursion(item));
        }
        return data;
      };
      return recursion(coordinate);
    }
    return coordinate;
  },
};

export default proj4;
