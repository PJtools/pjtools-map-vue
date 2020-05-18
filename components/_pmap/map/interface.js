/**
 * @文件说明: 构建Map地图的“UI交互组件”管理函数方法
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-18 14:51:01
 */

const interfaces = {
  /**
   * 根据地图UI交互组件Id获取组件Component对象
   * @param {String} id 地图交互组件的Id名
   */
  getMapInterface(id) {
    const interfaces = this.vComponent && this.vComponent.$refs.mapInterfaces && this.vComponent.$refs.mapInterfaces.interfaces;
    return interfaces && interfaces[id] ? interfaces[id].child : null;
  },

  /**
   * 添加地图UI交互组件到地图中
   * @param {String} id 地图交互组件的唯一Id名
   * @param {String} type 地图交互组件的组件类型
   * @param {Control} component 地图交互组件参数选项
   */
  addMapInterface(id, type, component = {}) {
    if (id && !this.getMapInterface(id)) {
      component.id = id;
      component.type = type;
      this.vComponent.mapInterfaces.push(component);
    }
  },

  /**
   * 根据地图UI交互组件的唯一Id移除组件
   * @param {String} id 地图交互组件的唯一Id名
   */
  removeMapInterface(id) {
    if (id && this.getMapInterface(id)) {
      const components = this.vComponent.mapInterfaces;
      for (let i = components.length - 1; i >= 0; i--) {
        if (components[i].id === id) {
          this.vComponent.mapInterfaces.splice(i, 1);
          const vmControls = this.vComponent && this.vComponent.$refs.mapInterfaces && this.vComponent.$refs.mapInterfaces.interfaces;
          delete vmControls[id];
          break;
        }
      }
    }
  },
};

export default interfaces;
