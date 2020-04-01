/**
 * @文件说明: Controls.Attribution - (属性/署名)信息控件
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-31 12:42:04
 */

import { filterEmpty, initDefaultProps, PropTypes } from '../../../_util/antdv';
import baseProps from '../baseProps';
import baseMixin from '../baseMixin';

// 默认Attribution控件的位置
export const defaultAttributionPosition = 'bottom-right';

const Attribution = {
  name: 'PjMap.Controls.Attribution',
  inheritAttrs: false,
  mixins: [baseMixin],
  props: initDefaultProps(
    {
      ...baseProps(),
      // 控件的内容
      content: PropTypes.string,
    },
    {
      position: defaultAttributionPosition,
      offset: [0, 0],
      content: `版权所有：© PJtools <a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox</a> <a href="http://www.geostar.com.cn/" target="_blank">© GeoStar</a>`,
    },
  ),
  inject: {
    mapProvider: { default: () => {} },
  },
  computed: {
    slotsVNode() {
      const { $slots } = this.mapProvider;
      return $slots && $slots['controls.attribution'] ? filterEmpty($slots['controls.attribution']) : null;
    },
  },
  methods: {
    /**
     * 更新当前Content内容，不包括Slots插槽模式的更新；
     * @param {string} content 待更新的内容
     */
    setContent(content) {
      if (!this.slotsVNode) {
        this.$emit('update:content', content);
      }
    },
  },
  render() {
    const { id, classes, slotsVNode, translate } = this;

    return slotsVNode ? (
      <div data-id={id} class={classes} style={translate}>
        {slotsVNode}
      </div>
    ) : (
      <div data-id={id} class={classes} style={translate} domPropsInnerHTML={this.content}></div>
    );
  },
};

export default Attribution;
