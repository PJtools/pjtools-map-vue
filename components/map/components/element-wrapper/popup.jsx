/**
 * @文件说明: 定义默认Popup气泡弹窗组件
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-15 14:43:53
 */

import { PropTypes, getComponentFromProp, filterEmpty } from '../../../_util/antdv';
import { isBooleanFlase, isFunction, isString } from '../../../_util/methods-util';
import { Icon } from 'ant-design-vue';

const DefaultPopup = {
  props: {
    // 地图iMapApi实例对象
    iMapApi: PropTypes.any,
    // Popup对象
    popup: PropTypes.any,
    // Popup对象的参数选项
    options: PropTypes.object.def({}),
    // Slot插槽传递的数据
    data: PropTypes.any,
  },
  computed: {
    slotContent() {
      return this.$scopedSlots && this.$scopedSlots.default ? this.$scopedSlots.default() : null;
    },
  },
  methods: {
    // 根据Slots插槽渲染Popup标注内容
    renderPopupContent(h) {
      const {
        iMapApi,
        popup,
        data,
        options: { slots },
      } = this;

      if (isFunction(slots)) {
        return <div class="popup-inner-content">{slots(h)}</div>;
      } else if (typeof slots === 'object' && slots instanceof HTMLElement) {
        return <div class="popup-inner-content" domPropsInnerHTML={slots.outerHTML} />;
      } else if (isString(slots)) {
        const slotNodes = getComponentFromProp(iMapApi.component, `popup.${slots}`, {}, false);
        return <div class="popup-inner-content">{slotNodes ? filterEmpty(slotNodes({ iMapApi, popup, data })) : slots}</div>;
      }
      return <div class="popup-inner-content" />;
    },

    // 执行Popup气泡弹窗的关闭按钮单击Click事件
    handlePopupClose() {
      this.popup && this.popup.remove();
    },
  },
  render(h) {
    const { options } = this;

    return (
      <div>
        {(options.anchor && options.anchor === 'center') || isBooleanFlase(options.defaultSkin) ? null : <div class="popup-arrow" />}
        <div class="popup-inner">
          {isBooleanFlase(options.closeButton) || isBooleanFlase(options.defaultSkin) ? null : (
            <div class="popup-inner-close" onClick={this.handlePopupClose}>
              <Icon type="close" />
            </div>
          )}
          {this.renderPopupContent(h)}
        </div>
      </div>
    );
  },
};

export default DefaultPopup;
