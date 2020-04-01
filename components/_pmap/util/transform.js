/**
 * @文件说明: 常规互联网（WGS84、WebMercator、GCJ02、BD09）坐标转换
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-26 13:40:05
 */

import projzh from 'projzh';

const transform = {
  // 经纬度-转-墨卡托
  ll2merc: lonlat => projzh.ll2smerc(lonlat),

  // 墨卡托-转-经纬度
  merc2ll: merc => projzh.smerc2ll(merc),

  // 百度经纬度-转-WGS84经纬度
  bd2ll: lonlat => projzh.datum.bd09.toWGS84(lonlat),

  // WGS84经纬度-转-百度经纬度
  ll2bd: lonlat => projzh.datum.bd09.fromWGS84(lonlat),

  // WGS84经纬度-转-百度墨卡托
  ll2bdmerc: lonlat => projzh.ll2bmerc(lonlat),

  // 百度经纬度-转-标准墨卡托
  bd2merc: lonlat => projzh.ll2smerc(projzh.datum.bd09.toWGS84(lonlat)),

  // WGS84经纬度-转-GCJ02经纬度
  ll2gcj: lonlat => projzh.datum.gcj02.fromWGS84(lonlat),

  // GCJ02经纬度-转-WGS84经纬度
  gcj2ll: lonlat => projzh.datum.gcj02.toWGS84(lonlat),

  // WGS84经纬度-转-GCJ02墨卡托
  ll2gcjmerc: lonlat => projzh.ll2smerc(projzh.datum.gcj02.fromWGS84(lonlat)),

  // GCJ02经纬度-转-标准墨卡托
  gcj2merc: lonlat => projzh.ll2smerc(projzh.datum.gcj02.toWGS84(lonlat)),

  // 百度墨卡托-转-WGS84经纬度
  bdmerc2ll: merc => projzh.bmerc2ll(merc),

  // GCJ02墨卡托-转-WGS84经纬度
  gcjmerc2ll: merc => projzh.datum.gcj02.toWGS84(projzh.smerc2ll(merc)),
};

export default transform;
