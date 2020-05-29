/**
 * @文件说明: 定义Feature要素对象
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-27 18:23:13
 */

import hat from 'hat';
import Constants from '../constants';

const Feature = function(ctx, geojson) {
  this.ctx = ctx;
  this.properties = geojson.properties || {};
  this.coordinates = geojson.geometry.coordinates;
  this.id = geojson.id || hat();
  this.type = geojson.geometry.type;
};

Feature.prototype.changed = function() {
  this.ctx.store.featureChanged(this.id);
};

Feature.prototype.incomingCoords = function(coords) {
  this.setCoordinates(coords);
};

Feature.prototype.setCoordinates = function(coords) {
  this.coordinates = coords;
  this.changed();
};

Feature.prototype.getCoordinates = function() {
  return JSON.parse(JSON.stringify(this.coordinates));
};

Feature.prototype.setProperty = function(property, value) {
  this.properties[property] = value;
};

Feature.prototype.toGeoJSON = function() {
  return JSON.parse(
    JSON.stringify({
      id: this.id,
      type: Constants.geojsonTypes.FEATURE,
      properties: this.properties,
      geometry: {
        coordinates: this.getCoordinates(),
        type: this.type,
      },
    }),
  );
};

Feature.prototype.internal = function(mode) {
  const properties = {
    'draw:id': this.id,
    'draw:mode': mode,
    'draw:meta': Constants.meta.FEATURE,
    'draw:type': this.type,
    'draw:active': Constants.activeStates.INACTIVE,
    ...this.properties,
  };
  this.properties = properties;

  return this;
};

Feature.prototype.updateInternalProperty = function(key, value) {
  this.properties[`draw:${key}`] && (this.properties[`draw:${key}`] = value);
  return this;
};

export default Feature;
