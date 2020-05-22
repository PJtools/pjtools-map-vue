/**
 * @文件说明: Interfaces.Draw 地图矢量图形绘制对象
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-21 16:12:06
 */

import { BasicMapApiEvented } from '../../util/basicMapApiClass';
import assign from 'lodash/assign';
import hat from 'hat';
import Constants from './constants';
import modes from './modes';
import events from './events';

const defaultDrawOptions = {
  // 扩展绘图模式
  modes: null,
  // 绘图的图形样式
  styles: [],
  // 单击时的查询缓冲范围
  clickBuffer: 2,
  // Touch时查询缓冲范围
  touchBuffer: 25,
  // 是否开启键盘快捷键
  keyboard: false,
  // 是否开启 Shift + Ctrl + drag 组合进行要素框选
  boxSelect: true,
};

const _drawOptions = Symbol('options');
const _ctx = Symbol('Context');

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

    const ctx = {
      api: this,
      uid: hat(),
      options: opts,
      iMapApi: this.iMapApi,
      map: (this.iMapApi && this.iMapApi.map) || null,
      container: (this.iMapApi && this.iMapApi.getMapContainer()) || null,
    };
    // 注册绘图模式的事件框架
    ctx.events = events(ctx);

    this[_ctx] = ctx;
  }

  /**
   * 激活绘图
   */
  enable(options = {}) {
    this[_ctx].events.addEventListeners();
    this[_ctx].events.start(options);
  }

  /**
   * 注销绘图
   */
  disable() {}
}

export default Draw;
