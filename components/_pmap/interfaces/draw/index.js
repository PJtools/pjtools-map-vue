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
const _ctx = Symbol('Context');
const _isInitModeChange = Symbol('isInitModeChange');

class Draw extends BasicMapApiEvented {
  /**
   * 绘图的参数选项
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
      uid: hat(),
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
    // 判断初次激活模式是否为静态模式，则直接忽略
    if (!this.getMode() && mode === Constants.modes.STATIC) {
      return;
    }

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
    console.log('draw disable');

    // 更新状态
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
}

export default Draw;
