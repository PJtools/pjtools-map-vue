/**
 * @文件说明: 构建Map地图的“资源”管理函数方法
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-25 11:38:02
 */

const resource = {
  /**
   * 更新设置地图Map的Sprite样式属性（注意：主要针对矢量瓦片的样式更新）
   * @param {String} sprite 地图Sprite的链接地址
   */
  loadSprite(sprite) {
    const map = this.map;
    if (map && map.style && sprite) {
      map.style.loadSprite(sprite);
    }
  },

  /**
   * 更新设置地图Map的Glyphs样式属性（注意：主要针对矢量瓦片的样式更新）
   * @param {String} glyphs 地图Glyphs的链接地址
   */
  loadGlyphs(glyphs) {
    const map = this.map;
    if (map && map.style && glyphs) {
      map.style.glyphManager.setURL(glyphs);
    }
  },
};

export default resource;
