/**
 * @文件说明: 效验地图Map核心属性的有效性
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-17 22:34:39
 */

import omit from 'omit.js';
import constantMapCRS from './constantCRS';
import { isHttpUrl, isArray, isEmpty, isCoordinate, isNumeric, isBooleanFlase, isFunction, isInteger, has } from '../../_util/methods-util';
import isPlainObject from 'lodash/isPlainObject';

/**
 * 验证地图的proxyURL代理服务地址属性
 */
const validateProxyURL = proxyURL => {
  if (!proxyURL) {
    console.error('地图Map的代理服务地址[proxyURL]属性未设定，可能导致请求服务时出现跨域等问题.');
    return '';
  }
  if (typeof proxyURL !== 'string' || !isHttpUrl(proxyURL)) {
    console.error('地图Map的代理服务地址[proxyURL]属性不是一个有效的HTTP服务链接地址.');
    return '';
  }

  return proxyURL;
};

/**
 * 验证地图的units地图单位属性
 */
const validateMapUnits = units => {
  if (units) {
    if (typeof units === 'string' && ['degrees', 'm'].indexOf(units) !== -1) {
      return units;
    }
    console.error('地图Map的单位[units]属性不是有效的值.');
  }
  return 'degrees';
};

/**
 * 验证地图的层级属性
 */
const validateMapZoom = (key, zoom, defaultValue) => {
  if (!isEmpty(zoom)) {
    if (typeof zoom !== 'number' || zoom < 0 || zoom > 22) {
      console.error(`地图Map的[${key}]层级属性不是0-22之间的有效数值.`);
      return defaultValue !== null && defaultValue !== undefined ? defaultValue : null;
    }
  }
  return zoom !== null && zoom !== undefined ? zoom : defaultValue;
};

/**
 * 验证地图的Bounds坐标范围属性
 */
const validateMapBounds = (key, bounds) => {
  if (!isEmpty(bounds)) {
    if (!(isArray(bounds) && bounds.length === 2 && isCoordinate(bounds[0]) && isCoordinate(bounds[1]))) {
      console.error(`地图Map的[${key}]地理范围属性不是有效[[minx,miny],[maxx,maxy]]格式坐标.`);
      return null;
    }
  }
  return bounds;
};

/**
 * 验证地图的倾斜属性
 */
const validateMapPitch = (key, pitch, defaultValue) => {
  if (!isEmpty(pitch)) {
    if (typeof pitch !== 'number' || pitch < 0 || pitch > 60) {
      console.error(`地图Map的[${key}]倾斜属性不是0-60之间的有效数值.`);
      return defaultValue !== null && defaultValue !== undefined ? defaultValue : null;
    }
  }
  return pitch !== null && pitch !== undefined ? pitch : defaultValue;
};

/**
 * 验证地图的基础视图相关属性
 */
const validateBasicParams = options => {
  // 验证地图的中心点
  if (options.center) {
    if (!isCoordinate(options.center)) {
      if (!(isArray(options.center) && options.center.join(',') === '0,0')) {
        console.error('地图Map的中心点坐标[center]属性不是有效的值.');
      }
      options = omit(options, ['center']);
    }
  } else {
    options = omit(options, ['center']);
  }
  // 验证地图的层级
  options.zoom = validateMapZoom('zoom', options.zoom, 0);
  options.minZoom = validateMapZoom('minZoom', options.minZoom, 0);
  options.maxZoom = validateMapZoom('maxZoom', options.maxZoom, 22);
  if (options.minZoom > options.maxZoom) {
    console.error('地图Map的[minZoom]属性数值不能大于[maxZoom]属性数值.');
    options.minZoom = 0;
  }
  // 验证地图的BBOX范围坐标
  options.bounds = validateMapBounds('bounds', options.bounds);
  options.maxBounds = validateMapBounds('maxBounds', options.maxBounds);
  // 验证地图旋转度
  if (!isEmpty(options.bearing)) {
    if (typeof options.bearing !== 'number') {
      console.error('地图Map的旋转度[bearing]属性不是有效的数值.');
      options.bearing = 0;
    }
  } else {
    options.bearing = 0;
  }
  // 验证地图的倾斜度
  options.pitch = validateMapPitch('pitch', options.pitch, 0);
  options.minPitch = validateMapPitch('minPitch', options.minPitch, 0);
  options.maxPitch = validateMapPitch('maxPitch', options.maxPitch, 60);
  if (options.minPitch > options.maxPitch) {
    console.error('地图Map的[minPitch]属性数值不能大于[minPitch]属性数值.');
    options.minPitch = 0;
  }
  options.pitchWithRotate = isBooleanFlase(options.pitchWithRotate) ? false : true;
  // 验证地图单位
  options.units = validateMapUnits(options.units);

  return options;
};

/**
 * 验证地图的mapCRS地图投影属性
 */
const validateMapCRS = mapCRS => {
  if (mapCRS) {
    if (typeof mapCRS === 'string') {
      // 判断是否为内置MapCRS投影名称
      if (constantMapCRS[mapCRS]) {
        return constantMapCRS[mapCRS];
      }
    } else if (isPlainObject(mapCRS)) {
      let CRS = {};
      // 判断顶级金字塔是否为坐标数组
      if (
        mapCRS.topTileExtent &&
        isArray(mapCRS.topTileExtent) &&
        mapCRS.topTileExtent.length === 4 &&
        isNumeric(mapCRS.topTileExtent[0]) &&
        isNumeric(mapCRS.topTileExtent[1]) &&
        isNumeric(mapCRS.topTileExtent[2]) &&
        isNumeric(mapCRS.topTileExtent[3])
      ) {
        CRS.topTileExtent = mapCRS.topTileExtent;
      }
      // 判断坐标转换系统
      if (!isEmpty(mapCRS.coordtransform)) {
        if (
          mapCRS.coordtransform !== 'none' &&
          isPlainObject(mapCRS.coordtransform) &&
          has(mapCRS.coordtransform, 'toViewCoord') &&
          has(mapCRS.coordtransform, 'fromViewCoord') &&
          isFunction(mapCRS.coordtransform.toViewCoord) &&
          isFunction(mapCRS.coordtransform.fromViewCoord)
        ) {
          CRS.coordtransform = mapCRS.coordtransform;
        } else {
          CRS.coordtransform = 'none';
        }
      } else {
        CRS.coordtransform = 'none';
      }
      // 判断分辨率
      if (!isEmpty(mapCRS.resolutions) && isArray(mapCRS.resolutions)) {
        CRS.resolutions = mapCRS.resolutions;
      }
      // 判断瓦片尺寸
      if (!isEmpty(mapCRS.tileSize) && isInteger(mapCRS.tileSize)) {
        CRS.tileSize = mapCRS.tileSize;
      }
      // 判断是否有必须属性
      if (has(CRS, 'topTileExtent') && has(CRS, 'coordtransform')) {
        CRS = Object.assign({}, CRS, omit(mapCRS, ['topTileExtent', 'coordtransform', 'resolutions', 'tileSize']));
        return CRS;
      }
    }
    console.error('地图Map的投影[mapCRS]属性无法正确解析格式.');
  }
  return null;
};

/**
 * 验证地图的mapBaseType和mapBasicLayers地图基础底图属性
 */
const validateMapBasicLayers = options => {
  return options;
};

/**
 * 验证地图的mapControls地图控件属性
 */
const validateMapControls = options => {
  return options;
};

/**
 * 对地图Map的核心参数选项属性进行效验
 * @param {Object} options 待验证的地图Map参数选项
 */
const validate = (options = {}) => {
  // 验证地图的代理服务
  options.proxyURL = validateProxyURL(options.proxyURL);
  // 验证地图的基础视图属性
  options = validateBasicParams(options);
  // 验证地图的投影
  options.mapCRS = validateMapCRS(options.mapCRS);
  if (options.mapCRS && options.mapCRS.units) {
    options.units = options.mapCRS.units;
  }
  // 验证地图的基础底图属性结构
  options = validateMapBasicLayers(options);
  // 验证地图的控件的属性结构
  options = validateMapControls(options);

  return options;
};

export default validate;
