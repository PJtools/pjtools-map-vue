/**
 * @文件说明: 定义Draw绘图的事件
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-21 17:36:35
 */

import objectToMode from './modes/object_to_mode';
import isClick from './libs/is_click';
import isTap from './libs/is_tap';
import featuresAt from './libs/features_at';
import setupModeHandler from './libs/mode_handler';

const events = function(ctx) {
  // 统一处理及转换Mode模式的作用域
  const modes = Object.keys(ctx.options.modes).reduce((mode, key) => {
    mode[key] = objectToMode(ctx.options.modes[key]);
    return mode;
  }, {});

  // 记录鼠标单击下时的信息
  let mouseDownInfo = {};
  // 记录Touch时的信息
  let touchStartInfo = {};
  // 当前激活的Mode模式名
  let currentModeName = null;
  // 当前激活的Mode模式
  let currentMode = null;
  // 判断是否已进行事件监听
  let isEventsListeners = false;
  // 记录当前监听事件对象
  const listenersEvents = [];

  const events = {};

  // 定义拖拽Drag事件
  events.drag = function(e, isDrag) {
    if (
      isDrag({
        point: e.point,
        time: new Daete().getTime(),
      })
    ) {
      currentMode.drag(e);
    } else {
      e.originalEvent.stopPropagation();
    }
  };

  // 扩展Mouse Drag拖拽事件
  events.mousedrag = function(e) {
    events.drag(e, endInfo => !isClick(mouseDownInfo, endInfo));
  };

  // 扩展Touch Drag拖拽事件
  events.touchdrag = function(e) {
    events.drag(e, endInfo => !isTap(touchStartInfo, endInfo));
  };

  // 定义Mouse Down事件
  events.mousedown = function(e) {
    mouseDownInfo = {
      time: new Date().getTime(),
      point: e.point,
    };
    const features = featuresAt.click(e, null, ctx);
    e.featureTarget = features[0];
    currentMode.mousedown(e);
  };

  // 定义Mouse Move移动事件
  events.mousemove = function(e) {
    const button = e.originalEvent.buttons !== undefined ? e.originalEvent.buttons : e.originalEvent.which;
    if (button === 1) {
      return events.mousedrag(e);
    }
    const features = featuresAt.click(e, null, ctx);
    e.featureTarget = features[0];
    currentMode.mousemove(e);
  };

  // 定义Mouse Up事件
  events.mouseup = function(e) {
    const features = featuresAt.click(e, null, ctx);
    e.featureTarget = features[0];

    if (
      isClick(mouseDownInfo, {
        point: e.point,
        time: new Date().getTime(),
      })
    ) {
      currentMode.click(e);
    } else {
      currentMode.mouseup(e);
    }
  };

  // 定义Mouse Over事件
  events.mouseover = function(e) {
    currentMode.mouseover(e);
  };

  // 定义Mouse Out事件
  events.mouseout = function(e) {
    currentMode.mouseout(e);
  };

  // 定义Touch Start事件
  events.touchstart = function(e) {
    e.originalEvent.preventDefault();
    touchStartInfo = {
      time: new Date().getTime(),
      point: e.point,
    };
    const features = featuresAt.touch(e, null, ctx);
    e.featureTarget = features[0];
    currentMode.touchstart(e);
  };

  // 定义Touch Move事件
  events.touchmove = function(e) {
    e.originalEvent.preventDefault();
    currentMode.touchmove(e);
    return events.touchdrag(e);
  };

  // 定义Touch End事件
  events.touchend = function(e) {
    e.originalEvent.preventDefault();
    const features = featuresAt.touch(e, null, ctx);
    e.featureTarget = features[0];
    if (
      isTap(touchStartInfo, {
        time: new Date().getTime(),
        point: e.point,
      })
    ) {
      currentMode.tap(e);
    } else {
      currentMode.touchend(e);
    }
  };

  // 8 - Backspace
  // 46 - Delete
  const isKeyModeValid = code => !(code === 8 || code === 46 || (code >= 48 && code <= 57));

  // 定义Keydown事件
  events.keydown = function(e) {
    if (e.keyCode === 46) {
      e.preventDefault();
      currentMode.trash();
    } else if (isKeyModeValid(e.keyCode)) {
      currentMode.keydown(e);
    }
  };

  // 定义Keyup事件
  events.keyup = function(e) {
    if (isKeyModeValid(e.keyCode)) {
      currentMode.keyup(e);
    }
  };

  const api = {
    // 激活当前模式
    start(options = {}) {
      currentModeName = ctx.options.defaultMode;
      currentMode = setupModeHandler(modes[currentModeName](ctx, options), ctx);
      currentMode.start();
    },

    // 更新模式
    changeMode(modename, nextModeOptions, eventOptions = {}) {
      currentMode.stop();

      const modebuilder = modes[modename];
      if (modebuilder === undefined) {
        throw new Error(`绘图模式[${modename}]不存在.`);
      }
      currentModeName = modename;
      const mode = modebuilder(ctx, nextModeOptions);
      currentMode = setupModeHandler(mode, ctx);

      ctx.store.setDirty();
      ctx.store.render();
    },

    // 获取当前模式的名称
    currentModeName() {
      return currentModeName;
    },

    // 渲染当前模式的数据
    currentModeRender(geojson, push) {
      return currentMode.render(geojson, push);
    },

    // 获取当前模式对象
    getMode() {
      return currentModeName;
    },

    // 执行事件
    fire(name, event) {
      events[name] && events[name](event);
    },

    // 添加绘图事件监听
    addEventListeners() {
      // 判断是否已绑定绘图事件监听
      if (isEventsListeners) {
        return;
      }
      ctx.iMapApi.on(`draw.mousedown.${ctx.uid}`, 'mousedown', events.mousedown);

      // ctx.map.on('mousemove', events.mousemove);
      // ctx.map.on('mouseup', events.mouseup);
      // ctx.map.on('data', events.data);
      // ctx.map.on('touchmove', events.touchmove);
      // ctx.map.on('touchstart', events.touchstart);
      // ctx.map.on('touchend', events.touchend);
      // ctx.container.addEventListener('mouseout', events.mouseout);
      // if (ctx.options.keybindings) {
      //   ctx.container.addEventListener('keydown', events.keydown);
      //   ctx.container.addEventListener('keyup', events.keyup);
      // }
      isEventsListeners = true;
    },

    // 移除绘图事件监听
    removeEventListeners() {
      if (!isEventsListeners) {
        return;
      }

      ctx.iMapApi.off(`draw.mousedown.${ctx.uid}`);

      // ctx.map.off('mousemove', events.mousemove);
      // ctx.map.off('mouseup', events.mouseup);
      // ctx.map.off('data', events.data);
      // ctx.map.off('touchmove', events.touchmove);
      // ctx.map.off('touchstart', events.touchstart);
      // ctx.map.off('touchend', events.touchend);
      // ctx.container.removeEventListener('mouseout', events.mouseout);
      // if (ctx.options.keybindings) {
      //   ctx.container.removeEventListener('keydown', events.keydown);
      //   ctx.container.removeEventListener('keyup', events.keyup);
      // }

      isEventsListeners = false;
    },

    // 驱动激活Feature要素的删除
    trash(options) {
      currentMode.trash(options);
    },

    // 合并选中的Feature要素
    combineFeatures() {
      currentMode.combineFeatures();
    },

    // 拆分选中的复合要素
    uncombineFeatures() {
      currentMode.uncombineFeatures();
    },
  };

  return api;
};

export default events;
