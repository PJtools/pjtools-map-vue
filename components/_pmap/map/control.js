/**
 * @文件说明: 构建Map地图的“控件”管理函数方法
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-04-01 14:24:34
 */

const control = {
  /**
   * 根据地图控件Id获取控件对象
   * @param {String} id 地图控件的Id名
   */
  getMapControl(id) {
    const controls = this.vComponent && this.vComponent.$refs.mapControls && this.vComponent.$refs.mapControls.controls;
    return controls && controls[id] ? controls[id].child : null;
  },
};

export default control;
