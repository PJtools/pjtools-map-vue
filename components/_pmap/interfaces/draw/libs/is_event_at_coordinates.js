/**
 * @文件说明: 定义鼠标单击位置是否为同一个点位
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-01 16:06:45
 */

function isEventAtCoordinates(event, coordinates) {
  if (!event.lngLat) return false;
  return event.lngLat.lng === coordinates[0] && event.lngLat.lat === coordinates[1];
}

export default isEventAtCoordinates;
