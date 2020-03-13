/**
 * @文件说明: 定义Map组件的Props属性
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-11 22:00:07
 */

import { PropTypes } from '../_util/antdv';

export default () => ({
  prefixCls: PropTypes.string,
  // 地图容器的宽度
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  // 地图容器的高度
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  // 地图容器是否有边框
  bordered: PropTypes.bool.def(false),
  // 地图资源库的基础路径
  baseUrl: PropTypes.string,
});
