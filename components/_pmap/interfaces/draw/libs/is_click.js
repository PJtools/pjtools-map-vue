/**
 * @文件说明: 判断是否为Click单击操作
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-22 14:27:14
 */

import euclideanDistance from './euclidean_distance';

const FINE_TOLERANCE = 4;
const GROSS_TOLERANCE = 12;
const INTERVAL = 500;

export default function isClick(start, end, options = {}) {
  const fineTolerance = options.fineTolerance != null ? options.fineTolerance : FINE_TOLERANCE;
  const grossTolerance = options.grossTolerance != null ? options.grossTolerance : GROSS_TOLERANCE;
  const interval = options.interval != null ? options.interval : INTERVAL;

  start.point = start.point || end.point;
  start.time = start.time || end.time;
  const moveDistance = euclideanDistance(start.point, end.point);

  return moveDistance < fineTolerance || (moveDistance < grossTolerance && end.time - start.time < interval);
}
