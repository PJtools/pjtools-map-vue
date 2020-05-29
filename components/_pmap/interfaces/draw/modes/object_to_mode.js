/**
 * @文件说明: 定义绘图模式的对象作用域转换器
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-22 09:06:57
 */

import ModeInterface from './mode_interface';

const eventMapper = {
  drag: 'onDrag',
  click: 'onClick',
  dblclick: 'onDblClick',
  mousemove: 'onMouseMove',
  mousedown: 'onMouseDown',
  mouseup: 'onMouseUp',
  mouseover: 'onMouseOver',
  mouseout: 'onMouseOut',
  keyup: 'onKeyUp',
  keydown: 'onKeyDown',
  touchstart: 'onTouchStart',
  touchmove: 'onTouchMove',
  touchend: 'onTouchEnd',
  tap: 'onTap',
};

export const eventKeys = Object.keys(eventMapper);

export default function(modeObject) {
  const modeObjectKeys = Object.keys(modeObject);

  return function(ctx, startOpts = {}) {
    let state = {};

    const mode = modeObjectKeys.reduce((m, k) => {
      m[k] = modeObject[k];
      return m;
    }, new ModeInterface(ctx));

    const wrapper = function(eventName) {
      return e => mode[eventName](state, e);
    };

    return {
      start() {
        state = mode.onSetup(startOpts);
        eventKeys.forEach(key => {
          const modeHandler = eventMapper[key];
          let selector = () => false;
          if (modeObject[modeHandler]) {
            selector = () => true;
          }
          this.on(key, selector, wrapper(modeHandler));
        });
      },
      stop() {
        mode.onStop(state);
      },
      trash() {
        mode.onTrash(state);
      },
      combineFeatures() {
        mode.onCombineFeatures(state);
      },
      uncombineFeatures() {
        mode.onUncombineFeatures(state);
      },
      render(geojson, push) {
        mode.toDisplayFeatures(state, geojson, push);
      },
    };
  };
}
