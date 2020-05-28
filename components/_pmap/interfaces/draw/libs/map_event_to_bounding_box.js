/**
 * @文件说明: 获取地图鼠标点位缓冲成BBOX范围
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-28 11:17:17
 */

function mapEventToBoundingBox(mapEvent, buffer = 0) {
  return [
    [mapEvent.point.x - buffer, mapEvent.point.y - buffer],
    [mapEvent.point.x + buffer, mapEvent.point.y + buffer],
  ];
}

export default mapEventToBoundingBox;
