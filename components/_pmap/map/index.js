/**
 * @文件说明: 动态扩展PJtools.Map地图Class对象的函数方法
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-21 14:36:36
 */

import source from './source';
import layer from './layer';
import layerGroup from './layerGroup';

export default {
  // 地图“数据源”管理相关功能方法
  ...source,
  // 地图“图层”管理相关功能方法
  ...layer,
  // 地图“图层组”管理相关功能方法
  ...layerGroup,
};