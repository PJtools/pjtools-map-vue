/**
 * @文件说明: Draw.Modes.Select 绘制“选取”模式
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-28 17:15:30
 */

const SelectMode = {};

// Mode模式的注册 - 激活入口
SelectMode.onSetup = function(options = {}) {
  console.log('select mode', options);
  const state = {
    // 初始选中的要素Id集合
    initiallySelectedFeatureIds: options.featureIds || [],
  };

  // 获取初始待选中的要素Id
  const selectedFeatureIds = state.initiallySelectedFeatureIds.filter(id => {
    const feature = this.getFeature(id);
    return feature !== undefined && feature !== null;
  });
  // 设置要素选中状态
  selectedFeatureIds && selectedFeatureIds.length && this.setSelected(selectedFeatureIds);

  return state;
};

// 触发已绘制的所有Feature矢量要素对象进行显示渲染
SelectMode.toDisplayFeatures = function(state, geojson, display) {
  display(geojson);
};

// Mode模式 - 取消释放
SelectMode.onStop = function(state) {};

export default SelectMode;
