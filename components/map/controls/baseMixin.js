/**
 * @文件说明: 定义地图控件的基础Mixin
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-04-01 10:34:34
 */

export default {
  computed: {
    classes() {
      const {
        mapProvider: { prefixCls },
        className,
      } = this;
      let cls = [];
      if (className) {
        cls = className.split(',');
        cls = (cls && cls.length && cls.map(item => item.trim())) || [];
      }
      return [`${prefixCls}-control-attribution`, ...cls];
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
  methods: {
    /**
     * 根据偏移量对地图控件进行对应偏移值更新
     * @param {Array} offset 待更新的偏移量
     */
    updateOffset(offset) {
      this.$emit('update:offset', [offset && offset[0] ? Number(offset[0]) : 0, offset && offset[1] ? Number(offset[1]) : 0]);
    },
  },
};
