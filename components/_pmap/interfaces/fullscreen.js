/**
 * @文件说明: Interfaces.Fullscreen 地图全屏对象
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-21 10:37:14
 */

import { BasicMapApiEvented } from '../util/basicMapApiClass';
import DOM from '../util/dom';

class Fullscreen extends BasicMapApiEvented {
  // 是否全屏状态
  _fullscreen = false;
  // 全屏区域DOM对象
  _container;
  // 全屏Change事件各浏览器兼容支持的类型
  _fullscreenchange;

  // 构造函数
  constructor(iMapApi) {
    super(iMapApi);

    // 获取地图的全屏区域DOM对象
    const element = iMapApi.getMapViewContainer();
    this._container = element && element.parentNode;
    // 获取浏览器支持的Change事件类型
    if ('onfullscreenchange' in window.document) {
      this._fullscreenchange = 'fullscreenchange';
    } else if ('onwebkitfullscreenchange' in window.document) {
      this._fullscreenchange = 'webkitfullscreenchange';
    } else if ('onmozfullscreenchange' in window.document) {
      this._fullscreenchange = 'mozfullscreenchange';
    } else if ('onmsfullscreenchange' in window.document) {
      this._fullscreenchange = 'MSFullscreenChange';
    }
  }

  /**
   * 激活全屏模式
   * 使用注意：出于浏览器安全等原因，需人为手动触发，不能自动触发.
   */
  enable() {
    if (this._checkFullscreenSupport() && !this.isFullscreen()) {
      if (this._container.requestFullscreen) {
        this._container.requestFullscreen();
      } else if (this._container.webkitRequestFullscreen) {
        this._container.webkitRequestFullscreen();
      } else if (this._container.mozRequestFullScreen) {
        this._container.mozRequestFullScreen();
      } else if (this._container.msRequestFullscreen) {
        this._container.msRequestFullscreen();
      }
      this._fullscreen = true;
      // 绑定事件
      this._eventChange = DOM.onEventListener(window.document, this._fullscreenchange, this._handleFullscreenChange.bind(this));
    }
  }

  /**
   * 退出全屏模式
   */
  disable() {
    if (this._checkFullscreenSupport() && this.isFullscreen()) {
      if (window.document.exitFullscreen) {
        window.document.exitFullscreen();
      } else if (window.document.webkitCancelFullScreen) {
        window.document.webkitCancelFullScreen();
      } else if (window.document.mozCancelFullScreen) {
        window.document.mozCancelFullScreen();
      } else if (window.document.msExitFullscreen) {
        window.document.msExitFullscreen();
      }
      this._fullscreen = false;
    }
  }

  /**
   * 判断当前是否为全屏状态
   */
  isFullscreen() {
    return this._fullscreen;
  }

  /**
   * 全屏模式自动切换
   */
  toggle() {
    if (this.isFullscreen()) {
      this.disable();
    } else {
      this.enable();
    }
  }

  // 检查浏览器是否支持全屏接口
  _checkFullscreenSupport() {
    return !!(
      window.document.fullscreenEnabled ||
      window.document.mozFullScreenEnabled ||
      window.document.msFullscreenEnabled ||
      window.document.webkitFullscreenEnabled
    );
  }

  // 执行全屏模式的Change事件
  _handleFullscreenChange() {
    const fullscreenElement =
      window.document.fullscreenElement ||
      window.document.webkitFullscreenElement ||
      window.document.mozFullScreenElement ||
      window.document.msFullscreenElement;
    // 判断通过“ESC”或“F11”退出全屏时，更新状态
    if ((fullscreenElement === this._container) !== this._fullscreen) {
      this._fullscreen = !this._fullscreen;
      if (this._eventChange) {
        this._eventChange.remove();
        delete this._eventChange;
      }
    }
    this.fire('change', { status: this._fullscreen });
  }
}

export default Fullscreen;
