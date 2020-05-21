/**
 * @文件说明: 构建Map.Interfaces地图交互接口对象
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-21 10:09:45
 */

import BasicMapApi from '../util/basicMapApiClass';
import Fullscreen from './fullscreen';

class Interfaces extends BasicMapApi {
  /**
   * 获取地图“全屏”实例对象
   */
  fullscreen() {
    return new Fullscreen(this.iMapApi);
  }
}

export default Interfaces;
