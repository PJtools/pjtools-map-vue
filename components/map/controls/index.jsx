/**
 * @文件说明: Map.Controls - 地图控件
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-31 12:49:01
 */

import { PropTypes } from '../../_util/antdv';
import Attribution from './attribution';

// 地图控件的类型枚举名
export const mapControlsTypeKeys = ['Attribution'];
// 地图控件的位置枚举
export const mapControlsPosition = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

const Controls = {
  name: 'PjMap.Controls',
  props: {
    dataList: PropTypes.array,
  },
  components: {
    Attribution: () => resolve => require(['./attribution'], resolve),
  },
  methods: {
    // 根据控件类型渲染地图控件组件
    renderControlsComponent(item, index) {
      const props = {
        key: item.id || String(index),
        id: item.id,
        ...(item.options || {}),
      };
      item.position && (props.position = item.position);
      item.offset && (props.offset = item.offset);

      switch (item.type) {
        case 'Attribution':
          return <Attribution {...{ props }} />;
      }
    },
  },
  render() {
    return (
      <section data-type="control">
        {this.dataList && this.dataList.length ? this.dataList.map((item, idx) => this.renderControlsComponent(item, idx)) : null}
      </section>
    );
  },
};

export default Controls;
