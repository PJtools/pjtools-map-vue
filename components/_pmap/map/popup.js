/**
 * @文件说明: 构建Map地图的“Popup弹框”管理函数方法
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-15 11:39:34
 */

const popup = {
  /**
   * 创建一个Popup气泡弹窗实例并添加到地图Map中
   * @param {String} id 标注的唯一Id名
   * @param {Array} coordinates 定位的坐标点
   * @param {Object} options Popup的参数选项
   */
  addPopup(id, coordinates, options = {}) {
    return this.Popup.add(id, coordinates, options);
  },
};

export default popup;
