/**
 * @文件说明: 构建Map地图的“Marker标注”管理函数方法
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-11 16:52:53
 */

const marker = {
  /**
   * 创建一个Marker标注实例并添加到地图Map中
   * @param {String} id 标注的唯一Id名
   * @param {Array} coordinates 标注的坐标点
   * @param {Object} options 标注的参数选项
   */
  addMarker(id, coordinates, options = {}) {
    return this.Marker.add(id, coordinates, options);
  },

  /**
   * 根据唯一Id名称获取地图Marker实例
   * @param {String} id 标注的唯一Id名
   */
  getMarker(id) {
    return this.Marker.get(id);
  },

  /**
   * 获取所有的地图Marker实例
   */
  getAllMarkers() {
    return this.Marker.markers || [];
  },

  /**
   * 获取指定Id分组下所有的地图Marker实例集合
   * @param {String} groupId 分组的唯一Id名
   */
  getMarkersByGroup(groupId) {
    return this.Marker.getGroup(groupId) || [];
  },

  /**
   * 将指定Id的Marker标注添加到分组队列中
   * @param {String} id 标注的唯一Id名
   * @param {String} groupId 分组的唯一Id名
   */
  addMarkerToGroup(id, groupId) {
    this.Marker.addMarkerToGroup(id, groupId);
  },

  /**
   * 将指定Id的Marker标注从分组队列中移除（注意：不会删除Marker对象）
   * @param {String} id 标注的唯一Id名
   * @param {String} groupId 分组的唯一Id名
   */
  removeMarkerToGroup(id, groupId) {
    this.Marker.removeMarkerToGroup(id, groupId);
  },

  /**
   * 删除指定Id的Marker标注实例对象
   * @param {String} id 标注的唯一Id名
   */
  removeMarker(id) {
    this.Marker.remove(id);
  },

  /**
   * 删除指定Id分组的所有Marker标注实例对象
   * @param {String} groupId 分组的唯一Id名
   */
  removeMarkersGroup(groupId) {
    this.Marker.removeGroup(groupId);
  },

  /**
   * 删除所有的Marker标注实例对象
   */
  removeAllMarkers() {
    this.Marker.removeAll();
  },
};

export default marker;
