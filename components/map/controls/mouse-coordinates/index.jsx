/**
 * @文件说明: Controls.MouseCoordinates - 鼠标跟随坐标控件
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-09 13:44:54
 */

import { initDefaultProps, PropTypes } from '../../../_util/antdv';
import baseProps from '../baseProps';
import baseMixin from '../baseMixin';
import round from 'lodash/round';

// 默认MouseCoordinates控件的位置
export const defaultMouseCoordinatesPosition = 'bottom-left';

const MouseCoordinates = {
  name: 'PjMap.Controls.MouseCoordinates',
  inheritAttrs: false,
  mixins: [baseMixin],
  props: initDefaultProps(
    {
      ...baseProps(),
      // 坐标值的精度，其中：-1则全精度，0或小于-1则为无精度，其他则裁剪精度
      precision: PropTypes.number,
      // 比例尺显示单位
      wgs84: PropTypes.bool,
    },
    {
      position: defaultMouseCoordinatesPosition,
      offset: [15, 0],
      precision: 5,
      wgs84: false,
    },
  ),
  data() {
    return {
      // 当前鼠标的坐标对象
      coordinates: [0, 0],
    };
  },
  methods: {
    // 执行地图MouseMove事件执驱动坐标重新计算
    handleMapMouseMove(e) {
      let coordinates = null;
      if (e && e.lngLat) {
        coordinates = e.lngLat.toArray();
      } else if (!e) {
        coordinates = this.iMapApi.getCenter();
      }
      if (coordinates) {
        // 判断是否需求转换成WGS84经纬度坐标
        if (this.wgs84) {
          coordinates = this.iMapApi.toWGS84(coordinates);
        }
        // 转换精度
        if (this.precision > 0) {
          coordinates[0] = round(coordinates[0], this.precision);
          coordinates[1] = round(coordinates[1], this.precision);
        } else if (this.precision === 0 || this.precision < -1) {
          coordinates[0] = round(coordinates[0], 0);
          coordinates[1] = round(coordinates[1], 0);
        }
        this.coordinates = coordinates;
      }
    },
  },
  mounted() {
    // 联动地图mousemove事件驱动更新鼠标坐标
    this.iMapApi.on('pjmap.controls.mousecoordinates.mousemove', 'mousemove', this.handleMapMouseMove);
    this.handleMapMouseMove();
  },
  beforeDestroy() {
    this.iMapApi.off('pjmap.controls.mousecoordinates.mousemove');
  },
  render() {
    const { id, classes, ctrlStyles, coordinates } = this;

    return (
      <div data-id={id} class={classes} style={ctrlStyles}>
        <div class="coordinates-text">{`${coordinates[0]}, ${coordinates[1]}`}</div>
      </div>
    );
  },
};

export default MouseCoordinates;
