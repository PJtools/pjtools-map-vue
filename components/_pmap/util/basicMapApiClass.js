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
