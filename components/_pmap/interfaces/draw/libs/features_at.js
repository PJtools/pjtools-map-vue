/**
 * @文件说明: 根据鼠标坐标查找Feature要素
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-22 14:35:15
 */

import Constants from '../constants';

const META_TYPES = [Constants.meta.FEATURE, Constants.meta.MIDPOINT, Constants.meta.VERTEX];

function featuresAtClick(event, bbox, ctx) {
  return featuresAt(event, bbox, ctx, ctx.options.clickBuffer);
}

function featuresAtTouch(event, bbox, ctx) {
  return featuresAt(event, bbox, ctx, ctx.options.touchBuffer);
}

function featuresAt(event, bbox, ctx, buffer) {
  if (ctx.map === null) return [];

  // const box = event ? mapEventToBoundingBox(event, buffer) : bbox;

  // const queryParams = {};
  // if (ctx.options.styles) queryParams.layers = ctx.options.styles.map(s => s.id);

  // const features = ctx.map.queryRenderedFeatures(box, queryParams).filter(feature => META_TYPES.indexOf(feature.properties.meta) !== -1);

  // const featureIds = new StringSet();
  // const uniqueFeatures = [];
  // features.forEach(feature => {
  //   const featureId = feature.properties.id;
  //   if (featureIds.has(featureId)) return;
  //   featureIds.add(featureId);
  //   uniqueFeatures.push(feature);
  // });

  // return sortFeatures(uniqueFeatures);
  return [];
}

export default {
  click: featuresAtClick,
  touch: featuresAtTouch,
};
