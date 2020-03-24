/**
 * @文件说明: 构建Map地图的“图层组”管理函数方法
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-21 14:42:52
 */

import assign from 'lodash/assign';
import find from 'lodash/find';
import remove from 'lodash/remove';
import { isNotEmptyArray, isArray, isBooleanTrue } from '../../_util/methods-util';

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
   * @param {String} beforeId 待添加到指定图层Id之前
   */
  addLayerToGroup(id, layer, beforeId = null) {
    const map = this.map;

    // 添加图层
    const addMapLayer = (currentLayer, currentBeforeId) => {
      // 添加数据源
      let currentSource = null;
      if (currentLayer.source) {
        if (typeof currentLayer.source !== 'string') {
          const currentSourceId = currentLayer.source && currentLayer.source.id ? currentLayer.source.id : currentLayer.id;
          currentSource = this.addSource(currentSourceId, currentLayer.source);
          currentLayer.source = currentSource.id;
        } else {
          currentSource = this.getSource(currentLayer.source);
        }
      }
      // 添加图层
      if (currentBeforeId) {
        map.addLayer(currentLayer, currentBeforeId);
      } else {
        map.addLayer(currentLayer);
      }
      if (currentSource) {
        // 存储数据源的所属图层Id
        !currentSource._layersIds && (currentSource._layersIds = []);
        currentSource._layersIds.indexOf(currentLayer.id) === -1 && currentSource._layersIds.push(currentLayer.id);
      }
      return map.getLayer(currentLayer.id);
    };

    const groupLayer = assign({}, layer, {
      metadata: assign({}, layer.metadata || {}, { group: id }),
    });
    const layerGroup = this.getLayer(id);
    // 判断是否未创建图层组对象集合
    if (!layerGroup) {
      const currentLayer = addMapLayer(groupLayer, beforeId);
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
      return this._mapLayers[id];
    } else {
      // 判断待追加的图层是否还未创建到地图Map对象中，则追加到图层组
      if (!this.getLayer(groupLayer.id, id) && !map.getLayer(groupLayer.id)) {
        // 判断指定图层(组)Id之前是否为该图层组的图层Id，否则只能追加图层组最后
        const beforeLayer = this.getLayer(beforeId, id);
        if (beforeLayer) {
          const currentLayer = addMapLayer(groupLayer, beforeId);
          // 存储当前图层对象
          const mapLayersIdsItem = find(this._mapLayersIds, { layerGroupId: id });
          const index = mapLayersIdsItem.layersIds.indexOf(beforeId);
          mapLayersIdsItem.layersIds.splice(index, 0, currentLayer.id);
          this._mapLayers[id].layers.splice(index, 0, currentLayer);
        } else {
          // 获取图层组的下一个图层，重新计算beforeId
          const newBeforeId = this.getNextLayerId(id);
          // 添加图层到地图
          const currentLayer = addMapLayer(groupLayer, newBeforeId);
          // 存储当前图层对象
          this._mapLayers[id].layers.push(currentLayer);
          const mapLayersIdsItem = find(this._mapLayersIds, { layerGroupId: id });
          mapLayersIdsItem.layersIds.push(currentLayer.id);
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
   * @param {String} beforeId 待添加到指定图层Id之前
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
   * 移除图层组内指定Id的图层对象
   * @param {String} id 图层组的Id名称
   * @param {String} layerId 图层Id名称
   */
  removeLayerToGroup(id, layerId) {
    if (this.isLayerGroup(id)) {
      const layer = this.getLayer(layerId, id);
      if (layer) {
        // 移除图层和数据源
        this.map.removeLayer(layer.id);
        this.removeSource(layer.source);
        // 移除图层组中的图层对象的缓存
        this._mapLayers[id].layers.splice(this._mapLayers[id].layers.indexOf(layerId), 1);
        if (!this._mapLayers[id].layers.length) {
          delete this._mapLayers[id];
        }
        const mapLayersIdsItem = find(this._mapLayersIds, { layerGroupId: id });
        mapLayersIdsItem.layersIds.splice(mapLayersIdsItem.layersIds.indexOf(layerId), 1);
        if (!mapLayersIdsItem.layersIds.length) {
          remove(this._mapLayersIds, item => !!(item.layerGroupId && item.layerGroupId === id));
        }
      }
    } else {
      console.error(`图层组Id：[${id}]对象不存在或图层对象请使用[removeLayer]函数方法.`);
    }
  },

  /**
   * 移除图层组内指定Id数组集合的图层对象
   * @param {String} id 图层组的Id名称
   * @param {Array} layersId 图层Id数组集合
   */
  removeLayersToGroup(id, layersId) {
    if (isArray(layersId)) {
      for (let i = layersId.length - 1; i >= 0; i--) {
        this.removeLayerToGroup(id, layersId[i]);
      }
    } else {
      console.log(`图层Id集合必须是一个'String[]'字符型数组格式.`);
    }
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

  /**
   * 在图层组内移动指定Id的图层到指定beforeId图层之前
   * @param {String} id 图层组的Id名称
   * @param {String} layerId 图层Id名称
   * @param {String} beforeId 待移动到指定图层Id之前
   */
  moveLayerToGroup(id, layerId, beforeId) {
    // 判断是否指定移动前置图层Id，如果无指定则移动到图层组的最底部
    if (!beforeId) {
      const mapLayersIdsItem = find(this._mapLayersIds, { layerGroupId: id });
      const layerIndex = mapLayersIdsItem.layersIds.indexOf(layerId);
      const lastIndex = mapLayersIdsItem.layersIds.length - 1;
      // 查询该图层组的下一个图层Id
      const newBeforeId = this.getNextLayerId(id);
      // 移动图层顺序
      if (newBeforeId) {
        this.map.moveLayer(layerId, newBeforeId);
      } else {
        this.map.moveLayer(layerId);
      }
      // 调整图层组中的图层对象的缓存的顺序
      this._mapLayers[id].layers.splice(lastIndex + 1, 0, this._mapLayers[id].layers[layerIndex]);
      mapLayersIdsItem.layersIds.splice(lastIndex + 1, 0, mapLayersIdsItem.layersIds[layerIndex]);
      this._mapLayers[id].layers.splice(layerIndex, 1);
      mapLayersIdsItem.layersIds.splice(layerIndex, 1);
    } else {
      const beforeLayer = this.getLayer(beforeId, id);
      if (beforeLayer) {
        // 判断是否指定图层待移动图层是否同一个，则直接跳过
        if (layerId !== beforeId) {
          const mapLayersIdsItem = find(this._mapLayersIds, { layerGroupId: id });
          const beforeIndex = mapLayersIdsItem.layersIds.indexOf(beforeId);
          const layerIndex = mapLayersIdsItem.layersIds.indexOf(layerId);
          // 移动图层顺序
          this.map.moveLayer(layerId, beforeId);
          // 调整图层组中的图层对象的缓存的顺序
          this._mapLayers[id].layers.splice(beforeIndex, 0, this._mapLayers[id].layers[layerIndex]);
          mapLayersIdsItem.layersIds.splice(beforeIndex, 0, mapLayersIdsItem.layersIds[layerIndex]);
          this._mapLayers[id].layers.splice(layerIndex < beforeIndex ? layerIndex : layerIndex + 1, 1);
          mapLayersIdsItem.layersIds.splice(layerIndex < beforeIndex ? layerIndex : layerIndex + 1, 1);
        }
      } else {
        console.error(`待移动到指定的图层beforeId：[${beforeId}]不是图层组内的图层.`);
      }
    }
  },

  /**
   * 在图层组内向上移动一层指定Id的图层
   * @param {String} id 图层组的Id名称
   * @param {String} layerId 图层Id名称
   */
  moveUpLayerToGroup(id, layerId) {
    const layer = this.getLayer(layerId, id);
    if (layer) {
      const firstLayer = this.getGroupFirstLayer(id);
      // 判断当前图层是否不是组内顶级图层
      if (firstLayer.id !== layerId) {
        const mapLayersIdsItem = find(this._mapLayersIds, { layerGroupId: id });
        const layerIndex = mapLayersIdsItem.layersIds.indexOf(layerId);
        const beforeLayer = this._mapLayers[id].layers[layerIndex - 1];
        this.moveLayerToGroup(id, layerId, beforeLayer.id);
      }
    } else {
      console.error(`待向上移动的图层id：[${layerId}]不是图层组内的图层.`);
    }
  },

  /**
   * 在图层组内向下移动一层指定Id的图层
   * @param {String} id 图层组的Id名称
   * @param {String} layerId 图层Id名称
   */
  moveDownLayerToGroup(id, layerId) {
    const layer = this.getLayer(layerId, id);
    if (layer) {
      const lastLayer = this.getGroupLastLayer(id);
      // 判断当前图层是否不是组内顶级图层
      if (lastLayer.id !== layerId) {
        const mapLayersIdsItem = find(this._mapLayersIds, { layerGroupId: id });
        const layerIndex = mapLayersIdsItem.layersIds.indexOf(layerId);
        const beforeLayer = this._mapLayers[id].layers[layerIndex + 2] || null;
        this.moveLayerToGroup(id, layerId, beforeLayer ? beforeLayer.id : null);
      }
    } else {
      console.error(`待向下移动的图层id：[${layerId}]不是图层组内的图层.`);
    }
  },
};

export default layerGroup;
