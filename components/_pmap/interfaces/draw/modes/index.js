/**
 * @文件说明: 定义Draw绘图的模式
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-21 18:13:51
 */

import StaticMode from './static';
import SelectMode from './select';
import EditMode from './edit';
import PointMode from './point';
import LineMode from './line';
import PolygonMode from './polygon';
import CircleMode from './circle';
import RectangleMode from './rectangle';
import EllipseMode from './ellipse';

export default {
  static: StaticMode,
  select: SelectMode,
  edit: EditMode,
  point: PointMode,
  line: LineMode,
  polygon: PolygonMode,
  circle: CircleMode,
  rectangle: RectangleMode,
  ellipse: EllipseMode,
};
