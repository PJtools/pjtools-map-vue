/**
 * @文件说明: 定义地图控件的基础Props属性
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-31 21:47:01
 */

import { PropTypes } from '../../_util/antdv';

export default () => ({
  // 地图控件Id属性
  id: PropTypes.string.isRequired,
  // 地图控件Class样式名
  className: PropTypes.string,
  // 地图控件Style样式s
  styles: PropTypes.object,
  // 地图控件的位置
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
  // 地图控件的偏移量
  offset: PropTypes.array,
});
