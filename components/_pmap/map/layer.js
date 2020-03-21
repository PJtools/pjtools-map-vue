/**
 * @文件说明: 构建Map地图的“图层”管理函数方法
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-21 14:41:01
 */

import { isNotEmptyArray, isBooleanTrue } from '../../_util/methods-util';
import find from 'lodash/find';

const layer = {
  /**
   * 获取原生Mapbox GL的所有图层对象
   */
  getMapboxLayers() {
    const mapStyle = this.map.getStyle();
    return (mapStyle && mapStyle.layers) || [];
  },

  /**
   * 获取指定Id的图层(组)的对象
   * @param {String} id 图层Id名称
   * @param {String} layerGroupId 选填项，所属图层组Id名称
   */
  getLayer(id, layerGroupId = null) {
    // 判断是否有图层组Id
    if (layerGroupId) {
      const layersGroup = this._mapLayers[layerGroupId];
      // 判断是否有图层组的图层数组集合对象
      if (layersGroup && isBooleanTrue(layersGroup.isLayerGroup) && isNotEmptyArray(layersGroup.layers)) {
        // 在图层组的数组图层集合中过滤指定Id的图层对象
        const layer = find(layersGroup.layers, { id });
        if (layer) {
          return layer;
        }
      }
    } else {
      if (this._mapLayers[id]) {
        return this._mapLayers[id];
      }
    }
    return null;
  },

  /**
   * 添加MapboxGL Layer图层对象到地图Map中
   * @param {Layer} layer 待添加的MapboxGL的Layer图层对象
   * @param {String} beforeId 待添加到指定图层(组)Id之前
   */
  addLayer(layer, beforeId = null) {
    if (!layer.id || this.getLayer(layer.id)) {
      !layer.id && console.error('图层Layer对象缺少[id]必须设定属性.');
      return;
    }
    // 添加到地图Map中
    this.map.addLayer(layer, beforeId);
    const currentLayer = this.map.getLayer(layer.id);
    currentLayer.isLayerGroup = false;
    // 存储当前图层对象
    this._mapLayers[layer.id] = currentLayer;
    this._mapLayersIds.push(layer.id);
    // 存储图层的数据源
    if (!this._mapSourcesLayersId[layer.source]) {
      this._mapSourcesLayersId[layer.source] = [layer.id];
    } else if (this._mapSourcesLayersId[layer.source].indexOf(layer.id) === -1) {
      this._mapSourcesLayersId[layer.source].push(layer.id);
    }
    return currentLayer;
  },

  /**
   * 添加MapboxGL Layer图层集合到地图Map中
   * @param {Array} layers 待添加的MapboxGL的Layer图层的数组集合
   * @param {String} beforeId 待添加到指定图层(组)Id之前
   */
  addLayers(layers, beforeId = null) {
    if (!isNotEmptyArray(layers)) {
      console.error('待添加的图层集合不是一个有效的数组对象.');
      return;
    }
    return layers.map(layer => this.addLayer(layer, beforeId));
  },
};

export default layer;
