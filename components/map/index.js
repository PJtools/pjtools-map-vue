/**
 * @文件说明: Map Component - 地图组件
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-10 19:01:55
 */

import Base from '../base';
import Map from './map';

Map.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Map.name, Map);
};

export default Map;
