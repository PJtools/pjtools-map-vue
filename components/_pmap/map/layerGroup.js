/**
 * @文件说明: 构建Map地图的“图层组”管理函数方法
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-21 14:42:52
 */

import assign from 'lodash/assign';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import { isNotEmptyArray, isBooleanTrue } from '../../_util/methods-util';

const layerGroup = {
  /**
   * 判断指定的图层(组)Id名称检查是否为图层组
   * @param {String} id 待检测的图层组的Id名称
   */
  isLayerGroup(id) {
    const layerGroup = this.getLayer(id);
    return !!(layerGroup && isBooleanTrue(layerGroup.isLayerGroup));
  },

  /**
   * 将MapboxGL Layer图层集合添加到指定的图层组对象，并追加到地图Map中
   * @param {String} id 图层组的Id名称
   * @param {String} layer 图层Id名称
   * @param {String} beforeId 待添加到指定图层(组)Id之前
   */
  addLayerToGroup(id, layer, beforeId = null) {
    const map = this.map;

    // 记录图层数据源的对应图层Id
    const addMapSourcesLayersId = currentLayer => {
      if (!this._mapSourcesLayersId[currentLayer.source]) {
        this._mapSourcesLayersId[currentLayer.source] = [currentLayer.id];
      } else if (this._mapSourcesLayersId[currentLayer.source].indexOf(currentLayer.id) === -1) {
        this._mapSourcesLayersId[currentLayer.source].push(currentLayer.id);
      }
    };
    const groupLayer = assign({}, layer, {
      metadata: assign({}, layer.metadata || {}, { group: id }),
    });
    const layerGroup = this.getLayer(id);
    // 判断是否未创建图层组对象集合
    if (!layerGroup) {
      map.addLayer(groupLayer, beforeId);
      const currentLayer = map.getLayer(groupLayer.id);
      const currentLayersGroup = {
        id,
        isLayerGroup: true,
        layers: [currentLayer],
      };
      // 存储当前图层对象
      this._mapLayers[id] = currentLayersGroup;
      this._mapLayersIds.push({
        layerGroupId: id,
        layersIds: [currentLayer.id],
      });
      // 存储图层的数据源
      addMapSourcesLayersId(currentLayer);
      return this._mapLayers[id];
    } else {
      // 判断待追加的图层是否还未创建到地图Map对象中，则追加到图层组
      if (!this.getLayer(groupLayer.id, id) && !map.getLayer(groupLayer.id)) {
        // 判断指定图层(组)Id之前是否为该图层组的图层Id，否则只能追加图层组最后
        const beforeLayer = this.getLayer(beforeId, id);
        if (beforeLayer) {
          map.addLayer(groupLayer, beforeId);
          const currentLayer = map.getLayer(groupLayer.id);
          // 存储当前图层对象
          const mapLayersIdsItem = find(this._mapLayersIds, { layerGroupId: id });
          const index = mapLayersIdsItem.layersIds.indexOf(beforeId);
          mapLayersIdsItem.layersIds.splice(index, 0, currentLayer.id);
          this._mapLayers[id].layers.splice(index, 0, currentLayer);
          // 存储图层的数据源
          addMapSourcesLayersId(currentLayer);
        } else {
          // 获取图层组的下一个图层，重新计算beforeId
          const layerGroupIndex = findIndex(this._mapLayersIds, { layerGroupId: id });
          const nextLayerId = this._mapLayersIds[layerGroupIndex + 1];
          let newBeforeId = null;
          if (nextLayerId) {
            const nextLayer = this.getLayer(nextLayerId);
            if (this.isLayerGroup(nextLayerId)) {
              newBeforeId = (nextLayer.layers && nextLayer.layers[0]) || null;
            } else {
              newBeforeId = nextLayerId;
            }
          }
          // 添加图层到地图
          map.addLayer(groupLayer, newBeforeId);
          const currentLayer = map.getLayer(groupLayer.id);
          // 存储当前图层对象
          this._mapLayers[id].layers.push(currentLayer);
          const mapLayersIdsItem = find(this._mapLayersIds, { layerGroupId: id });
          mapLayersIdsItem.layersIds.push(currentLayer.id);
          // 存储图层的数据源
          addMapSourcesLayersId(currentLayer);
        }
        return this._mapLayers[id];
      } else {
        console.error(`图层[${layer.id}]已存在，无法追加到图层组对象集合.`);
        return null;
      }
    }
  },

  /**
   * 将MapboxGL Layer图层对象添加到指定的图层组对象，并追加到地图Map中
   * @param {String} id 图层组的Id名称
   * @param {Array} layers 图层数组集合
   * @param {String} beforeId 待添加到指定图层(组)Id之前
   */
  addLayersToGroup(id, layers, beforeId = null) {
    if (!isNotEmptyArray(layers)) {
      console.error('待添加的图层集合不是一个有效的数组对象.');
      return;
    }
    layers.map(layer => {
      this.addLayerToGroup(id, layer, beforeId);
    });
    return this._mapLayers[id];
  },

  /**
   * 获取指定Id的图层组的第一个图层对象
   * @param {String} id 图层组的Id名称
   */
  getGroupFirstLayer(id) {
    if (this.isLayerGroup(id)) {
      const layerGroup = this.getLayer(id);
      if (layerGroup && layerGroup.layers && layerGroup.layers[0]) {
        return layerGroup.layers[0];
      }
    }
    return null;
  },

  /**
   * 获取指定Id的图层组的最后一个图层对象
   * @param {String} id 图层组的Id名称
   */
  getGroupLastLayer(id) {
    if (this.isLayerGroup(id)) {
      const layerGroup = this.getLayer(id);
      if (layerGroup && layerGroup.layers && layerGroup.layers.length) {
        return layerGroup.layers[layerGroup.layers.length - 1];
      }
    }
    return null;
  },
};

export default layerGroup;
