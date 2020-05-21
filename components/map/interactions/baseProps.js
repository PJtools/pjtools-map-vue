/**
 * @文件说明: 定义地图交互组件的基础Props属性
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-18 15:45:13
 */

import { PropTypes } from '../../_util/antdv';

export default () => ({
  // 地图组件Id属性
  id: PropTypes.string.isRequired,
  // 地图组件Class样式名
  className: PropTypes.string,
  // 地图组件Style样式
  styles: PropTypes.object,
});
