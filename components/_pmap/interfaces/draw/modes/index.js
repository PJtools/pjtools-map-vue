/**
 * @文件说明: 定义Draw绘图的模式
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-21 18:13:51
 */

import StaticMode from './static';
import SelectMode from './select';
import PointMode from './point';
import LineMode from './line';
import PolygonMode from './polygon';
import CircleMode from './circle';

export default {
  static: StaticMode,
  select: SelectMode,
  point: PointMode,
  line: LineMode,
  polygon: PolygonMode,
  circle: CircleMode,
};
