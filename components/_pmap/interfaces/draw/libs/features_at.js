/**
 * @文件说明: 根据鼠标坐标查找Feature要素
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-22 14:35:15
 */

import Constants from '../constants';
import mapEventToBoundingBox from './map_event_to_bounding_box';
import sortFeatures from './sort_features';
import StringSet from './string_set';

const META_TYPES = [Constants.meta.FEATURE, Constants.meta.MIDPOINT, Constants.meta.VERTEX];

function featuresAtClick(event, bbox, ctx) {
  return featuresAt(event, bbox, ctx, ctx.options.clickBuffer);
}

function featuresAtTouch(event, bbox, ctx) {
  return featuresAt(event, bbox, ctx, ctx.options.touchBuffer);
}

function featuresAt(event, bbox, ctx, buffer) {
  if (ctx.iMapApi === null) return [];

  const box = event ? mapEventToBoundingBox(event, buffer) : bbox;
  let features = ctx.iMapApi.queryRenderedFeatures(`draw-layers-group.${ctx.uid}`, box);
  features = features.filter(feature => META_TYPES.indexOf(feature.properties['draw:meta']) !== -1);

  const featureIds = new StringSet();
  const uniqueFeatures = [];
  features.map(feature => {
    const featureId = feature.properties['draw:id'];
    if (featureIds.has(featureId)) return;
    featureIds.add(featureId);
    uniqueFeatures.push(feature);
  });

  return sortFeatures(uniqueFeatures);
}

export default {
  click: featuresAtClick,
  touch: featuresAtTouch,
};
