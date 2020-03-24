/**
 * @文件说明: 构建Map地图的“数据源”管理函数方法
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-22 12:02:51
 */

const source = {
  /**
   * 获取指定Id名称的图层数据源
   * @param {String} id 数据源Id名称
   */
  getSource(id) {
    return this.map.getSource(id) || null;
  },

  /**
   * 获取所有的图层数据源对象
   */
  getSources() {
    const mapStyle = this.map.getStyle();
    const styleSources = mapStyle.sources || {};
    const sources = {};
    Object.keys(styleSources).map(key => {
      const source = this.getSource(key);
      source && (sources[key] = source);
    });
    return sources;
  },

  /**
   * 获取指定Id名称的数据源所属图层Id集合
   * @param {String} id 数据源Id名称
   */
  getSourceToLayerIds(id) {
    const source = this.getSource(id);
    if (source) {
      return source._layersIds || null;
    }
    return null;
  },

  /**
   * 添加图层数据源到地图Map中
   * @param {String} id 数据源Id名称
   * @param {Object} source 数据源对象
   */
  addSource(id, source) {
    const chkSource = this.getSource(id);
    if (chkSource) {
      return chkSource;
    }
    // 添加图层数据源
    this.map.addSource(id, source);
    // 获取实际数据源
    const currentSource = this.map.getSource(id);
    currentSource._layersIds = [];
    return currentSource;
  },

  /**
   * 删除指定Id的图层数据源
   * @param {String} id 数据源Id名称
   */
  removeSource(id) {
    const source = this.getSource(id);
    if (source) {
      // 判断数据源的所属图层是否已删除
      if (source._layersIds) {
        for (let i = source._layersIds.length - 1; i >= 0; i--) {
          const layerId = source._layersIds[i];
          // 移除已删除的数据源所属图层Id记录
          if (!this.map.getLayer(layerId)) {
            source._layersIds.splice(i, 1);
          }
        }
      }
      // 判断数据源是否已无对应图层关联，则移除数据源
      if (!source._layersIds || !source._layersIds.length) {
        this.map.removeSource(id);
      }
    }
  },
};

export default source;
