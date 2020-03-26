/**
 * @文件说明: 定义计算金字塔顶级范围的几种方式
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-26 10:53:44
 */

/**
 * 根据瓦片原点、最小比例尺等计算“高斯投影”的顶级金字塔瓦片范围
 * @param {GeoGlobe} GeoGlobe GeoGlobe对象
 * @param {Array} origin 瓦片切片原点（注意：负坐标为X，正坐标为Y）
 * @param {Number} minScale 最小比例尺
 * @param {Number} zoomOffset 层级偏移量
 * @param {String} units 地图单位，默认：m；可选值：[ degrees | m ]
 */
export const topTileExtentToGauss = function(GeoGlobe, origin, minScale, zoomOffset, units = 'm') {
  // 判断是否有瓦片切片的原点数据
  (!origin || !Array.isArray(origin) || origin.length !== 2) && (origin = [0, 0]);
  (minScale === void 0 || minScale === null || typeof minScale !== 'number') && (minScale = 73957190.948944002);
  (zoomOffset === void 0 || zoomOffset === null || typeof zoomOffset !== 'number') && (zoomOffset = 3);
  // 根据图层的最小比例尺获取分辨率
  const resolution = GeoGlobe.Util.getResolutionFromScale(minScale, units);
  // 计算最大分辨率
  const maxResolution = resolution * Math.pow(2, zoomOffset);
  // 金字塔顶层左上角第一个瓦片的左上角X轴
  const topTileFromX = Number(origin[0]);
  // 金字塔顶层左上角第一个瓦片的左上角Y轴
  const topTileFromY = Number(origin[1]);
  // 金字塔顶层左上角第一个瓦片的右下角X轴
  const topTileToX = topTileFromX + maxResolution * 256;
  // 金字塔顶层左上角第一个瓦片的右下角Y轴
  const topTileToY = topTileFromY - maxResolution * 256;

  return [topTileFromX, topTileToY, topTileToX, topTileFromY];
};

/**
 * 根据WMTS服务的最小层级的矩阵等计算顶级金字塔瓦片范围
 * @param {GeoGlobe} GeoGlobe GeoGlobe对象
 * @param {Object} options WMTS服务参数
 */
export const topTileExtentToWMTS = function(GeoGlobe, options = {}) {
  const defaultOptions = {
    // 图层标识名
    identifier: '',
    // 最小比例尺
    scaleDenominator: 0,
    // 切片原点
    topLeftCorner: [0, 0],
    // 切片尺寸
    tileSize: 256,
    // 矩阵宽度
    matrixWidth: 0,
    // 矩阵高度
    matrixHeight: 0,
    // 地图单位
    units: 'm',
  };
  const opts = Object.assign({}, defaultOptions, options);
  const wmtsUtil = new GeoGlobe.Format.WMTSUtil();
  return wmtsUtil.calculationTopTileExtentAndZoomOffset(opts);
};

/**
 * 根据原点和最小分辨率计算顶级金字塔瓦片范围
 * @param {Array} origin 瓦片切片原点（注意：负坐标为X，正坐标为Y）
 * @param {Number} resolution 层级分辨率
 */
export const topTileExtentToResolution = function(origin, resolution) {
  (!origin || !Array.isArray(origin) || origin.length !== 2) && (origin = [0, 0]);
  let maxResolution = resolution;
  while (maxResolution < Math.abs(origin[0])) {
    maxResolution = maxResolution * 2;
  }
  maxResolution = maxResolution - Math.abs(origin[0]);
  return [origin[0], 0 - maxResolution, maxResolution, origin[1]];
};
