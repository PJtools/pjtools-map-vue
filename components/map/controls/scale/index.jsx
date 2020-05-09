/**
 * @文件说明: Controls.Scale - 比例尺控件
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-08 16:18:15
 */

import { initDefaultProps, PropTypes } from '../../../_util/antdv';
import baseProps from '../baseProps';
import baseMixin from '../baseMixin';

// 默认Scale控件的位置
export const defaultScalePosition = 'bottom-left';

const Scale = {
  name: 'PjMap.Controls.Scale',
  inheritAttrs: false,
  mixins: [baseMixin],
  props: initDefaultProps(
    {
      ...baseProps(),
      // 比例尺最大宽度
      maxWidth: PropTypes.number,
      // 比例尺显示单位
      unit: PropTypes.oneOf(['imperial', 'metric', 'nautical']),
    },
    {
      position: defaultScalePosition,
      offset: [10, 5],
      maxWidth: 80,
      unit: 'metric',
    },
  ),
  data() {
    return {
      // 当前比例尺的数值
      currentValue: 0,
      // 当前比例尺的单位
      currentUnit: 'm',
      // 当前比例尺的样式
      scaleStyle: {},
    };
  },
  methods: {
    // 执行地图Move事件执驱动比例尺重新计算
    handleMapScaleMove() {
      this.updateScaleValue();
    },

    getDecimalRoundNum(d) {
      const multiplier = Math.pow(10, Math.ceil(-Math.log(d) / Math.LN10));
      return Math.round(d * multiplier) / multiplier;
    },

    getRoundNum(num) {
      const pow10 = Math.pow(10, `${Math.floor(num)}`.length - 1);
      let d = num / pow10;
      d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : d >= 1 ? 1 : this.getDecimalRoundNum(d);
      return pow10 * d;
    },

    distanceTo(from, to) {
      const rad = Math.PI / 180;
      const lat1 = from[1] * rad;
      const lat2 = to[1] * rad;
      const maxMeters =
        6371008.8 * Math.acos(Math.min(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos((to[0] - from[0]) * rad), 1));
      return maxMeters;
    },

    // 计算比例尺
    calculationScale(maxWidth, maxDistance, unit) {
      const distance = this.getRoundNum(maxDistance) || 0;
      const ratio = maxDistance === 0 ? 1 : distance / maxDistance;
      this.currentValue = distance;
      this.currentUnit = unit;
      this.scaleStyle = {
        width: `${maxWidth * ratio + 16}px`,
      };
    },

    // 更新比例尺的参考距离比值
    updateScaleValue() {
      const iMapApi = this.iMapApi;
      const map = iMapApi && iMapApi.map;
      const maxWidth = this.maxWidth;
      // 计算屏幕坐标的距离
      const y = map._container.clientHeight / 2;
      const left = map.unproject([0, y]).toArray();
      const right = map.unproject([maxWidth, y]).toArray();
      const from = iMapApi.toWGS84(left);
      const to = iMapApi.toWGS84(right);
      const maxMeters = this.distanceTo(from, to);
      // 根据单位类型计算转换
      switch (this.unit) {
        case 'imperial': {
          const maxFeet = 3.2808 * maxMeters;
          if (maxFeet > 5280) {
            const maxMiles = maxFeet / 5280;
            this.calculationScale(maxWidth, maxMiles, '英里');
          } else {
            this.calculationScale(maxWidth, maxFeet, '英尺');
          }
          break;
        }
        case 'nautical': {
          const maxNauticals = maxMeters / 1852;
          this.calculationScale(maxWidth, maxNauticals, '海里');
          break;
        }
        default: {
          if (maxMeters >= 1000) {
            this.calculationScale(maxWidth, maxMeters / 1000, '公里');
          } else {
            this.calculationScale(maxWidth, maxMeters, '米');
          }
          break;
        }
      }
    },

    // 设置比例尺的单位
    setUnit(unit) {
      this.$emit('update:unit', unit);
      this.$nextTick(() => {
        this.updateScaleValue();
      });
    },
  },
  mounted() {
    // 联动地图move事件驱动更新比例尺
    this.iMapApi.on('pjmap.controls.scale.move', 'move', this.handleMapScaleMove);
    this.handleMapScaleMove();
  },
  beforeDestroy() {
    this.iMapApi.off('pjmap.controls.scale.move');
  },
  render() {
    const { id, classes, ctrlStyles, currentValue, currentUnit, scaleStyle } = this;

    return (
      <div data-id={id} class={classes} style={ctrlStyles}>
        <div class="mapboxgl-ctrl mapboxgl-ctrl-scale" style={scaleStyle}>{`${currentValue} ${currentUnit}`}</div>
      </div>
    );
  },
};

export default Scale;
