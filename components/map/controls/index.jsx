/**
 * @文件说明: Map.Controls - 地图控件
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-31 12:49:01
 */

import assign from 'lodash/assign';
import { PropTypes } from '../../_util/antdv';
import Attribution, { defaultAttributionPosition } from './attribution';

// 地图控件的类型枚举名
export const mapControlsTypeKeys = ['Attribution'];
// 地图控件的位置枚举
export const mapControlsPosition = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

const Controls = {
  name: 'PjMap.Controls',
  components: {
    Attribution: () => resolve => require(['./attribution'], resolve),
  },
  props: {
    dataList: PropTypes.array,
  },
  data() {
    return {
      controls: {},
    };
  },
  inject: {
    mapProvider: { default: () => {} },
  },
  computed: {
    className() {
      const { prefixCls } = this.mapProvider;
      return {
        [`${prefixCls}-controls-wrapper`]: true,
      };
    },
    groupControls() {
      const controls = {};
      this.dataList &&
        this.dataList.length &&
        this.dataList.map(item => {
          const control = assign({}, item);
          !control.position && (control.position = this.getDefaultControlPosition(item.type));
          !controls[control.position] && (controls[control.position] = []);
          controls[control.position].push(control);
        });
      return controls;
    },
  },
  methods: {
    // 获取控件类型的默认Position位置
    getDefaultControlPosition(key) {
      switch (key) {
        case 'Attribution':
          return defaultAttributionPosition;
      }
    },

    // 根据控件分组数据渲染控件位置容器
    renderControlsGroupWrapper() {
      const { className, groupControls } = this;
      const keys = Object.keys(groupControls);
      return (
        keys &&
        keys.map(key => {
          const classes = {
            ...className,
            [`position-${key}`]: true,
          };
          return <div class={classes}>{this.renderControlsComponent(groupControls[key])}</div>;
        })
      );
    },

    // 根据控件类型渲染地图控件组件
    renderControlsComponent(controls) {
      return (
        controls &&
        controls.map((item, idx) => {
          const props = {
            key: item.id || String(idx),
            id: item.id,
            ...(item.options || {}),
          };
          item.position && (props.position = item.position);
          item.offset && (props.offset = item.offset);
          // 根据控件类型加载对应的地图控件
          let component = null;
          switch (item.type) {
            case 'Attribution':
              component = <Attribution {...{ props }} />;
              break;
            default:
              break;
          }
          this.controls[item.id] = component;
          return component;
        })
      );
    },

    // 获取指定Id的地图控件组件Component对象
    getControlComponent(id) {
      return this.controls && this.controls[id];
    },
  },
  render() {
    return <section data-type="control">{this.renderControlsGroupWrapper()}</section>;
  },
};

export default Controls;
