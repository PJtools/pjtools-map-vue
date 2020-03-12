/**
 * @文件说明: 定义函数方法的工具类
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-11 22:23:05
 */

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
