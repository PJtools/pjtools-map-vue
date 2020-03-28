/**
 * @文件说明: 构建PJtools.Map地图对象
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-14 17:45:33
 */

import assign from 'lodash/assign';
import hat from 'hat';
import proj4 from 'proj4';
import validateConfig from './util/validateMapConfig';
import { isFunction, isBooleanFlase, isNotEmptyArray } from '../_util/methods-util';
import isPlainObject from 'lodash/isPlainObject';
import { bindPrototypeMethods } from './util/basicMapApiClass';
import transform from './util/transform';
import { providersMapOptions } from './providers';
import constantMapCRS from './util/constantCRS';
import { default as mapPrototypes } from './map';
import Providers from './providers';
import Services from './layers/services';
import Query from './query';

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
  preserveDrawingBuffer: true,
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
  // 地图倾斜角度
  pitch: 0,
  // 地图的最小倾斜角度
  minPitch: 0,
  // 地图的最大倾斜角度
  maxPitch: 60,
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
  center: null,
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

/**
 * 验证基础底图服务源是否为内置在线服务源
 * @param {String|Object} mapBasicLayers 地图服务源对象
 */
const isMapProviders = function(mapBasicLayers) {
  return !!(typeof mapBasicLayers === 'string' || (mapBasicLayers && mapBasicLayers.key && typeof mapBasicLayers.key === 'string'));
};

/**
 * 验证基础底图服务源是否为Mapbox服务源
 * @param {Object} mapBasicLayers 地图服务源对象
 */
const isMapboxProviders = function(mapBasicLayers) {
  if (isMapProviders(mapBasicLayers)) {
    const providerKey = mapBasicLayers.key || mapBasicLayers;
    if (providerKey === 'mapbox') {
      return true;
    }
  }
  return false;
};

/**
 * 设置初始当前Mapbox服务源的缓存信息
 */
const setMapboxProvidersLayersGroup = function() {
  const map = this.map;
  const mapMapboxLayers = map.getStyle().layers || [];
  const basicGroupId = 'pjtoolsmap_basic_layers_group';

  const layersGroup = {
    id: basicGroupId,
    isLayerGroup: true,
    layers: [],
  };
  const layersGroupIds = {
    layerGroupId: basicGroupId,
    layersIds: [],
  };
  mapMapboxLayers &&
    mapMapboxLayers.map(item => {
      let layer = map.getLayer(item.id);
      layer = assign({}, layer, {
        metadata: assign({}, layer.metadata || {}, { group: basicGroupId }),
      });
      layersGroup.layers.push(layer);
      layersGroupIds.layersIds.push(layer.id);
      // 记录数据源的图层
      if (layer.source) {
        const currentSource = map.getSource(layer.source);
        !currentSource._layersIds && (currentSource._layersIds = []);
        currentSource._layersIds.indexOf(layer.id) === -1 && currentSource._layersIds.push(layer.id);
      }
    });

  this._mapLayers[basicGroupId] = layersGroup;
  this._mapLayersIds.push(layersGroupIds);
};

// 地图Load事件的判断心跳间隔（单位：秒数）
const MAP_TIMESTAMP_SECOND = 2;

const PJtoolsMap = (function() {
  const _exports = Symbol('exports');
  const _options = Symbol('options');
  const _proxyURL = Symbol('proxyURL');
  const _map = Symbol('map');
  const _currentMapBaseType = Symbol('currentMapBaseType');
  const _providersBasicLayers = Symbol('providersBasicLayers');
  const _customBasicLayers = Symbol('customBasicLayers');
  const _proj4 = Symbol('proj4');
  const _transform = Symbol('transform');
  const _Providers = Symbol('Providers');
  const _Services = Symbol('Services');
  const _Query = Symbol('Query');

  class PJtoolsMap {
    /**
     * 地图前置依赖项对象，如：{ GeoGlobe, mapboxgl, ... }
     * @readonly
     */
    get exports() {
      return this[_exports];
    }

    /**
     * 地图实例化的参数选项
     * @readonly
     */
    get options() {
      return this[_options];
    }

    /**
     * 原生地图Map的实例化对象
     * @readonly
     */
    get map() {
      return this[_map];
    }

    /**
     * 当前地图的的Proj4对象
     * @readonly
     */
    get proj4() {
      return this[_proj4];
    }

    /**
     * 当前地图的的transform对象
     * @readonly
     */
    get transform() {
      return this[_transform];
    }

    /**
     * 当前地图底图的类型
     * @readonly
     */
    get currentMapBaseType() {
      return this[_currentMapBaseType];
    }

    /**
     * 当前地图的代理服务地址
     * @readonly
     */
    get proxyURL() {
      return this[_proxyURL];
    }

    /**
     * 当前地图的图层集合
     * @readonly
     */
    get mapLayers() {
      return this._mapLayersIds.map(layerId => {
        // 获取图层或图层组的名称
        const id = isPlainObject(layerId) ? layerId.layerGroupId : layerId;
        return this._mapLayers[id];
      });
    }

    /**
     * PJtoolsMap的二级属性 - Provoders地图服务源对象
     * @readonly
     */
    get Providers() {
      return this[_Providers];
    }

    /**
     * PJtoolsMap的二级属性 - Services地图的Web GIS Service服务对象
     * @readonly
     */
    get Services() {
      return this[_Services];
    }

    /**
     * PJtoolsMap的二级属性 - Query地图的Web GIS Service服务查询对象
     * @readonly
     */
    get Query() {
      return this[_Query];
    }

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
      this[_proj4] = proj4;
      this[_transform] = transform;
      this[_proxyURL] = (options && options.proxyURL) || '';
      this[_exports] = exports;
      const { GeoGlobe, mapboxgl } = exports;
      GeoGlobe.Request.setTimeout(2000);

      // 绑定PJtoolsMap.Providers对象
      this[_Providers] = new Providers(this);
      // 绑定PJtoolsMap.Services对象
      this[_Services] = new Services(this);

      // 记录当前Map实例的已添加的地图图层对象
      this._mapLayers = {};
      this._mapLayersIds = [];

      // 处理地图的配置项
      let opts = assign({}, defaultMapOptions, validateConfig(options));
      const cb = assign({}, defaultMapCallback, callback);
      // 覆盖地图容器Id值
      opts.container = id;
      // 设置地图的字体库
      if (opts.glyphs) {
        opts.style.glyphs = opts.glyphs;
        delete opts.glyphs;
      }

      // 添加渲染前的干预回调事件
      if (isFunction(cb.onBeforeRender)) {
        const result = cb.onBeforeRender.call(this, opts);
        if (result !== null && result !== undefined) {
          // 判断是否返回值是布尔类型的False值，则直接阻止后续地图的渲染；
          if (isBooleanFlase(result)) {
            return;
          } else if (isPlainObject(result)) {
            // 如返回值是Object格式类型数据，则直接覆盖默认的地图参数属性
            opts = result;
          }
        }
      }

      // 初始化地图
      let isMapLoaded = false;
      const initPJtoolsMap = () => {
        // 转换内置MapCRS属性
        if (opts.mapCRS && typeof opts.mapCRS === 'string' && constantMapCRS[opts.mapCRS]) {
          opts.mapCRS = constantMapCRS[opts.mapCRS];
        }
        // 转换地图的设定投影坐标的各属性参数
        if (opts.mapCRS && isPlainObject(opts.mapCRS)) {
          opts.mapCRS.epsg && (opts.epsg = opts.mapCRS.epsg);
        }
        // 判断是否设定Proj4的投影转换
        if (opts.mapCRS && opts.mapCRS.proj4 && opts.mapCRS.epsg) {
          this[_proj4].defs(opts.mapCRS.epsg, opts.mapCRS.proj4);
        }
        // 判断是否有transformRequest属性设置，合并内置处理方法
        let transformRequest = null;
        if (isFunction(opts.transformRequest)) {
          transformRequest = opts.transformRequest;
        }
        opts.transformRequest = function(url, resourceType) {
          // 判断是否为WMS服务，且版本为1.3.0，则需要特殊处理坐标范围，进行反转
          if (resourceType === 'Tile' && url.indexOf('SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0') !== -1) {
            const reg = new RegExp('(^|&)BBOX=([^&]*)(&|$)');
            let bbox = url.substr(1).match(reg)[2];
            bbox = bbox.split(',');
            bbox = [bbox[1], bbox[0], bbox[3], bbox[2]];
            return {
              url: url.replace(new RegExp('(BBOX=)([^&]*)', 'gi'), 'BBOX=' + bbox.join(',')),
            };
          } else if (transformRequest) {
            return transformRequest(url, resourceType);
          }
        };
        transformRequest = null;

        // 赋值地图的Options参数属性项
        this[_options] = opts;
        this[_proxyURL] = opts.proxyURL || '';

        // 实例化GeoGlobe地图
        const map = new GeoGlobe.Map(opts);
        map.id = typeof id === 'string' ? id : hat();
        map.options = opts;

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

        // 执行回调地图Style属性数据加载完毕的回调
        map.once('style.load', () => {
          // 判断是否触发回调地图的样式数据渲染的回调事件
          isFunction(cb.onRender) && cb.onRender.call(this, this);
          // 判断是否为内置Mapbox服务源，则初始化时跳过底图服务源
          if (!(isMapProviders(opts.mapBasicLayers) && isMapboxProviders(opts.mapBasicLayers))) {
            // 设置当前地图的基础底图数据
            this.setMapBasicLayers(this.options.mapBaseType);
          }
        });
        // 定义地图Map的初始数据加载完成的心跳监控
        let timer = null;
        let timestamp = null;
        const clearMapTimer = () => {
          if (timer) {
            window.clearTimeout(timer);
            timer = null;
          }
        };
        // 执行地图初始化数据加载完成时的回调事件
        const handleMapLoadCompleted = () => {
          if (!isMapLoaded) {
            isMapLoaded = true;
            // 判断是否为内置Mapbox服务源，则初始化时跳过底图服务源
            if (isMapProviders(opts.mapBasicLayers) && isMapboxProviders(opts.mapBasicLayers)) {
              setMapboxProvidersLayersGroup.call(this);
            }
            // 判断是否触发回调地图的数据加载完成回调事件
            isFunction(cb.onLoad) && cb.onLoad.call(this, this);
          }
        };
        // 判断是否初始化的数据源加载完毕，防止Map的Load事件在瓦片挂起时不触发的可能；
        const handleMapLoadDataEvent = () => {
          const currentTimeStamp = new Date().valueOf();
          !timestamp && (timestamp = currentTimeStamp);
          // 判断当前时间是否小于验证间隔时间，则重新计时
          if (currentTimeStamp - timestamp < MAP_TIMESTAMP_SECOND * 1000) {
            clearMapTimer();
          }
          if (!isMapLoaded) {
            timer = window.setTimeout(() => {
              clearMapTimer();
              map.off('data', handleMapLoadDataEvent);
              // 执行地图的完成回调事件
              handleMapLoadCompleted();
            }, MAP_TIMESTAMP_SECOND * 1000);
          } else {
            clearMapTimer();
            map.off('data', handleMapLoadDataEvent);
          }
        };
        // 判断是否为内置Mapbox服务源，则不执行自定义心跳判断地图Load事件
        if (!(isMapProviders(opts.mapBasicLayers) && isMapboxProviders(opts.mapBasicLayers))) {
          map.on('data', handleMapLoadDataEvent);
        }
        map.once('load', handleMapLoadCompleted);

        // 缓存地图Map实例化对象
        this[_map] = map;
        // 绑定PJtoolsMap.Query对象
        this[_Query] = new Query(this);
      };

      // 判断内置初始底图服务源，则强制覆盖地图的属性
      if (isMapProviders(opts.mapBasicLayers)) {
        const providerKey = opts.mapBasicLayers.key || opts.mapBasicLayers;
        const providerOptions = providersMapOptions[providerKey] || {};
        opts = assign(opts, providerOptions);
        // 获取内置服务源的基础地图底图数据
        this.Providers.getProvidersLayers(providerKey, opts.mapBasicLayers.options || {}).then(data => {
          // 判断内置服务源是否为Mapbox服务
          if (providerKey === 'mapbox') {
            const accessToken = (opts.mapBasicLayers && opts.mapBasicLayers.options && opts.mapBasicLayers.options.accessToken) || null;
            accessToken && (mapboxgl.accessToken = accessToken);
            opts.mapBaseType = 'vec';
            if (data) {
              opts.style = data.style;
              this[_providersBasicLayers] = data.layers;
            } else {
              this[_providersBasicLayers] = null;
            }
          } else {
            // 获取的内置服务源数据图层进行缓存
            this[_providersBasicLayers] = data || null;
          }
          // 实例化地图
          initPJtoolsMap();
        });
      } else {
        // 自定义初始底图数据源，则初始首次提前获取对应异步图层数据
        const basicLayers = opts.mapBasicLayers && opts.mapBasicLayers[opts.mapBaseType];
        if (isNotEmptyArray(basicLayers)) {
          this.Services.getServicesLayers(basicLayers).then(layers => {
            this[_customBasicLayers] = layers || [];
            initPJtoolsMap();
          });
        } else {
          this[_customBasicLayers] = [];
          initPJtoolsMap();
        }
      }

      return this;
    }

    /**
     * 设置更新地图Map的底图服务图层
     * @param {string} type 地图底图类型，具体可选参数根据[mapBasicLayers]设定的服务源的Key名；
     */
    setMapBasicLayers(type) {
      // 判断待更新设置的底图服务类型是否与当前地图类型一致，则直接忽略；
      if (!type || this.currentMapBaseType === type) {
        return;
      }

      // 移除旧地图底图图层
      this.removeMapBasicLayers();
      // 获取待插入的最底部的非底图图层组的前置图层Id，保证更新时底图永远在底部，不被其他图层覆盖.
      let beforeId = null;
      const mapLayers = this.getMapboxLayers();
      if (isNotEmptyArray(mapLayers)) {
        beforeId = mapLayers[0].id;
      }

      // 获取待更新的底图服务源
      const mapBasicLayers = this.options.mapBasicLayers;
      // 判断地图的基础底图服务源是否为内置服务源
      if (isMapProviders(mapBasicLayers)) {
        const providersLayers = this[_providersBasicLayers];
        const layers = providersLayers && providersLayers[type];
        // 判断是否有底图的服务源图层对象，则添加到地图Map中
        if (isNotEmptyArray(layers)) {
          this.addLayersToGroup('pjtoolsmap_basic_layers_group', layers, beforeId);
          this[_currentMapBaseType] = type;
        }
      } else {
        // 判断自定义底图服务源数据集合是否已初始缓存过，则直接使用
        if (this[_customBasicLayers]) {
          const basicLayers = this[_customBasicLayers];
          if (isNotEmptyArray(basicLayers)) {
            this.addLayersToGroup('pjtoolsmap_basic_layers_group', basicLayers, beforeId);
            this[_currentMapBaseType] = type;
          }
          this[_customBasicLayers] = null;
        } else {
          const basicLayers = mapBasicLayers && mapBasicLayers[type];
          if (isNotEmptyArray(basicLayers)) {
            this.Services.getServicesLayers(basicLayers).then(layers => {
              if (isNotEmptyArray(layers)) {
                this.addLayersToGroup('pjtoolsmap_basic_layers_group', layers, beforeId);
                this[_currentMapBaseType] = type;
              }
            });
          }
        }
      }
    }

    /**
     * 删除当前地图Map的底图服务图层
     */
    removeMapBasicLayers() {
      const basicLayerGroupId = 'pjtoolsmap_basic_layers_group';
      const basicLayerGroup = this.getLayer(basicLayerGroupId);
      if (basicLayerGroup) {
        this.removeLayer(basicLayerGroupId);
        this[_currentMapBaseType] = null;
      }
    }

    /**
     * 获取当前地图Map的底图服务对象集合
     */
    getMapBasicLayers() {
      return this.getLayer('pjtoolsmap_basic_layers_group');
    }
  }

  // 动态扩展PJtoolsMap地图Class类的函数方法
  bindPrototypeMethods(mapPrototypes, PJtoolsMap.prototype);

  return PJtoolsMap;
})();

export default PJtoolsMap;
