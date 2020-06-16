/**
 * @文件说明: 构建Map地图的“Popup弹框”管理函数方法
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-15 11:39:34
 */

const popup = {
  /**
   * 创建一个Popup气泡弹窗实例并添加到地图Map中
   * @param {String} id Popup的唯一Id名
   * @param {Array} coordinates Popup定位的坐标点
   * @param {Object} options Popup的参数选项
   */
  addPopup(id, coordinates, options = {}) {
    return this.Popup.add(id, coordinates, options);
  },

  /**
   * 根据唯一Id名称获取地图Popup实例
   * @param {String} id Popup的唯一Id名
   */
  getPopup(id) {
    return this.Popup.get(id);
  },

  /**
   * 获取所有的地图Popup实例
   */
  getAllPopups() {
    return this.Popup.popups || [];
  },

  /**
   * 删除指定Id的Popup实例对象
   * @param {String} id Popup的唯一Id名
   */
  removePopup(id) {
    this.Popup.remove(id);
  },

  /**
   * 删除所有的Popup实例对象
   */
  removeAllPopups() {
    this.Popup.removeAll();
  },
};

export default popup;
