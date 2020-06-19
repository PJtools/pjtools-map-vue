/**
 * @文件说明: Map.Controls - 地图控件
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-31 12:49:01
 */

import assign from 'lodash/assign';
import find from 'lodash/find';
import { PropTypes } from '../../_util/antdv';
import Attribution, { defaultAttributionPosition } from './attribution';
import Navigation, { defaultNavigationPosition } from './navigation';
import Scale, { defaultScalePosition } from './scale';
import MouseCoordinates, { defaultMouseCoordinatesPosition } from './mouse-coordinates';

// 地图控件的类型枚举名
export const mapControlsTypeKeys = ['Attribution', 'Navigation', 'Scale', 'MouseCoordinates'];
// 地图控件的位置枚举
export const mapControlsPosition = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

const Controls = {
  name: 'PjMap.Controls',
  components: {
    Attribution,
    Navigation,
    Scale,
    MouseCoordinates,
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
        case 'Navigation':
          return defaultNavigationPosition;
        case 'Scale':
          return defaultScalePosition;
        case 'MouseCoordinates':
          return defaultMouseCoordinatesPosition;
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
          const on = {
            'update:offset': val => {
              const control = this.getDataControlById(item.id);
              control && this.$set(control, 'offset', val);
            },
          };
          // 根据控件类型加载对应的地图控件
          let component = null;
          switch (item.type) {
            case 'Attribution': {
              on['update:content'] = val => {
                const control = this.getDataControlById(item.id);
                control && this.$set(control.options, 'content', val);
              };
              component = <Attribution {...{ props }} {...{ on }} />;
              break;
            }
            case 'Navigation': {
              component = <Navigation {...{ props }} {...{ on }} />;
              break;
            }
            case 'Scale': {
              on['update:unit'] = val => {
                const control = this.getDataControlById(item.id);
                control && this.$set(control.options, 'unit', val);
              };
              component = <Scale {...{ props }} {...{ on }} />;
              break;
            }
            case 'MouseCoordinates': {
              component = <MouseCoordinates {...{ props }} {...{ on }} />;
              break;
            }
            default:
              break;
          }
          this.controls[item.id] = component;
          return component;
        })
      );
    },

    // 根据Id获取原始控件数据集的控件项
    getDataControlById(id) {
      const control = find(this.dataList, { id });
      return control || null;
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
