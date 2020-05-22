/**
 * @文件说明: 计算两点的距离
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-22 14:25:08
 */

export default function(a, b) {
  const x = a.x - b.x;
  const y = a.y - b.y;
  return Math.sqrt(x * x + y * y);
}
