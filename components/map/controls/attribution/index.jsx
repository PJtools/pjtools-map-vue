/**
 * @文件说明: Controls.Attribution - (属性/署名)信息控件
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-31 12:42:04
 */

import { filterEmpty, initDefaultProps, PropTypes } from '../../../_util/antdv';
import baseProps from '../baseProps';

const Attribution = {
  name: 'PjMap.Controls.Attribution',
  inheritAttrs: false,
  props: initDefaultProps(
    {
      ...baseProps(),
      // 控件的内容
      content: PropTypes.string,
    },
    {
      position: 'bottom-right',
      offset: [0, 0],
      content: `版权所有：© PJtools <a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox</a> <a href="http://www.geostar.com.cn/" target="_blank">© GeoStar</a>`,
    },
  ),
  data() {
    return {};
  },
  inject: {
    mapProvider: { default: () => {} },
  },
  computed: {
    slotsVNode() {
      const { $slots } = this.mapProvider;
      return $slots && $slots['controls.attribution'] ? filterEmpty($slots['controls.attribution']) : null;
    },
    className() {
      const { prefixCls } = this.mapProvider;
      return {
        [`${prefixCls}-controls-wrapper`]: true,
        [`position-${this.position}`]: true,
      };
    },
    translate() {
      const { offset, position } = this;
      let x = offset[0] || 0;
      let y = offset[1] || 0;
      const pos = position.split('-');
      x = pos[1] === 'left' ? x : 0 - x;
      y = pos[0] === 'top' ? y : 0 - y;
      return {
        transform: `translate(${x}px, ${y}px)`,
      };
    },
  },
  render() {
    const { className, mapProvider, slotsVNode, translate } = this;
    const { prefixCls } = mapProvider;

    return (
      <div class={className} style={translate}>
        {slotsVNode ? (
          <div class={`${prefixCls}-control-attribution`}>{slotsVNode}</div>
        ) : (
          <div class={`${prefixCls}-control-attribution`} domPropsInnerHTML={this.content}></div>
        )}
      </div>
    );
  },
};

export default Attribution;
