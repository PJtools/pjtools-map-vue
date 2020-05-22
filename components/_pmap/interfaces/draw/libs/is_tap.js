/**
 * @文件说明: 判断是否为Tap触摸轻敲操作
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-22 14:30:05
 */

import euclideanDistance from './euclidean_distance';

const TOLERANCE = 25;
const INTERVAL = 250;

export default function isTap(start, end, options = {}) {
  const tolerance = options.tolerance != null ? options.tolerance : TOLERANCE;
  const interval = options.interval != null ? options.interval : INTERVAL;

  start.point = start.point || end.point;
  start.time = start.time || end.time;
  const moveDistance = euclideanDistance(start.point, end.point);

  return moveDistance < tolerance && end.time - start.time < interval;
}
