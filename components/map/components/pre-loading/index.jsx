/**
 * @文件说明:
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-12 14:29:11
 */

import Vivus from 'vivus';
import { getPrefixCls } from '../../../_util/methods-util';
import { PropTypes, filterEmpty, getTransitionProps } from '../../../_util/antdv';
import { Icon } from 'ant-design-vue';
import CitySvg from './assets/city.svg';

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
          file: CitySvg,
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
          <div ref="preloadingContainer" class={`${prefixCls}-svg`}></div>
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
    const transitionProps = getTransitionProps('fade');

    return <transition {...transitionProps}>{slotsVNode ? <div class={prefixCls}>{slotsVNode}</div> : this.renderDefaultPreLoading()}</transition>;
  },
};
