/**
 * @文件说明: Map.Interactions - 地图交互组件
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-18 13:56:44
 */

import { PropTypes } from '../../_util/antdv';
import { isNotEmptyArray } from '../../_util/methods-util';
import MouseTooltip from './mouse-tooltip';

const Interactions = {
  name: 'PjMap.Interactions',
  props: {
    data: PropTypes.array,
  },
  data() {
    return {
      interactions: {},
    };
  },
  inject: {
    mapProvider: { default: () => {} },
  },
  methods: {
    // 动态渲染地图交互式组件
    renderInteractionsComponents() {
      const { data } = this;
      return (
        data &&
        isNotEmptyArray(data) &&
        data.map((item, idx) => {
          const attrs = { ...item };
          !attrs.props && (attrs.props = {});
          attrs.props.key = item.id || String(idx);
          attrs.props.id = attrs.props.key;

          let component = null;
          switch (item.type) {
            case 'MouseTooltip': {
              component = <MouseTooltip {...attrs} />;
              break;
            }
          }
          this.interactions[item.id] = component;
          return component;
        })
      );
    },
  },
  render() {
    return <section data-type="interaction">{this.renderInteractionsComponents()}</section>;
  },
};

export default Interactions;
