/**
 * @文件说明: 定义绘图Mode模式的事件委托处理功能
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-22 11:20:22
 */

import { eventKeys } from '../modes/object_to_mode';

const ModeHandler = function(mode, context) {
  // 定义事件存储器
  const handlers = {};
  eventKeys.map(key => {
    handlers[key] = [];
  });

  const ctx = {
    on(event, selector, fn) {
      if (handlers[event] === undefined) {
        throw new Error(`绘图Draw类中事件类型[${event}]无效;`);
      }
      handlers[event].push({
        selector,
        fn,
      });
    },
    render(id) {
      context.store.featureChanged(id);
    },
  };

  // 定义事件委托
  const delegate = function(eventName, event) {
    const handles = handlers[eventName];
    let iHandle = handles.length;
    while (iHandle--) {
      const handle = handles[iHandle];
      if (handle.selector(event)) {
        const skipRender = handle.fn.call(ctx, event);
        if (!skipRender) {
          context.store.render();
        }
        break;
      }
    }
  };

  return {
    render: mode.render,

    start() {
      mode.start.call(ctx);
    },

    stop() {
      mode.stop && mode.stop();
    },

    trash() {
      if (mode.trash) {
        mode.trash();
        context.store.render();
      }
    },

    combineFeatures() {
      mode.combineFeatures && mode.combineFeatures();
    },

    uncombineFeatures() {
      mode.uncombineFeatures && mode.uncombineFeatures();
    },

    drag(e) {
      delegate('drag', e);
    },

    click(e) {
      delegate('click', e);
    },

    mousedown(e) {
      delegate('mousedown', e);
    },

    mousemove(e) {
      delegate('mousemove', e);
    },

    mouseup(e) {
      delegate('mouseup', e);
    },

    mouseover(e) {
      delegate('mouseover', e);
    },

    mouseout(e) {
      delegate('mouseout', e);
    },

    keydown(e) {
      delegate('keydown', e);
    },

    keyup(e) {
      delegate('keyup', e);
    },

    touchstart(e) {
      delegate('touchstart', e);
    },

    touchmove(e) {
      delegate('touchmove', e);
    },

    touchend(e) {
      delegate('touchend', e);
    },

    tap(e) {
      delegate('tap', e);
    },
  };
};

export default ModeHandler;
