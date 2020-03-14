/**
 * @文件说明: 定义函数方法的工具类
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-11 22:23:05
 */

import {
  isArray as isAntdArray,
  isInteger as isAntdInteger,
  isFunction as isAntdFunction,
  has as antdHas,
} from 'ant-design-vue/es/_util/vue-types/utils';
import { addClass as addAntdClass, removeClass as removeAntdClass } from 'ant-design-vue/es/_util/Dom/class-util';

/**
 * 获取转换的前缀ClassName名称
 * @param {string} suffixCls 前缀Class名
 * @param {string} customizePrefixCls 自定义前缀Class名
 */
export const getPrefixCls = (suffixCls, customizePrefixCls) => {
  if (customizePrefixCls) return customizePrefixCls;
  return `pjtools-${suffixCls}`;
};

/**
 * 判断是否为数值（包括：字符串型数值）
 * @param {number} value 待判断的数值
 */
export const isNumeric = value => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * 判断是否为Function型函数
 * @param {function} value 待判断的对象
 */
export const isFunction = isAntdFunction;

/**
 * 判断是否为Array数组类型
 * @param {array} value 待判断的对象
 */
export const isArray = isAntdArray;

/**
 * 判断是否为零长度的Array数组类型
 * @param {array} value 待判断的对象
 */
export const isEmptyArray = value => {
  return !!(isArray(value) && !value.length);
};

/**
 * 判断是否为Boolean布尔类型
 * @param {boolean} value 待判断的对象
 */
export const isBoolean = value => {
  return typeof value === 'boolean';
};

/**
 * 判断是否为布尔类型的True值
 * @param {boolean} value 待判断的对象
 */
export const isBooleanTrue = value => {
  return !!(isBoolean(value) && value === true);
};

/**
 * 判断是否为布尔类型的False值
 * @param {boolean} value 待判断的对象
 */
export const isBooleanFlase = value => {
  return !!(isBoolean(value) && value === false);
};

/**
 * 判断是否为Integer整数类型
 * @param {number} value 待判断的对象
 */
export const isInteger = isAntdInteger;

/**
 * 判断是否为空值，其中：undefined， null，''， NaN，false，[]，{}，不包括数值0
 * @param {any} value 待判断的对象
 */
export const isEmpty = value => {
  switch (typeof value) {
    case 'undefined':
      return true;
    case 'string':
      if (value.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, '').length === 0) {
        return true;
      }
      break;
    case 'boolean':
      if (!value) {
        return true;
      }
      break;
    case 'number':
      if (isNaN(value)) {
        return true;
      }
      break;
    case 'object':
      if (null === value || value.length === 0) {
        return true;
      }
      for (let i in value) {
        return false;
      }
      return true;
  }
  return false;
};

/**
 * 判断Object对象是否存在属性名
 * @param {number} obj Object对象
 * @param {string} prop 待检查的属性名
 */
export const has = antdHas;

/**
 * 在DOM对象上添加Class类名
 * @param {Element} el DOM对象
 * @param {string} cls 待添加的ClassName名
 */
export const addClass = addAntdClass;

/**
 * 在DOM对象上移除Class类名
 * @param {Element} el DOM对象
 * @param {string} cls 待移除的ClassName名
 */
export const removeClass = removeAntdClass;
