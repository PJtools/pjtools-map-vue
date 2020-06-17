/**
 * @文件说明: Interactions.MouseTooltip - 光标跟随气泡提示框
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-18 14:13:35
 */

import baseProps from '../baseProps';
import baseMixin from '../baseMixin';
import { getComponentFromProp } from '../../../_util/antdv';
import { isFunction, isBooleanTrue } from '../../../_util/methods-util';
import { Icon } from 'ant-design-vue';

const MouseTooltip = {
  name: 'PjMap.Interactions.MouseTooltip',
  inheritAttrs: false,
  mixins: [baseMixin],
  props: baseProps(),
  data() {
    return {
      // 组件是否可见
      visible: false,
      // 组件容器Class类名
      wrapClassName: null,
      // 提示框的偏移量
      position: null,
      // 提示框的显隐状态
      show: false,
      // 提示图标
      icon: null,
      // 提示内容
      content: null,
    };
  },
  computed: {
    // 是否渲染组件
    isRenderComponent() {
      return !!(this.visible && (this.icon || this.content));
    },
    // 是否为纯图标模式
    isPureIconMode() {
      return !!(this.icon && !this.content);
    },
    // 组件的样式
    cptStyles() {
      const { styles, position, show } = this;
      const componentStyle = {};
      styles && Object.assign(componentStyle, styles);
      position && Object.assign(componentStyle, position);
      !show && (componentStyle.display = 'none');
      return componentStyle;
    },
    // 组件Class类名
    classNames() {
      const {
        classes,
        mapProvider: { prefixCls },
        isPureIconMode,
      } = this;
      const cls = [
        ...classes,
        `${prefixCls}-interactions-mousetooltip`,
        {
          'pure-icon': isPureIconMode,
        },
      ];
      this.wrapClassName && cls.push(this.wrapClassName);
      return cls;
    },
  },
  methods: {
    // 渲染默认的提示框文本
    renderTooltipContent(h) {
      const content = getComponentFromProp(this, 'content', {}, false);
      if (isFunction(content)) {
        return <span class="content">{content(h)}</span>;
      } else if (typeof content === 'object' && content instanceof HTMLElement) {
        return <span class="content" domPropsInnerHTML={content.outerHTML}></span>;
      } else {
        return this.renderSlotScopeNodes(content, this.$data) || <span class="content">{content}</span>;
      }
    },

    // 渲染默认的提示框图标
    renderTooltipIcon(h) {
      const icon = getComponentFromProp(this, 'icon', {}, false);
      // 判断是否为Function函数类型
      if (isFunction(icon)) {
        return <span class="icon">{icon(h)}</span>;
      } else if (typeof icon === 'object' && icon instanceof HTMLElement) {
        return <span class="icon" domPropsInnerHTML={icon.outerHTML}></span>;
      } else {
        // 判断是否有具名插槽
        const slotNodes = this.renderSlotScopeNodes(icon, this.$data);
        if (slotNodes) {
          return slotNodes;
        } else {
          let theme = 'outlined';
          let iconName = icon;
          if (icon.indexOf(':') !== -1) {
            const iconSplit = icon.split(':');
            theme = iconSplit[1];
            iconName = iconSplit[0];
          }
          return <Icon class="icon" type={iconName} theme={theme} />;
        }
      }
    },

    // 激活光标跟随气泡提示框
    enable(options = {}) {
      this.icon = options.icon || null;
      this.content = options.content || null;
      this.wrapClassName = options.className || null;
      this.position = options.position || this.position || null;
      this.show = true;
      this.visible = true;
    },

    // 禁用光标跟随气泡提示框
    disable() {
      this.wrapClassName = null;
      this.position = null;
      this.show = false;
      this.icon = null;
      this.content = null;
      this.visible = false;
    },

    // 更新光标提示框的偏移量
    updateMousePostion(position) {
      this.position = position;
    },

    // 更新光标提示框的显隐状态
    updateVisible(show = false) {
      this.show = isBooleanTrue(show);
    },
  },
  render(h) {
    const { id, cptStyles, classNames, isRenderComponent, icon, content } = this;
    return isRenderComponent ? (
      <div data-id={id} class={classNames} style={cptStyles}>
        {icon ? this.renderTooltipIcon(h) : null}
        {content ? this.renderTooltipContent(h) : null}
      </div>
    ) : null;
  },
};

export default MouseTooltip;
