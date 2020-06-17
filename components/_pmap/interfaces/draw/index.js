/**
 * @文件说明: Interfaces.Draw 地图矢量图形绘制对象
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-21 16:12:06
 */

import { BasicMapApiEvented } from '../../util/basicMapApiClass';
import { isEmpty } from '../../../_util/methods-util';
import assign from 'lodash/assign';
import hat from 'hat';
import Constants from './constants';
import featuresAt from './libs/features_at';
import StringSet from './libs/string_set';
import modes from './modes';
import events from './events';
import Store from './store';

const defaultDrawOptions = {
  // 扩展绘图模式
  modes: null,
  // 绘图的图形主题样式
  theme: {},
  // 默认初始的Feature要素数据集合
  data: [],
  // 单击时的查询缓冲范围
  clickBuffer: 2,
  // Touch时查询缓冲范围
  touchBuffer: 25,
};

const _drawOptions = Symbol('options');
const _uid = Symbol('uid');
const _ctx = Symbol('Context');
const _isInitModeChange = Symbol('isInitModeChange');

class Draw extends BasicMapApiEvented {
  /**
   * 当前绘图的唯一Id
   * @readonly
   */
  get uid() {
    return this[_uid];
  }

  /**
   * 当前绘图的参数项
   * @readonly
   */
  get options() {
    return this[_drawOptions];
  }

  // 构造函数
  constructor(iMapApi, options = {}) {
    super(iMapApi);

    // 合并与设置参数选项
    options.modes = !options.modes ? modes : assign({}, modes, options.modes);
    const opts = assign({}, defaultDrawOptions, options);
    this[_uid] = hat();
    // 添加默认绘图模式
    opts.defaultMode = Constants.modes.STATIC;
    // 赋值参数选项
    this[_drawOptions] = opts;
    // 是否首次Mode模式更新
    this[_isInitModeChange] = true;

    // 禁用/启用状态
    this._enabled = false;
    // 对象活动状态
    this._active = false;
    // 定义内部作用域对象
    const ctx = {
      api: this,
      uid: this[_uid],
      options: opts,
      iMapApi: this.iMapApi,
      map: (this.iMapApi && this.iMapApi.map) || null,
      container: (this.iMapApi && this.iMapApi.getMapViewContainer()) || null,
      cursor: this.iMapApi && this.iMapApi.Handlers.cursor,
      setActive: active => {
        this._active = !!active;
      },
    };
    // 注册绘图模式的事件框架
    ctx.events = events(ctx);
    // 注册绘图的数据管理对象
    ctx.store = new Store(ctx);
    // 当有前置矢量数据时，则添加绘图的图层
    if (!isEmpty(opts.data) && !ctx.store.isLoadedLayers()) {
      ctx.store.addLayers();
    }

    this[_ctx] = ctx;
  }

  /**
   * 激活绘图模式
   */
  enable(mode, options = {}) {
    const store = this[_ctx].store;
    const events = this[_ctx].events;
    // 判断是否未添加绘图的图层，则渲染图层
    !store.isLoadedLayers() && store.addLayers();
    // 启动绘图事件监听
    let silent = false;
    if (!events.isLoadedEventListeners()) {
      events.addEventListeners();
      // 判断是否首次启动模式激活
      if (this[_isInitModeChange]) {
        events.start();
        this[_isInitModeChange] = false;
        silent = true;
      }
    }
    // 切换绘图模式
    this.changeMode(mode, options, { silent });
    // 更新状态
    this._enabled = true;
  }

  /**
   * 取消激活绘图模式
   */
  disable() {
    const events = this[_ctx].events;
    // 切换成静态模式
    this.changeMode(Constants.modes.STATIC, {}, { silent: true });
    // 移除绘图事件监听
    if (events.isLoadedEventListeners()) {
      events.removeEventListeners();
    }
    // 更新状态
    this._active = false;
    this._enabled = false;
  }

  /**
   * 获取当前禁用/启用状态
   */
  isEnabled() {
    return !!this._enabled;
  }

  /**
   * 获取当前活动状态
   */
  isActive() {
    return !!this._active;
  }

  /**
   * 销毁绘图的实例（包括图层数据）
   */
  destroy() {
    const store = this[_ctx].store;

    // 还原默认静态模式
    this.disable();
    // 移除数据图层
    if (store.isLoadedLayers()) {
      store.removeLayers();
    }
    // 重置内置参数
    this[_isInitModeChange] = true;
    this[_ctx] = null;
  }

  /**
   * 获取当前激活的绘图模式
   */
  getMode() {
    return this[_ctx].events.getMode();
  }

  /**
   * 更新当前绘图模式
   * @param {String} mode 待更新的绘图模式名
   * @param {Object} options 待更新的绘图模式参数选项
   * @param {Object} eventOptions 切换模式时的参数；<silent> 是否不驱动ModeChange事件回调
   */
  changeMode(mode, options = {}, eventOptions = {}) {
    const events = this[_ctx].events;
    events && events.changeMode(mode, options, eventOptions);
  }

  /**
   * 设置当前模式的地图光标样式及Tip提示
   * @param {Object} options 光标参数选项
   */
  setModeCursor(options = {}) {
    const events = this[_ctx].events;
    const mode = events.getCurrentModeInstance();
    mode && mode.updateCursor(options);
  }

  /**
   * 执行当前绘图模式的删除
   */
  trash() {
    const events = this[_ctx].events;
    events && events.trash && events.trash();
  }

  /**
   * 执行当前编辑模式的同类型Feature要素合并成复合要素
   */
  combineFeatures() {
    const events = this[_ctx].events;
    events && events.combineFeatures && events.combineFeatures();
  }

  /**
   * 执行当前编辑模式复合要素类型拆分为单类型Feature要素
   */
  uncombineFeatures() {
    const events = this[_ctx].events;
    events && events.uncombineFeatures && events.uncombineFeatures();
  }

  /**
   * 根据屏幕坐标点或BBOX范围查询绘图的Feature要素的Id集合
   * @param {Point} point 待查询的屏幕坐标
   */
  getFeatureIdsAt(point) {
    const ctx = this[_ctx];
    let features = featuresAt.click({ point }, null, ctx);
    if (features && features.length) {
      features = features.filter(feature => feature.properties['draw:meta'] === Constants.meta.FEATURE);
    } else {
      features = [];
    }
    return features.map(feature => feature.id || feature.properties['draw:id']);
  }

  /**
   * 根据要素Id获取Feature要素对象
   * @param {String} id 要素Feature的Id
   */
  getFeature(id) {
    const feature = this[_ctx].store.get(id);
    if (feature && feature.properties['draw:meta'] === Constants.meta.FEATURE) {
      const geojson = feature.toGeoJSON();
      const keys = Object.keys(geojson.properties);
      const properties = {};
      keys.map(key => {
        if (key.indexOf('draw:') !== 0) {
          properties[key] = geojson.properties[key];
        }
      });
      geojson.properties = properties;
      return geojson;
    }
    return null;
  }

  /**
   * 获取所有的Feature要素
   */
  getAllFeatures() {
    const features = this[_ctx].store.getAll();
    return features.map(feature => this.getFeature(feature.id)).filter(feature => feature !== null && feature !== undefined);
  }

  /**
   * 获取当前选中的Feature要素Id集合
   */
  getSelectedIds() {
    return this[_ctx].store.getSelectedIds();
  }

  /**
   * 获取当前选中的Feature要素
   */
  getSelected() {
    const selectedIds = this.getSelectedIds();
    if (selectedIds && selectedIds.length) {
      return selectedIds.map(id => this.getFeature(id));
    }
    return [];
  }

  /**
   * 获取当前选中的Vertex节点
   */
  getSelectedVertexs() {
    const selectedCoordinates = this[_ctx].store.getSelectedCoordinates();
    if (selectedCoordinates && selectedCoordinates.length) {
      return selectedCoordinates.map(item => {
        const id = hat();
        return {
          type: Constants.geojsonTypes.FEATURE,
          id,
          geometry: {
            type: Constants.geojsonTypes.POINT,
            coordinates: item.coordinates,
          },
          properties: {
            'draw:id': id,
            'draw:path': item.path,
            'draw:pid': item.pid,
          },
        };
      });
    }
    return [];
  }

  /**
   * 设置指定Id的Feature要素的Properties属性
   * @param {String} id Feature要素的Id
   * @param {String} key 属性名
   * @param {String|Number|Boolean} value 属性值
   */
  setFeatureProperty(id, key, value) {
    this[_ctx].store.setFeatureProperty(id, key, value);
  }

  /**
   * 添加绘图的要素数据
   * @param {FeatureCollection} FeatureCollection 待添加的Feature要素集合
   */
  add(featureCollection) {
    const store = this[_ctx].store;
    const events = this[_ctx].events;
    const collection = this.iMapApi.getFeatureCollection(featureCollection);
    const featureIds = [];
    if (collection && collection.features.length) {
      collection.features.map(geojson => {
        geojson.id = geojson.id || hat();
        const _feature = store.get(geojson.id);
        if (_feature === undefined || _feature === null) {
          const feature = store.getFeatureToGeoJSON(geojson);
          store.add(feature);
          featureIds.push(feature.id);
        }
      });
      // 判断是否还未激活绘图模式，则激活默认静态模式
      if (!events.getMode()) {
        this.enable(Constants.modes.STATIC);
      } else {
        store.render();
      }
      return featureIds;
    }
  }

  /**
   * 删除指定Id的Feature要素
   * @param {Array} featureIds Feature要素的Id集合
   */
  delete(featureIds) {
    const store = this[_ctx].store;
    const events = this[_ctx].events;
    store.delete(featureIds);
    if (!events.getMode()) {
      this.enable(Constants.modes.STATIC);
    } else {
      store.setModeChangeRendering();
      store.render();
    }
  }

  /**
   * 清空所有绘制的Feature要素
   */
  deleteAll() {
    const ids = this[_ctx].store.getAllIds();
    ids && ids.length && this.delete(ids);
  }

  /**
   * 设置绘图的要素数据集合
   * @param {FeatureCollection} featureCollection 待覆盖的Feature要素集合
   */
  set(featureCollection) {
    const store = this[_ctx].store;
    const collection = this.iMapApi.getFeatureCollection(featureCollection);
    if (collection && collection.features.length) {
      const renderBatch = store.createRenderBatch();
      let toDelete = store.getAllIds().slice();
      const newIds = this.add(featureCollection);
      const newIdsLookup = new StringSet(newIds);
      toDelete = toDelete.filter(id => !newIdsLookup.has(id));
      if (toDelete.length) {
        this.delete(toDelete);
      }
      renderBatch();
      return newIds;
    }
  }
}

export default Draw;
