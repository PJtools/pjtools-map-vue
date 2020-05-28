/**
 * @文件说明: 定义清理数组中undefined和null值的函数返回
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-27 17:28:57
 */

function toDenseArray(x) {
  return [].concat(x).filter(y => y !== undefined && y !== null);
}

export default toDenseArray;
