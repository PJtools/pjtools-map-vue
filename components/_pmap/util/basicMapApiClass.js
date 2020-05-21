/**
 * @文件说明: 构建iMapApi地图实例的子级对象的基类
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-19 23:31:37
 */

const BasicMapApi = (function() {
  let _iMapApi = Symbol('iMapApi');

  class BasicMapApi {
    get iMapApi() {
      return this[_iMapApi];
    }

    constructor(iMapApi) {
      this[_iMapApi] = iMapApi;
    }
  }

  return BasicMapApi;
})();

export default BasicMapApi;

// 扩展带自定义事件的基类
export const BasicMapApiEvented = (function() {
  let _evented = Symbol('Evented');

  class BasicMapApiEvented extends BasicMapApi {
    constructor(iMapApi) {
      super(iMapApi);

      const { mapboxgl } = iMapApi && iMapApi.exports;
      this[_evented] = new mapboxgl.Evented();
    }

    /**
     * 注册绑定事件
     * @param {String} type 事件类型名
     * @param {Function} listener 回调事件函数
     */
    on(type, listener) {
      return this[_evented].on(type, listener);
    }

    /**
     * 解除绑定事件
     * @param {String} type 事件类型名
     * @param {Function} listener 回调事件函数
     */
    off(type, listener) {
      return this[_evented].off(type, listener);
    }

    /**
     * 注册绑定仅只执行一次事件
     * @param {String} type 事件类型名
     * @param {Function} listener 回调事件函数
     */
    once(type, listener) {
      return this[_evented].once(type, listener);
    }

    /**
     * 驱动执行绑定的事件
     * @param {Event} event 事件类型名
     * @param {Object} properties 回调事件函数接收的数据
     */
    fire(event, properties) {
      return this[_evented].fire(event, properties);
    }

    /**
     * 判断事件监听是否已注册
     * @param {String} type 事件类型名
     */
    listens(type) {
      return this[_evented].listens(type);
    }
  }

  return BasicMapApiEvented;
})();

/**
 * 动态扩展Class类的Prototype属性挂接函数方法
 * @param {Object} methods 待动态添加的函数对象
 * @param {Class} prototype 待动态挂接的Class类Prototype属性
 */
export const bindPrototypeMethods = function(methods, prototype) {
  if (typeof methods === 'object') {
    Object.keys(methods).map(key => {
      prototype[key] = methods[key];
    });
  }
};
