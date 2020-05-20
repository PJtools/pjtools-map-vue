/**
 * @文件说明: Handlers.DragPan 地图漫游交互
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-14 14:08:40
 */

import { isFunction } from '../../_util/methods-util';

class DragPan {
  constructor(iMapApi) {
    this.iMapApi = iMapApi;
    // 获取原地图的dragPan对象
    const map = this.iMapApi && this.iMapApi.map;
    if (map) {
      this.dragPan = map.dragPan;
    }
  }

  /**
   * 激活地图漫游交互功能
   * @param {Object} options 漫游交互的选项
   */
  enable(options = {}) {
    const cursor = this.iMapApi && this.iMapApi.Handlers && this.iMapApi.Handlers.cursor;
    // 判断当前地图的光标是否有关联的交互对象
    cursor && cursor.handler && isFunction(cursor.handler.disable) && cursor.handler.disable();
    // 触发地图漫游激活
    this.dragPan && this.dragPan.enable(options);
  }

  /**
   * 禁用地图漫游交互功能
   */
  disable() {
    this.dragPan && this.dragPan.disable();
  }

  /**
   * 获取地图漫游交互当前的禁用/启用状态
   */
  isEnabled() {
    if (!this.dragPan) {
      return;
    }
    return this.dragPan.isEnabled();
  }

  /**
   * 获取地图漫游交互当前的活动状态
   */
  isActive() {
    if (!this.dragPan) {
      return;
    }
    return this.dragPan.isActive();
  }
}

export default DragPan;
