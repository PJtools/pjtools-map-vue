/**
 * @文件说明: 构建PJtools.Map地图对象
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-14 17:45:33
 */

import merge from 'deepmerge';
import hat from 'hat';
import { isFunction } from '../_util/methods-util';

// 默认Mapbox地图的Style对象
const defaultMapStyle = {
  version: 8,
  sources: {},
  layers: [],
};

// 默认地图配置
const defaultMapOptions = {
  // Mapbox 是否添加属性控件
  attributionControl: false,
  // Mapbox 是否启用Shift范围缩放交互
  boxZoom: false,
  // Mapbox 是否启用双击放大交互
  doubleClickZoom: true,
  // Mapbox 是否启用拖拽漫游平移交互
  dragPan: true,
  // Mapbox 是否启用Ctrl拖拽旋转交互
  dragRotate: true,
  // Mapbox 是否开启键盘
  keyboard: true,
  // Mapbox 是否允许滚动缩放
  scrollZoom: true,
  // Mapbox 是否允许触摸旋转缩放
  touchZoomRotate: true,
  // Mapbox 是否地图尺寸改变时自动响应Resize变化
  trackResize: true,
  // Mapbox 字体FontFamily CSS属性
  localIdeographFontFamily: null,
  // Mapbox 是否启用地图拖拽旋转倾斜交互
  pitchWithRotate: true,
  // Mapbox 地图是否可导出为PNG
  preserveDrawingBuffer: false,
  // Mapbox 地图瓦片资源请求失败时，是否会尝试重新请求瓦片
  refreshExpiredTiles: true,
  // Mapbox 绘制地图副本
  renderWorldCopies: false,
  // Mapbox 是否将不断重绘地图，对分析性能收集信息有用
  repaint: false,
  // Mapbox 是否渲染数据周围的边框；揭示哪些符号被呈现或由于碰撞算法隐藏，对调试有用
  showCollisionBoxes: false,
  // Mapbox 是否在每一个瓦片周围绘制一个轮廓；对调试有用
  showTileBoundaries: false,
  // Mapbox 对外部URL请求之前处理转换回调函数
  transformRequest: null,
  // 是否到指定层级时开启自动3D倾斜，与[pitch3Dzoom]属性一起使用
  is3Dpitching: false,
  // 3D倾斜层级
  pitch3Dzoom: 16,
  // 缩放级别是否为整数处理模式
  isIntScrollZoom: true,
  // 最大缓存瓦片大小
  maxTileCacheSize: null,
  // 内置默认坐标系（既：默认Web墨卡托）
  epsg: 'EPSG:3857',
  // 地图单位，可选项值：[ degrees | m ]
  units: 'degrees',
  // 地图倾斜程度
  pitch: 0,
  // 地图旋转度
  bearing: 0,
  // 地图的Mapbox样式，必须是符合Mapbox样式规范中描述的模式的JSON对象，或者是此类JSON的URL
  style: defaultMapStyle,
  // 地图自定义坐标系投影规则（{ topTileExtent: [], coordtransform: { toViewCoord: function (x, y), fromViewCoord: function (lng, lat) }, resolutions: [], tileSize: 256 }）
  mapCRS: null,
  // 地图的最大地理范围
  maxBounds: null,
  // 地图的最小级别
  minZoom: 0,
  // 地图的最大级别
  maxZoom: 22,
  // 初始化时地图的中心点坐标
  center: [0, 0],
  // 初始化时地图的当前级别
  zoom: 0,
};

// 默认地图初始化过程中的回调事件
const defaultMapCallback = {
  // 地图渲染前触发回调，返回[false]可阻止地图的继续渲染；
  onBeforeRender: null,
  // 地图容器结构及样式数据的渲染时触发，未进行源数据加载；
  onRender: null,
  // 地图的源数据加载完成时触发
  onLoad: null,
};

class PJtoolsMap {
  /**
   * 初始化地图对象
   * @param {String|Element} id 地图容器Id或地图容器的Element对象
   * @param {Object} exports 地图前置依赖项，如：{ GeoGlobe, mapboxgl, ... }
   * @param {Object} options 地图参数选项
   * @param {Object} callback 地图的回调事件
   */
  constructor(id, exports = {}, options = {}, callback = {}) {
    // 缓存预加载导出的Map前置对象（GeoGlobe、mapboxgl等）
    if (!exports || !exports.mapboxgl || !exports.GeoGlobe) {
      console.error('前置必需依赖库[mapboxgl]或[GeoGlobe]缺失，无法有效实例化地图.');
      return;
    }
    const { GeoGlobe } = exports;
    this.exports = exports;

    // 处理地图的配置项
    const opts = merge(defaultMapOptions, options);
    const cb = merge(defaultMapCallback, callback);
    // 覆盖地图容器Id值
    opts.container = id;

    this.options = opts;
    // 实例化GeoGlobe地图
    const map = new GeoGlobe.Map(opts);
    map.id = typeof id === 'string' ? id : hat();
    map.options = opts;
    this.map = map;

    // 移除MapboxGL内部的原生Logo
    const mapboxLogo = map.getContainer().querySelector('.mapboxgl-ctrl-logo');
    if (mapboxLogo) {
      const logoParentNode = mapboxLogo.parentNode;
      if (logoParentNode && logoParentNode.parentNode) {
        logoParentNode.parentNode.removeChild(logoParentNode);
      } else {
        logoParentNode.removeChild(mapboxLogo);
      }
    }

    // 触发回调事件
    map.once('styledata', () => {
      isFunction(cb.onRender) && cb.onRender.call(this, map);
    });
    map.once('load', () => {
      isFunction(cb.onLoad) && cb.onLoad.call(this, map);
    });

    return this;
  }
}

export default PJtoolsMap;
