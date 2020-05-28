/**
 * @文件说明: 定义Feature要素排序函数
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-28 11:19:12
 */

import area from '@mapbox/geojson-area';
import Constants from '../constants';

const FEATURE_SORT_RANKS = {
  Point: 0,
  LineString: 1,
  Polygon: 2,
};

function comparator(a, b) {
  const score = FEATURE_SORT_RANKS[a.geometry.type] - FEATURE_SORT_RANKS[b.geometry.type];
  if (score === 0 && a.geometry.type === Constants.geojsonTypes.POLYGON) {
    return a.area - b.area;
  }
  return score;
}

function sortFeatures(features) {
  return features
    .map(feature => {
      if (feature.geometry.type === Constants.geojsonTypes.POLYGON) {
        feature.area = area.geometry({
          type: Constants.geojsonTypes.FEATURE,
          property: {},
          geometry: feature.geometry,
        });
      }
      return feature;
    })
    .sort(comparator)
    .map(feature => {
      delete feature.area;
      return feature;
    });
}

export default sortFeatures;
