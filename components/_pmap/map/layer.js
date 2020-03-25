/**
 * @文件说明: 构建Map地图的“图层”管理函数方法
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-21 14:41:01
 */

import { isNotEmptyArray, isArray, isBooleanTrue, isBooleanFlase, isNumeric } from '../../_util/methods-util';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import remove from 'lodash/remove';

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

    // 特殊处理矢量瓦片VTS服务图层
    if (layer.type && layer.type === 'VTS') {
      return this.addLayerToGroup(layer.id, layer, beforeId);
    } else {
      // 添加图层的数据源
      let currentSource = null;
      if (layer.source) {
        if (typeof layer.source !== 'string') {
          const sourceId = layer.source && layer.source.id ? layer.source.id : layer.id;
          currentSource = this.addSource(sourceId, layer.source);
          layer.source = currentSource.id;
        } else {
          currentSource = this.getSource(layer.source);
        }
      }
      // 添加到地图Map中
      if (beforeId) {
        this.map.addLayer(layer, beforeId);
      } else {
        this.map.addLayer(layer);
      }
      const currentLayer = this.map.getLayer(layer.id);
      currentLayer.isLayerGroup = false;
      // 存储当前图层对象
      this._mapLayers[layer.id] = currentLayer;
      this._mapLayersIds.push(layer.id);
      // 存储数据源的所属图层Id
      if (currentSource) {
        !currentSource._layersIds && (currentSource._layersIds = []);
        currentSource._layersIds.indexOf(layer.id) === -1 && currentSource._layersIds.push(layer.id);
      }
      return currentLayer;
    }
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

  /**
   * 删除指定Id名称的图层对象
   * @param {String} id 图层Id名称
   */
  removeLayer(id) {
    const layer = this.getLayer(id);
    if (layer) {
      // 移除图层和数据源
      const deleteLayer = currentLayer => {
        this.map.removeLayer(currentLayer.id);
        // 移除图层数据源
        this.removeSource(currentLayer.source);
      };

      // 判断是否为图层组对象
      if (this.isLayerGroup(id)) {
        layer.layers.map(currentLayer => {
          deleteLayer(currentLayer);
        });
        // 移除当前图层对象的缓存
        delete this._mapLayers[id];
        remove(this._mapLayersIds, item => !!(item.layerGroupId && item.layerGroupId === id));
      } else {
        deleteLayer(layer);
        // 移除当前图层对象的缓存
        delete this._mapLayers[id];
        this._mapLayersIds.splice(this._mapLayersIds.indexOf(id), 1);
      }
    } else {
      console.error(`图层Id：[${id}]对象不存在或图层组中图层请使用[removeLayerToGroup]函数方法.`);
    }
  },

  /**
   * 删除指定Id数组集合的图层对象
   * @param {Array} layersId 图层Id数组集合
   */
  removeLayers(layersId) {
    if (isArray(layersId)) {
      for (let i = layersId.length - 1; i >= 0; i--) {
        this.removeLayer(layersId[i]);
      }
    } else {
      console.log(`图层Id集合必须是一个'String[]'字符型数组格式.`);
    }
  },

  /**
   * 移动指定Id的图层(组)内到的beforeId图层(组)之前
   * @param {String} id 图层(组)的Id名称
   * @param {String} beforeId 待移动到指定图层Id之前
   */
  moveLayer(id, beforeId) {
    const layer = this.getLayer(id);
    if (!layer) {
      return;
    }

    const isLayerGroup = this.isLayerGroup(id);
    const layerIndex = isLayerGroup ? findIndex(this._mapLayersIds, { layerGroupId: id }) : this._mapLayersIds.indexOf(id);
    // 判断是否指定移动前置图层Id，如果无指定则移动地图图层的最后
    if (!beforeId) {
      const lastIndex = this._mapLayersIds.length - 1;
      // 移动图层顺序
      if (isLayerGroup) {
        layer.layers.map(layerItem => {
          this.map.moveLayer(layerItem.id);
        });
      } else {
        this.map.moveLayer(id);
      }
      // 调整图层对象的缓存的顺序
      this._mapLayersIds.splice(lastIndex + 1, 0, this._mapLayersIds[layerIndex]);
      this._mapLayersIds.splice(layerIndex, 1);
    } else {
      const isBeforeLayerGroup = this.isLayerGroup(beforeId);
      let newBeforeId = null;
      let beforeIndex = null;
      // beforeId判断是否为图层组，则重算图层组的图层Id
      if (isBeforeLayerGroup) {
        const firstLayer = this.getGroupFirstLayer(beforeId);
        newBeforeId = firstLayer.id;
        beforeIndex = findIndex(this._mapLayersIds, { layerGroupId: beforeId });
      } else {
        newBeforeId = beforeId;
        beforeIndex = this._mapLayersIds.indexOf(beforeId);
      }
      // 移动图层顺序
      if (isLayerGroup) {
        layer.layers.map(layerItem => {
          this.map.moveLayer(layerItem.id, newBeforeId);
        });
      } else {
        this.map.moveLayer(id, newBeforeId);
      }
      // 调整图层对象的缓存的顺序
      this._mapLayersIds.splice(beforeIndex, 0, this._mapLayersIds[layerIndex]);
      this._mapLayersIds.splice(layerIndex < beforeIndex ? layerIndex : layerIndex + 1, 1);
    }
  },

  /**
   * 向上移动一层指定Id的图层(组)
   * @param {String} id 图层(组)的Id名称
   */
  moveUpLayer(id) {
    const layer = this.getLayer(id);
    if (!layer) {
      return;
    }
    const isLayerGroup = this.isLayerGroup(id);
    // 计算当前图层的索引位置
    let layerIndex = null;
    if (isLayerGroup) {
      layerIndex = findIndex(this._mapLayersIds, { layerGroupId: id });
    } else {
      layerIndex = this._mapLayersIds.indexOf(id);
    }
    // 判断是否已经是顶级层级
    if (layerIndex > 0) {
      const prevlayerItem = this._mapLayersIds[layerIndex - 1];
      const beforeId = prevlayerItem.layerGroupId || prevlayerItem;
      // 向上移动一层
      this.moveLayer(id, beforeId);
    }
  },

  /**
   * 向下移动一层指定Id的图层(组)
   * @param {String} id 图层(组)的Id名称
   */
  moveDownLayer(id) {
    const layer = this.getLayer(id);
    if (!layer) {
      return;
    }
    const nextlayerId = this.getNextLayerId(id);
    // 判断是否有下一个，则表示当前图层(组)不在最底部
    if (nextlayerId) {
      const beforeId = this.getNextLayerId(nextlayerId);
      // 向下移动一层
      this.moveLayer(id, beforeId);
    }
  },

  /**
   * 获取指定Id的图层(组)的下一个图层对象Id名称
   * @param {String} id 图层Id名称
   */
  getNextLayerId(id) {
    let nextLayerItem = null;
    // 判断是否为图层组
    if (this.isLayerGroup(id)) {
      const layerGroupIndex = findIndex(this._mapLayersIds, { layerGroupId: id });
      nextLayerItem = this._mapLayersIds[layerGroupIndex + 1] || null;
    } else {
      const layerIndex = this._mapLayersIds.indexOf(id);
      if (layerIndex !== -1) {
        nextLayerItem = this._mapLayersIds[layerIndex + 1] || null;
      }
    }

    return nextLayerItem ? nextLayerItem.layerGroupId || nextLayerItem : null;
  },

  /**
   * 设置指定Id的图层(组)的显示/隐藏的状态
   * @param {String} id 图层(组)Id名称
   * @param {Boolean} visible 图层显隐状态
   * @param {String} layerGroupId 选填项，所属图层组Id名称
   */
  setLayerVisibility(id, visible = true, layerGroupId = null) {
    const layers = [];
    // 判断是否指定图层组对象，则只获取图层组内的图层对象
    if (layerGroupId) {
      const layer = this.getLayer(id, layerGroupId);
      layer && layers.push(layer);
    } else {
      const layer = this.getLayer(id);
      if (layer) {
        if (this.isLayerGroup(id)) {
          layer.layers.map(item => {
            layers.push(item);
          });
        } else {
          layers.push(layer);
        }
      }
    }
    // 设置图层的显隐状态
    const visibleValue = isBooleanFlase(visible) ? 'none' : 'visible';
    layers &&
      layers.length &&
      layers.map(layer => {
        // 判断是否为VTS矢量瓦片服务图层，且服务加载的默认状态为隐藏，则跳过不设置
        if (!(visibleValue === 'visible' && layer.metadata && layer.metadata.type === 'VTS' && layer.metadata.visibility === 'none')) {
          // 防止图层强制刷新渲染
          const currentLayerVisibility = this.map.getLayoutProperty(layer.id, 'visibility') || 'visible';
          if (currentLayerVisibility !== visibleValue) {
            this.map.setLayoutProperty(layer.id, 'visibility', visibleValue);
          }
        }
      });
  },

  /**
   * 设置指定Id的栅格类型图层(组)的透明度
   * @param {String} id 图层(组)Id名称
   * @param {Number} opacity 图层的不透明度，范围：0-1
   * @param {String} layerGroupId 选填项，所属图层组Id名称
   */
  setRasterLayerOpacity(id, opacity = 1, layerGroupId = null) {
    opacity = isNumeric(opacity) ? Number(opacity) : 1;
    if (opacity > 1) {
      opacity = 1;
    } else if (opacity < 0) {
      opacity = 0;
    }

    const layers = [];
    // 判断是否指定图层组对象，则只获取图层组内的图层对象
    if (layerGroupId) {
      const layer = this.getLayer(id, layerGroupId);
      layer && layer.type === 'raster' && layers.push(layer);
    } else {
      const layer = this.getLayer(id);
      if (layer) {
        if (this.isLayerGroup(id)) {
          layer.layers.map(item => {
            item.type === 'raster' && layers.push(item);
          });
        } else {
          layer.type === 'raster' && layers.push(layer);
        }
      }
    }

    layers &&
      layers.length &&
      layers.map(layer => {
        // 防止图层强制刷新渲染
        const currentOpacity = this.map.getPaintProperty(layer.id, 'raster-opacity') || 1;
        if (currentOpacity !== opacity) {
          this.map.setPaintProperty(layer.id, 'raster-opacity', opacity);
        }
      });
  },
};

export default layer;
