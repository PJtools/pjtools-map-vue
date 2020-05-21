/**
 * @文件说明: 构建Map地图的“交互组件”管理函数方法
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-18 14:51:01
 */

const interaction = {
  /**
   * 根据地图交互组件Id获取组件Component对象
   * @param {String} id 地图交互组件的Id名
   */
  getUserInteraction(id) {
    const interactions = this.component && this.component.$refs.mapInteractions && this.component.$refs.mapInteractions.interactions;
    return interactions && interactions[id] ? interactions[id].child : null;
  },

  /**
   * 添加地图交互组件到地图中
   * @param {String} id 地图交互组件的唯一Id名
   * @param {String} type 地图交互组件的组件类型
   * @param {Control} component 地图交互组件参数选项
   */
  addUserInteraction(id, type, component = {}) {
    const components = this.component && this.component.mapInteractions;
    if (id && components && !this.getUserInteraction(id)) {
      component.id = id;
      component.type = type;
      components.push(component);
    }
  },

  /**
   * 根据地图交互组件的唯一Id移除组件
   * @param {String} id 地图交互组件的唯一Id名
   */
  removeUserInteraction(id) {
    const components = this.component.mapInteractions;
    if (id && components && this.getUserInteraction(id)) {
      for (let i = components.length - 1; i >= 0; i--) {
        if (components[i].id === id) {
          components.splice(i, 1);
          const vmControls = this.component && this.component.$refs.mapInteractions && this.component.$refs.mapInteractions.interactions;
          delete vmControls[id];
          break;
        }
      }
    }
  },
};

export default interaction;
