/**
 * @文件说明: 定义矢量Layers图层的基类
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-22 15:14:20
 */

import BasicMapApi from '../../util/basicMapApiClass';
import hat from 'hat';
import cloneDeep from 'lodash/cloneDeep';
import round from 'lodash/round';
import omitBy from 'lodash/omitBy';
import remove from 'lodash/remove';
import find from 'lodash/find';
import filter from 'lodash/filter';
import assign from 'lodash/assign';
import { isEmpty, isNumeric, isNotEmptyArray, isArray, isString, isBooleanTrue } from '../../../_util/methods-util';

// 矢量图层的原生MapboxGL默认参数
export const defaultVectorLayerOptions = {
  layout: {
    visibility: 'visible',
  },
  metadata: {
    layerType: 'VectorLayer',
  },
};

// 矢量图层的基础扩展参数
export const defaultVectorBasicOptions = {
  // 是否添加指定图层前
  beforeId: null,
  // 是否添加到图层组中
  layerGroupId: null,
  // 图层透明度
  opacity: 1,
};

const _id = Symbol('id');
const _opacity = Symbol('opacity');
const _turf = Symbol('turf');
const _initLayerOptions = Symbol('initLayerOptions');
const _options = Symbol('options');
const _mapLayer = Symbol('mapLayer');
const _mapLayerGroup = Symbol('mapLayerGroup');

class BasicLayerClass extends BasicMapApi {
  get id() {
    return this[_id];
  }

  get turf() {
    return this[_turf];
  }

  // 初始原生图层参数
  get initLayerOptions() {
    return this[_initLayerOptions];
  }

  // 图层参数选项
  get options() {
    return this[_options];
  }

  // 图层到地图中的实例对象
  get mapLayer() {
    return this[_mapLayer] || null;
  }

  // 图层组到地图中的对象
  get mapLayerGroup() {
    return this[_mapLayerGroup] || null;
  }

  // 图层整体透明度
  get opacity() {
    return this[_opacity];
  }

  constructor(iMapApi, id, layerOptions, options) {
    super(iMapApi);

    this[_turf] = iMapApi && iMapApi.exports && iMapApi.exports.turf;
    this[_id] = id || hat();
    // 仅保留专属类型的Paint和Layout属性
    const copyLayerOptions = cloneDeep(layerOptions);
    const regexp = new RegExp(`^${copyLayerOptions.type}-.*?`);
    copyLayerOptions.paint = omitBy(copyLayerOptions.paint, (value, key) => !regexp.test(key));
    copyLayerOptions.layout = omitBy(copyLayerOptions.layout, (value, key) => !regexp.test(key));
    copyLayerOptions.layout['visibility'] = layerOptions.layout['visibility'];
    // 记录初始图层属性
    copyLayerOptions.id = this[_id];
    this[_initLayerOptions] = cloneDeep(copyLayerOptions);

    // 设定图层的Paint属性透明度
    if (options.opacityPaints && !isEmpty(options.opacity)) {
      options.opacity = getCheckOpacity(options.opacity);
      copyLayerOptions.paint = setLayerPaintOpacity(this[_initLayerOptions].paint, options.opacityPaints, options.opacity);
    }
    this[_opacity] = options.opacity;
    this[_options] = options;

    // 设置图层数据源
    if (copyLayerOptions && copyLayerOptions.type !== 'background') {
      const features = options.data ? getSourceFeatures(options.data) : [];
      // 获取字符串型数据源的数据集合
      if (copyLayerOptions.source && isString(copyLayerOptions.source)) {
        const source = iMapApi.getSource(copyLayerOptions.source);
        // 如果存在数据源则直接追加数据集合
        if (source) {
          const sourceFeatures = getSourceFeatures(source._data);
          sourceFeatures.push(...features);
          source.setData(this.turf.featureCollection(sourceFeatures));
        } else {
          copyLayerOptions.source = { type: 'geojson', data: this.turf.featureCollection(features) };
        }
      } else {
        const sourceData = copyLayerOptions.source && copyLayerOptions.source.data;
        features.push(...getSourceFeatures(sourceData));
        // 追加数据源
        copyLayerOptions.source = { type: 'geojson', data: this.turf.featureCollection(features) };
      }
    }

    // 添加图层到地图Map中
    if (iMapApi) {
      // 判断是否添加图层组
      if (this[_options].layerGroupId) {
        const checkLayer = iMapApi.getLayer(this[_id], this[_options].layerGroupId);
        if (checkLayer) {
          this[_mapLayerGroup] = iMapApi.getLayer(this[_options].layerGroupId);
          this[_mapLayer] = checkLayer;
          console.error(`图层组[${this[_options].layerGroupId}]中图层[${this[_id]}]已存在，无需重复添加图层.`);
        } else {
          this[_mapLayerGroup] = iMapApi.addLayerToGroup(this[_options].layerGroupId, copyLayerOptions, this[_options].beforeId);
          this[_mapLayer] = iMapApi.getLayer(this[_id], this[_options].layerGroupId);
        }
      } else {
        const checkLayer = iMapApi.getLayer(this[_id]);
        if (checkLayer) {
          this[_mapLayer] = checkLayer;
          console.error(`图层[${this[_id]}]已存在，无需重复添加图层.`);
        } else {
          this[_mapLayer] = iMapApi.addLayer(copyLayerOptions, this[_options].beforeId);
        }
      }
    }
  }

  // 设置图层的整体透明度
  // 注意：
  // 1、透明度是根据初始图层样式进行相乘计算而来；
  // 2、如属性值为表达式则忽略
  setOpacity(opacity, paints = []) {
    if (this[_opacity] !== opacity) {
      this[_opacity] = getCheckOpacity(opacity);
    }
    const copyPaint = cloneDeep(this.initLayerOptions.paint);
    paints &&
      paints.map(key => {
        if (isNumeric(this.getPaint(key)) && isNumeric(copyPaint[key])) {
          this.setPaint(key, round(copyPaint[key] * this.opacity, 2));
        }
      });
  }

  /**
   * 移除当前图层
   */
  remove() {
    // 判断是否添加图层组
    if (this[_options].layerGroupId) {
      this.iMapApi.removeLayerToGroup(this[_options].layerGroupId, this[_id]);
    } else {
      this.iMapApi.removeLayer(this[_id]);
    }
    // 清空图层属性
    this[_mapLayer] = null;
    this[_mapLayerGroup] = null;
  }

  /**
   * 获取指定名称的Paint属性
   * @param {String} key 待获取的Paint属性名
   */
  getPaint(key) {
    const map = this.iMapApi.map;
    return map.getPaintProperty(this.id, key);
  }

  /**
   * 设置指定名称的Paint属性
   * @param {String} key 图层的Paint属性名
   * @param {Any} value 图层Paint属性的值
   * @param {Object} options 设置图层Paint属性的参数选项
   */
  setPaint(key, value, options = {}) {
    const map = this.iMapApi.map;
    map.setPaintProperty(this.id, key, value, options);
  }

  /**
   * 获取指定名称的Layout属性
   * @param {String} key 待获取的Layout属性名
   */
  getLayout(key) {
    const map = this.iMapApi.map;
    return map.getLayoutProperty(this.id, key);
  }

  /**
   * 设置指定名称的Layout属性
   * @param {String} key 图层的Layout属性名
   * @param {Any} value 图层Layout属性的值
   * @param {Object} options 设置图层Layout属性的参数选项
   */
  setLayout(key, value, options = {}) {
    const map = this.iMapApi.map;
    map.setLayoutProperty(this.id, key, value, options);
  }

  /**
   * 获取图层的数据过滤器
   */
  getFilter() {
    const map = this.iMapApi.map;
    return map.getFilter(this.id);
  }

  /**
   * 设置图层的数据过滤条件
   * @param {Array} filter 图层数据过滤条件
   * @param {Object} options 设置图层数据过滤器的参数选项
   */
  setFilter(filter = null, options = {}) {
    const map = this.iMapApi.map;
    map.setFilter(this.id, filter, options);
  }

  /**
   * 设置图层的最小与最大层级区间渲染范围
   * @param {Number} minzoom 图层最小层级
   * @param {Number} maxzoom 图层最大层级
   * @param {Boolean} isLayerGroup 是否图层组统一设置
   */
  setZoomRange(minzoom, maxzoom, isLayerGroup = false) {
    // 判断是否整个图层组设置层级区间
    if (isBooleanTrue(isLayerGroup) && this.options.layerGroupId) {
      this.iMapApi && this.iMapApi.setLayerZoomRange(this.options.layerGroupId, minzoom, maxzoom);
    } else {
      this.iMapApi && this.iMapApi.setLayerZoomRange(this.id, minzoom, maxzoom, this.options.layerGroupId);
    }
  }

  /**
   * 获取当前图层的数据Features集合
   */
  getFeatures() {
    // 获取图层的数据源
    const layerSource = this.mapLayer && this.mapLayer.source;
    const source = this.iMapApi.getSource(layerSource);
    // 解析数据集合
    const features = [];
    if (source && source._data) {
      return getSourceFeatures(source._data);
    }
    return features;
  }

  /**
   * 设置当前图层的数据Features集合
   * @param {Array} features 待覆盖的Features数据集合
   */
  setFeatures(features) {
    // 获取图层的数据源
    const layerSource = this.mapLayer && this.mapLayer.source;
    const source = this.iMapApi.getSource(layerSource);
    if (source) {
      const sourceFeatures = getSourceFeatures(features);
      console.log(sourceFeatures);
      source.setData(this.turf.featureCollection(sourceFeatures));
    }
  }

  /**
   * 追加当前图层的数据Features集合
   * @param {Array} features 待添加的Features要素数组集合
   */
  addFeatures(features) {
    // 获取当前图层的数据
    const currentFeatures = this.getFeatures();
    // 待追加的数据
    const appendFeatures = getSourceFeatures(features);
    // 更新数据集合
    this.setFeatures(currentFeatures.concat(appendFeatures));
  }

  /**
   * 获取当前图层的指定Id的Feature要素
   * @param {String} id Feature要素的唯一Id
   */
  getFeatureById(id) {
    if (!id) {
      return null;
    }
    const features = this.getFeatures();
    const feature = find(features, { id });
    return feature || null;
  }

  /**
   * 获取当前图层的指定属性值匹配的Features要素集合
   * @param {String} key 待匹配的Property名
   * @param {Any} value 待匹配的值
   */
  getFeaturesByProperty(key, value) {
    if (!key || !value) {
      return [];
    }
    const features = this.getFeatures();
    const featureCollection = filter(features, f => f.properties[key] === value);
    return featureCollection || [];
  }

  /**
   * 根据屏幕坐标查询当前图层的Features要素集合
   * @param {Point} point
   */
  queryFeaturesByPoint(point, options = {}, isLayerGroup = false) {
    if (!point) {
      return [];
    }

    let resultFeatures = [];
    // 判断是否整个图层组进行查询
    if (isBooleanTrue(isLayerGroup) && this.options.layerGroupId) {
      resultFeatures = this.iMapApi.queryRenderedFeatures(this.options.layerGroupId, point, options);
    } else {
      resultFeatures = this.iMapApi.queryRenderedFeatures(this.id, point, options, this.options.layerGroupId);
    }
    // 获取当前图层的数据集合进行比对转换
    const featureCollection = this.getFeatures();
    const features = [];
    resultFeatures &&
      resultFeatures.map(feature => {
        filter(featureCollection, f => {
          const isGeometry = this.turf.booleanEqual(feature, f);
          if (isGeometry && JSON.stringify(f.properties || {}) === JSON.stringify(feature.properties)) {
            features.push(f);
          }
        });
      });
    return features;
  }

  /**
   * 更新当前图层指定的Feature要素的Properties属性集合
   * @param {Feature} feature 待更新的Feature要素
   * @param {Feature} properties 待更新的Properties集合
   * @param {Boolean} merge 是否采用合并模式
   */
  updateFeatureByProperties(feature, properties = {}, merge = false) {
    const features = this.getFeatures();
    const index = features.indexOf(feature);
    if (index !== -1) {
      if (isBooleanTrue(merge)) {
        features[index].properties = assign({}, features[index].properties, properties);
      } else {
        features[index].properties = properties;
      }
      // 更新数据集合
      this.setFeatures(features);
    }
  }

  /**
   * 更新当前图层指定的Feature要素的Geometry属性空间坐标
   * @param {Feature} feature 待更新的Feature要素
   * @param {Coordinates} coordinates 待更新的空间坐标数据
   */
  updateFeatureByGeometry(feature, coordinates) {
    const features = this.getFeatures();
    const index = features.indexOf(feature);
    if (index !== -1) {
      features[index].geometry.coordinates = coordinates;
      // 更新数据集合
      this.setFeatures(features);
    }
  }

  /**
   * 删除当前图层的指定Feature要素数据
   * @param {Feature} feature 待删除的Feature要素
   */
  removeFeature(feature) {
    const features = this.getFeatures();
    const deleteFeatures = getSourceFeatures(feature);
    const newFeatures = remove(features, f => deleteFeatures.indexOf(f) === -1);
    // 更新数据集合
    this.setFeatures(newFeatures);
  }

  /**
   * 删除当前图层的指定Id的Feature要素数据
   * @param {String} id 待删除的Feature要素唯一Id
   */
  removeFeatureById(id) {
    const ids = isArray(id) ? id : [id];
    ids &&
      ids.map(key => {
        const feature = this.getFeatureById(key);
        feature && this.removeFeature(feature);
      });
  }

  /**
   * 删除当前图层的指定属性值匹配的Features要素集合
   * @param {String} key 待匹配的Property名
   * @param {Any} value 待匹配的值
   */
  removeFeatureByProperty(key, value) {
    const features = this.getFeaturesByProperty(key, value);
    features && this.removeFeature(features);
  }

  /**
   * 清除当前图层的数据集合
   */
  clearFeatures() {
    // 获取图层的数据源
    const layerSource = this.mapLayer && this.mapLayer.source;
    const source = this.iMapApi.getSource(layerSource);
    // 清空数据
    source && source.setData(this.turf.featureCollection([]));
  }

  /**
   * 获取指定Id的Feature要素存储[feature-state]对象
   * @param {String} id Feature要素的唯一Id
   */
  getFeatureState(id) {
    const map = this.iMapApi.map;
    return (
      id &&
      map &&
      map.getFeatureState({
        source: this.mapLayer.source,
        sourceLayer: this.mapLayer.sourceLayer,
        id,
      })
    );
  }

  /**
   * 设置指定Id的Feature要素存储[feature-state]对象
   * @param {String} id Feature要素的唯一Id
   * @param {Object} state 存储Feature要素的[feature-state]对象
   */
  setFeatureState(id, state = {}) {
    const map = this.iMapApi.map;
    id &&
      map &&
      map.setFeatureState(
        {
          source: this.mapLayer.source,
          sourceLayer: this.mapLayer.sourceLayer,
          id,
        },
        state,
      );
  }

  /**
   * 清空所有或删除指定Id的Feature要素存储[feature-state]对象
   * @param {String} id Feature要素的唯一Id，未指定则清空所有Feature要素
   * @param {String} key 指定待删除的[feature-state]对象键名
   */
  removeFeatureState(id = null, key = null) {
    const map = this.iMapApi.map;
    // 判断是否设置Feature要素的Id
    if (!id) {
      map.removeFeatureState({
        source: this.mapLayer.source,
      });
    } else {
      // 判断是否指定具体的待删除[feature-state]键名
      map.removeFeatureState(
        {
          source: this.mapLayer.source,
          sourceLayer: this.mapLayer.sourceLayer,
          id,
        },
        key,
      );
    }
  }

  /**
   * 获取当前图层的Feature数据集的几何矩形范围
   */
  getLayerBounds() {
    const features = this.getFeatures();
    return isNotEmptyArray(features) && this.iMapApi.getFeaturesToBounds(features);
  }

  /**
   * 设置当前图层缩放到最大的合适层级
   */
  setLayerToMaxZoom(options = {}) {
    const features = this.getFeatures();
    return this.iMapApi.boundsToFeatures(features, options);
  }
}

export default BasicLayerClass;

// 验证不透明度是否正确并纠正返回正确的数值
export const getCheckOpacity = function(opacity) {
  let _value = isNumeric(opacity) ? Number(opacity) : 1;
  _value > 1 && (_value = 1);
  _value < 0 && (_value = 0);
  return _value;
};

// 设置图层的Paint透明度属性
export const setLayerPaintOpacity = function(paint, properties, ratio) {
  isString(properties) && (properties = [properties]);
  const copyPaint = cloneDeep(paint);
  properties &&
    properties.map(key => {
      if (copyPaint[key] && isNumeric(copyPaint[key])) {
        const opacity = getCheckOpacity(copyPaint[key]);
        copyPaint[key] = round(opacity * ratio, 2);
      }
    });
  return copyPaint;
};

// 获取图层Source数据源的Feature集合
export const getSourceFeatures = function(data) {
  const features = [];
  if (data && data.type) {
    switch (data.type) {
      case 'Feature':
        features.push(data);
        break;
      case 'FeatureCollection':
        features.push(...data.features);
        break;
    }
  } else if (isNotEmptyArray(data)) {
    features.push(...data);
  }
  return features;
};
