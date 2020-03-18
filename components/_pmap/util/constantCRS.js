/**
 * @文件说明: 定义常见的地图投影 - MapCRS
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-17 23:48:36
 */

const constantMapCRS = {
  // WGS84经纬度
  wgs84: {
    key: 'wgs84',
    // EPSG坐标号
    epsg: 'EPSG:4326',
    // 地图单位
    units: 'degrees',
    // 是否需转换经纬度
    transform: false,
    // Proj4定义参数
    proj4: null,
    // 顶级金字塔坐标范围
    topTileExtent: [-180, -270, 180, 90],
    // 坐标转换函数
    coordtransform: 'none',
  },
  // Web Mercator墨卡托投影
  mercator: {
    key: 'mercator',
    epsg: 'EPSG:3857',
    units: 'm',
    transform: true,
    proj4: null,
    topTileExtent: [-20037508.35, -20037508.35, 20037508.35, 20037508.35],
    coordtransform: 'none',
  },
  // 百度墨卡托投影
  baidu: {
    key: 'baidu',
    epsg: 'bd09',
    units: 'm',
    transform: true,
    proj4: '+proj=merc +lon_0=0 +units=m +ellps=clrk66 +no_defs',
    topTileExtent: [-33554432, -33554432, 33554432, 33554432],
    coordtransform: 'none',
  },
};

constantMapCRS.bd = constantMapCRS.baidu;

export default constantMapCRS;
