/**
 * @文件说明: 定义地图扩展组件的基础Props属性
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-30 12:27:36
 */

import { PropTypes } from '../../../_util/antdv';
import { PositionKeysEnum } from './index';

export default () => ({
  // 地图UI组件的是否渲染状态
  visible: PropTypes.bool.def(true),
  // 地图UI组件包的Class类名（当采用内置Wrapper对象则有效，反之属性无效）
  wrapClassName: PropTypes.any,
  // 地图UI组件包的Style样式（当采用内置Wrapper对象则有效，反之属性无效）
  wrapStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  // 地图UI组件包的位置（当采用内置Wrapper对象则有效，反之属性无效）
  position: PropTypes.oneOf(PositionKeysEnum),
  // 地图UI组件包的偏移量（当采用内置Wrapper对象则有效，反之属性无效）
  offset: PropTypes.array.def([0, 0]),
});
