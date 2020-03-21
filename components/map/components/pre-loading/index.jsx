/**
 * @文件说明: 地图内置组件 - Pre-Loading预加载过渡转场
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-12 14:29:11
 */

import Vivus from 'vivus';
import { getPrefixCls } from '../../../_util/methods-util';
import { PropTypes, filterEmpty, getTransitionProps } from '../../../_util/antdv';
import { Icon } from 'ant-design-vue';

export default {
  name: 'PjMapPreloading',
  components: {
    Icon,
  },
  props: {
    // 自定义描述内容
    description: PropTypes.string,
  },
  data() {
    return {
      // 默认SVG动画实例对象
      vivus: null,
      // 默认SVG动画是否反置
      reverse: false,
    };
  },
  computed: {
    prefixCls() {
      return getPrefixCls('map-preloading');
    },
    slotsVNode() {
      return this.$slots && this.$slots.preloading ? filterEmpty(this.$slots.preloading) : null;
    },
  },
  mounted() {
    // 是否无slots插槽，以默认Loading时运行动画
    if (!this.slotsVNode) {
      this.playPreloading();
    }
  },
  beforeDestroy() {
    if (!this.slotsVNode) {
      // 注销Loading的动画
      if (this.vivus) {
        this.vivus.destroy();
        this.vivus = null;
        this.reverse = false;
      }
    }
  },
  methods: {
    // 播放预加载的Loading动画
    playPreloading() {
      const container = this.$refs.preloadingContainer;
      this.vivus = new Vivus(
        container,
        {
          type: 'sync',
          duration: 1000,
          animTimingFunction: Vivus.EASE,
        },
        () => {
          this.vivus.play(!this.reverse ? -1 : 1);
          this.reverse = !this.reverse;
        },
      );
    },

    // 渲染默认Pre-Loading预加载组件
    renderDefaultPreLoading() {
      const { prefixCls, description } = this;
      return (
        <div class={prefixCls}>
          <div class={`${prefixCls}-svg`}>
            <svg version="1.1" ref="preloadingContainer" x="0px" y="0px" viewBox="0 0 1331 174">
              <path d="M0,172h61v-23h12v11h4v-37h16v16h5V49h20l6,6v76h4V46h20l6,6v90h15v-29h13v-7h15v17h13v21h5v-15h3v-13h4v-16h2v16h4v13h7v10h5v-11h12v10h4v-13h16v22h6v-10h3v-12h15v23h5v-14h17v14h4v-18h10v-17h16v9h7v-10h24v25h5v-27h5V58h6V41h3V20h5V0h2v20h5v21h3v17h6v52h4v23h8v-23h8v-9h4V91h22v10h19v26h2v-15h20v10h18v15h7v-12h20v-5h20v-11h12v32h9v-19h26v-4h18v-13h16v8h18v21h6v-11h5V92h10v31h5v14h8v-27h15v27h4V83h26v55h10v-13h7v-6h12V99h26v32h4V88h12v18h12v19h7V58l5-20V0h2v38l7,20v71h10v-16h6V77h20v46h3v-17h15v30h3V84l32-33h2v82h6v-33h25v40h2v-21h17v13h6v-19h32v20h24V92h18v24h3V81h21v61h7v-16h5v-14h22v8h14v20h8v-34h47v66h130v2h-132v-66h-43v34h-12v-20h-14v-8h-18v14h-5v16h-11V83h-17v35h-7V94h-14v41h-28v-20h-28v19h-10v-13h-13v21h-6v-40h-21v33h-10V54l-30,31v53h-7v-30h-11v17h-7V79h-16v36h-6v16h-14V58l-6-18l-4,18v69h-11v-19h-12V90h-8v43h-8v-32h-22v20h-12v6h-7v13h-14V85h-22v54h-8v-27h-11v27h-12v-14h-5V94h-6v31h-5v11h-10v-21h-18v-8h-12v13h-18v4h-26v19h-13v-32h-8v11h-20v5h-20v12h-11v-15h-18v-10h-16v15h-6v-26h-19V93h-18v10h-4v9h-8v23h-12v-23h-4V60h-6V43h-3V22h-8v21h-3v17h-6v52h-5v27h-9v-25h-20v10h-11v-9h-12v17h-10v18h-8v-14h-13v14h-9v-23h-11v12h-3v10h-10v-22h-12v13h-8v-10h-8v11h-9v-10h-7v-13h-6v13h-3v15h-9v-21h-13v-17h-11v7h-13v29h-19V53l-5-5h-17v85h-8V56l-5-5h-17v90h-9v-16H79v37h-8v-11h-8v23H0V172z" />
            </svg>
          </div>
          {description ? (
            <div class={`${prefixCls}-content`}>
              <Icon slot="indicator" type="loading" spin />
              <span>{description}</span>
              <span class="dot"></span>
            </div>
          ) : null}
        </div>
      );
    },
  },
  render() {
    const { prefixCls, slotsVNode } = this;
    const transitionProps = getTransitionProps('mapFade', {
      leave: () => {
        this.$emit('destroy');
      },
    });

    return <transition {...transitionProps}>{slotsVNode ? <div class={prefixCls}>{slotsVNode}</div> : this.renderDefaultPreLoading()}</transition>;
  },
};
