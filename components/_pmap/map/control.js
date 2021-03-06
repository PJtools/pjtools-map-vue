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
    const controls = this.component && this.component.$refs.mapControls && this.component.$refs.mapControls.controls;
    return controls && controls[id] ? controls[id].child : null;
  },

  /**
   * 添加内置地图控件到地图中
   * @param {String} id 地图控件的Id名
   * @param {Control} control 地图控件对象
   */
  addControl(id, control = {}) {
    const controls = this.component.mapControls;
    if (id && controls && !this.getMapControl(id)) {
      control.id = id;
      controls.push(control);
    }
  },

  /**
   * 根据地图控件Id移除地图控件组件
   * @param {String} id 地图控件的Id名
   */
  removeControl(id) {
    const controls = this.component.mapControls;
    if (id && controls && this.getMapControl(id)) {
      for (let i = controls.length - 1; i >= 0; i--) {
        if (controls[i].id === id) {
          controls.splice(i, 1);
          const vmControls = this.component && this.component.$refs.mapControls && this.component.$refs.mapControls.controls;
          delete vmControls[id];
          break;
        }
      }
    }
  },
};

export default control;
