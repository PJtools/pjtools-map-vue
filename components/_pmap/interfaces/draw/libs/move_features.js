/**
 * @文件说明: 定义移动Feature要素的坐标
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-05 17:41:03
 */

import Constants from '../constants';

export default function(features, delta) {
  features.map(feature => {
    const currentCoordinates = feature.getCoordinates();

    const moveCoordinate = coord => {
      const point = {
        lng: coord[0] + delta.lng,
        lat: coord[1] + delta.lat,
      };
      return [point.lng, point.lat];
    };
    const moveRing = ring => ring.map(coord => moveCoordinate(coord));
    const moveMultiPolygon = multi => multi.map(ring => moveRing(ring));

    let nextCoordinates;
    if (feature.type === Constants.geojsonTypes.POINT) {
      nextCoordinates = moveCoordinate(currentCoordinates);
    } else if (feature.type === Constants.geojsonTypes.LINE_STRING || feature.type === Constants.geojsonTypes.MULTI_POINT) {
      nextCoordinates = currentCoordinates.map(moveCoordinate);
    } else if (feature.type === Constants.geojsonTypes.POLYGON || feature.type === Constants.geojsonTypes.MULTI_LINE_STRING) {
      nextCoordinates = currentCoordinates.map(moveRing);
    } else if (feature.type === Constants.geojsonTypes.MULTI_POLYGON) {
      nextCoordinates = currentCoordinates.map(moveMultiPolygon);
    }

    // 判断是否有圆心属性
    if (feature.center) {
      feature.center = moveCoordinate(feature.center);
    }
    if (feature.properties['draw:center']) {
      let center = feature.properties['draw:center'].split(',');
      center = [Number(center[0]), Number(center[1])];
      center = moveCoordinate(center);
      feature.updateInternalProperty('center', center.join(','));
    }

    feature.incomingCoords(nextCoordinates);
  });
}
