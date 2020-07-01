/**
 * @文件说明: 地图内置组件 - 底图切换器
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-06-30 11:02:34
 */

import { initDefaultProps, PropTypes } from '../../../_util/antdv';
import baseProps from '../component-wrapper/baseProps';
import baseMixin from '../component-wrapper/baseMixin';
import { isNotEmptyArray, isFunction } from '../../../_util/methods-util';

const Switcher = {
  name: 'PjmapSwitcher',
  mixins: [baseMixin],
  props: initDefaultProps(
    {
      ...baseProps(),
      // 底图切换器数据项的宽度
      itemWidth: PropTypes.number,
      // 底图切换器数据项的高度
      itemHeight: PropTypes.number,
      // 底图切换器数据项的偏移间距
      itemOffset: PropTypes.number,
      // 底图切换器数据项的展开状态的间距
      itemGutter: PropTypes.number,
      // 底图切换器的项数据，其中选项：[ key, label, image, onActive ]
      data: PropTypes.array,
      // 底图切换器的当前选中值
      value: PropTypes.string,
    },
    {
      position: 'bottom-right',
      itemWidth: 64,
      itemHeight: 48,
      itemOffset: 5,
      itemGutter: 10,
      data: [],
    },
  ),
  model: {
    prop: 'value',
    event: 'change',
  },
  data() {
    return {
      isExpand: false,
      currentSelectKey: this.value || null,
    };
  },
  computed: {
    itemsCount() {
      return this.data && isNotEmptyArray(this.data) ? this.data.length : 0;
    },
    itemsWrapStyle() {
      const { itemWidth, itemHeight, itemOffset, itemsCount, isExpand } = this;
      // 判断数据项是否大于1个，则扩展偏移间距宽度
      const spaceWidth = itemsCount > 1 ? (itemsCount - 1) * itemOffset : 0;

      let width = 0;
      // 判断是否展开数据项
      if (isExpand) {
        width = itemWidth * itemsCount + spaceWidth;
        itemsCount > 1 && (width += spaceWidth);
      } else {
        width = itemWidth + spaceWidth;
      }

      return {
        width: `${width}px`,
        height: `${itemHeight}px`,
      };
    },
    isReverse() {
      return !!(this.position.indexOf('left') !== -1);
    },
  },
  watch: {
    value(val) {
      this.currentSelectKey = val;
    },
  },
  methods: {
    // 渲染组件的数据项结构
    renderSwitcherItem(item, index) {
      const { itemWidth, itemHeight, itemsCount, itemOffset, itemGutter, isExpand, isReverse, currentSelectKey } = this;
      const { key, label, image } = item;

      // 计算数据项的Style样式
      const styles = {
        width: `${itemWidth}px`,
        height: `${itemHeight}px`,
      };
      // 根据渲染位置、展开状态等场景，判断是否需加载背景图片
      if (isExpand || (!isReverse && index === itemsCount - 1) || (isReverse && index === 0)) {
        styles.backgroundColor = 'transparent';
        styles.backgroundImage = `url(${image})`;
      }
      // 判断是否数据项的加载顺序是否反向
      if (isReverse) {
        // 计算数据项的居左偏移量
        let left = 0;
        if (itemsCount > 1) {
          if (isExpand) {
            left = index * (itemWidth + itemGutter);
          } else {
            left = index * itemOffset;
          }
        }
        styles.left = `${left}px`;
        styles.zIndex = itemsCount - 1 - index;
      } else {
        // 计算数据项的居右偏移量
        let right = 0;
        if (itemsCount > 1) {
          if (isExpand) {
            right = (itemsCount - 1 - index) * (itemWidth + itemGutter);
          } else {
            right = (itemsCount - 1) * itemOffset - index * itemOffset;
          }
        }
        styles.right = `${right}px`;
        styles.zIndex = index + 1;
      }

      // 判断是否激活选中当前项的状态
      let isActive = false;
      if (isExpand) {
        if (key === currentSelectKey) {
          isActive = true;
        }
      } else {
        itemsCount === 1 && key === currentSelectKey && (isActive = true);
      }

      return (
        <div
          key={key || index}
          class={['switcher-card-item', { active: isActive }]}
          style={styles}
          onClick={this.handleItemClick.bind(this, item, index)}
        >
          <span>{label}</span>
        </div>
      );
    },

    // 渲染当前组件的默认结构
    renderUiComponent() {
      const { data, position, itemsWrapStyle, isReverse } = this;
      // 绑定Hover事件对数据项展开状态进行设置
      const props = {
        on: {
          mouseenter: () => (this.isExpand = true),
          mouseleave: () => (this.isExpand = false),
        },
      };

      return (
        <div class={[this.getClassNames('switcher'), position, { reverse: isReverse, expand: this.isExpand }]} style={this.styles}>
          {data && isNotEmptyArray(data) ? (
            <div class="switcher-card" style={itemsWrapStyle} {...props}>
              {data.map((item, idx) => this.renderSwitcherItem(item, idx))}
            </div>
          ) : null}
        </div>
      );
    },

    // 执行当前数据项的单击Click事件
    handleItemClick(item, index) {
      // 判断当前数据项是否还未激活选中状态
      if (item.key !== this.currentSelectKey) {
        // 切换选中项
        this.$emit('change', item.key);
        // 判断当前选项是否有自定义事件响应，则阻止默认切换
        if (item.onActive && isFunction(item.onActive)) {
          item.onActive.call(this, { dataItem: item, dataIndex: index });
        } else {
          this.iMapApi && this.iMapApi.setMapBasicLayers(item.key);
        }
      }
    },
  },
  render() {
    return this.renderComponent(this.renderUiComponent);
  },
};

export default Switcher;
