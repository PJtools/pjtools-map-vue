/**
 * @文件说明: Controls.Navigation - 导航控件
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-07 10:02:46
 */

import { initDefaultProps, PropTypes } from '../../../_util/antdv';
import baseProps from '../baseProps';
import baseMixin from '../baseMixin';

// 默认Navigation控件的位置
export const defaultNavigationPosition = 'top-right';

const Navigation = {
  name: 'PjMap.Controls.Navigation',
  inheritAttrs: false,
  mixins: [baseMixin],
  props: initDefaultProps(
    {
      ...baseProps(),
      // 是否显示“罗盘”
      showCompass: PropTypes.bool,
      // 是否允许控制倾斜
      visualizePitch: PropTypes.bool,
      // 是否显示“层级”
      showZoomNum: PropTypes.bool,
    },
    {
      position: defaultNavigationPosition,
      offset: [10, 10],
      showCompass: false,
      visualizePitch: true,
      showZoomNum: false,
    },
  ),
  data() {
    return {
      // 是否禁用（层级放大）
      zoomInDisabled: false,
      // 是否禁用（层级缩小）
      zoomOutDisabled: false,
      // 当前地图层级
      zoom: 0,
      // 当前罗盘的旋转变形
      compassTransform: null,
    };
  },
  computed: {
    compassStyle() {
      const style = {};
      if (this.showCompass && this.compassTransform) {
        style.transform = this.compassTransform;
      }
      return style;
    },
  },
  methods: {
    // 根据类型渲染导航按钮组中的按钮
    renderButtonByGroup(type, title, disabled = false) {
      return (
        <button
          type="button"
          class={`mapboxgl-ctrl-${type}`}
          disabled={disabled}
          title={title}
          aria-label={title}
          onClick={e => {
            e.stopPropagation();
            !disabled && this.handleButtonGroupClick(type);
          }}
        >
          <span class="mapboxgl-ctrl-icon" aria-hidden="true" style={type === 'compass' ? this.compassStyle : null} />
        </button>
      );
    },

    // 渲染地图层级的数字屏显组件
    renderMapZoomNumber() {
      return (
        <div class="ctrl-zoom-number">
          <span class="ctrl-label">{this.zoom}</span>
        </div>
      );
    },

    // 渲染地图的罗盘组件
    renderMapCompass() {
      return this.renderButtonByGroup('compass', '重置方位');
    },

    // 更新地图层级按钮的状态
    updateZoomButton() {
      const zoom = this.iMapApi.getZoom();
      this.zoom = Math.floor(zoom);
      this.zoomInDisabled = zoom === this.iMapApi.getMaxZoom();
      this.zoomOutDisabled = zoom >= 1 ? zoom === this.iMapApi.getMinZoom() : this.zoom === this.iMapApi.getMinZoom();
    },

    // 更新地图罗盘的旋转角度
    rotateCompassArrow() {
      const map = this.iMapApi && this.iMapApi.map;
      if (this.visualizePitch) {
        const scale = 1 / Math.pow(Math.cos(map.transform.pitch * (Math.PI / 180)), 0.5);
        const rotateZ = map.transform.angle * (180 / Math.PI);
        this.compassTransform = `scale(${scale}) rotateX(${map.transform.pitch}deg) rotateZ(${rotateZ}deg)`;
      } else {
        this.compassTransform = `rotate(${map.transform.angle * (180 / Math.PI)}deg)`;
      }
    },

    // 执行导航按钮组的按钮单击Click事件
    handleButtonGroupClick(type) {
      const iMapApi = this.iMapApi;
      const map = iMapApi && iMapApi.map;
      switch (type) {
        case 'zoom-in': {
          map && map.zoomIn();
          break;
        }
        case 'zoom-out': {
          map && map.zoomOut();
          break;
        }
        case 'compass': {
          if (this.visualizePitch) {
            iMapApi && iMapApi.resetRotatePitch();
          } else {
            iMapApi && iMapApi.resetRotate();
          }
          break;
        }
      }
    },
  },
  mounted() {
    // 联动地图层级按钮与事件
    this.iMapApi.on('pjmap.controls.navigation.zoom', 'zoom', this.updateZoomButton);
    this.updateZoomButton();
    // 判断是否加载“罗盘”
    if (this.showCompass) {
      if (this.visualizePitch) {
        this.iMapApi.on('pjmap.controls.navigation.pitch', 'pitch', this.rotateCompassArrow);
      }
      this.iMapApi.on('pjmap.controls.navigation.rotate', 'rotate', this.rotateCompassArrow);
      this.rotateCompassArrow();
    }
  },
  beforeDestroy() {
    if (this.showCompass) {
      if (this.visualizePitch) {
        this.iMapApi.off('pjmap.controls.navigation.pitch');
      }
      this.iMapApi.off('pjmap.controls.navigation.rotate');
    }
    this.iMapApi.off('pjmap.controls.navigation.zoom');
  },
  render() {
    const { id, classes, ctrlStyles, showCompass, showZoomNum, zoomInDisabled, zoomOutDisabled } = this;

    return (
      <div data-id={id} class={classes} style={ctrlStyles}>
        <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
          {this.renderButtonByGroup('zoom-in', '放大一级', zoomInDisabled)}
          {this.renderButtonByGroup('zoom-out', '缩小一级', zoomOutDisabled)}
          {showCompass ? this.renderMapCompass() : null}
          {showZoomNum ? this.renderMapZoomNumber() : null}
        </div>
      </div>
    );
  },
};

export default Navigation;
