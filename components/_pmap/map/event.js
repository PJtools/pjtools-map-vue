/**
 * @文件说明: 构建Map地图的“事件”管理函数方法
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-04-01 16:21:01
 */

const event = {
  /**
   * 绑定地图Map或矢量图层（组）的交互事件
   * @param {String} id 标识事件的唯一Id
   * @param {String} type 地图事件的类型名
   * @param {Function} listener 待绑定事件的函数
   * @param {String} layerId 图层Id名，即指定则绑定图层事件
   * @param {String} layerGroupId 图层组Id名，即指定则找寻图层组内的图层
   */
  on(id, type, listener, layerId = null, layerGroupId = null) {
    if (!id) {
      console.error('地图Map绑定事情必须指定唯一[id]标识名.');
      return;
    }
    // 判断是否绑定事件为图层
    let event = {};
    if (layerId) {
      const layer = this.getLayer(layerId, layerGroupId);
      if (!layer) {
        console.log(`待绑定事件的图层[${layerId}]不存在，请检查[layerId]是否正确或未指定图层组[layerGroupId].`);
        return;
      }
      this.map.on(type, layerId, listener);
      // 缓存图层事件Id标识
      !layer.eventIds && (layer.eventIds = []);
      layer.eventIds.push(id);
      event.layerId = layerId;
      event.layerGroupId = layerGroupId;
    } else {
      this.map.on(type, listener);
    }
    // 缓存地图的绑定事件
    event.type = type;
    event.listener = listener;
    this._mapEvents[id] = event;
  },

  /**
   * 绑定仅只执行触发一次的地图Map或矢量图层（组）交互事件
   * @param {String} type 地图事件的类型名
   * @param {Function} listener 待绑定事件的函数
   * @param {String} layerId 图层Id名，即指定则绑定图层事件
   * @param {String} layerGroupId 图层组Id名，即指定则找寻图层组内的图层
   */
  once(type, listener, layerId = null, layerGroupId = null) {
    if (layerId) {
      const layer = this.getLayer(layerId, layerGroupId);
      if (!layer) {
        console.log(`待绑定事件的图层[${layerId}]不存在，请检查[layerId]是否正确或未指定图层组[layerGroupId].`);
        return;
      }
      this.map.once(type, layerId, listener);
    } else {
      this.map.once(type, listener);
    }
  },

  /**
   * 移除指定Id的地图Map或矢量图层（组）的绑定事件
   * @param {String} id 标识事件的唯一Id
   */
  off(id) {
    if (!id) {
      return;
    }
    const ids = typeof id === 'string' ? [id] : Array.isArray(id) ? id : [];
    // 批量删除绑定的事件
    ids &&
      ids.length &&
      ids.map(key => {
        const event = this._mapEvents[key];
        if (event) {
          // 判断是否绑定事件为图层对象
          if (event.layerId) {
            this.map.off(event.type, event.layerId, event.listener);
            const layer = this.getLayer(event.layerId, event.layerGroupId);
            if (layer) {
              const index = layer.eventIds.indexOf(key);
              layer.eventIds.splice(index, 1);
              !layer.eventIds.length && delete layer.eventIds;
            }
          } else {
            this.map.off(event.type, event.listener);
          }
          delete this._mapEvents[key];
        }
      });
  },
};

export default event;
