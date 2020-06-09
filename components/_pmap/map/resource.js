/**
 * @文件说明: 构建Map地图的“资源”管理函数方法
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-25 11:38:02
 */

import { isNotEmptyArray } from '../../_util/methods-util';

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

  /**
   * 获取地图加载的所有Image图片资源的Id集合
   */
  getAllImageIds() {
    const map = this.map;
    if (map && map.listImages) {
      return map.listImages();
    }
    return [];
  },

  /**
   * 判断指定Id的图片资源是否已经加载
   * @param {String} id 图片的唯一Id名称
   */
  hasImage(id) {
    const map = this.map;
    if (map) {
      return map.hasImage(id);
    }
    return false;
  },

  /**
   * 获取地图加载的所有Image图片资源对象
   */
  getMapImages() {
    const map = this.map;
    if (map && map.style && map.style.imageManager) {
      const keys = Object.keys(map.style.imageManager.images) || [];
      const images = {};
      keys.map(key => {
        images[key] = map.style.imageManager.images[key];
      });
      return images;
    }
    return null;
  },

  /**
   * 获取指定Id的Image图片资源对象
   * @param {String} id 图片的唯一Id名称
   */
  getMapImage(id) {
    const images = this.getMapImages();
    if (images && id && images[id]) {
      return images[id];
    }
    return null;
  },

  /**
   * 加载图片资源到地图Map样式库
   * @param {String} id 图片的唯一Id名称
   * @param {String} url 图片的地址
   */
  loadImage(id, url) {
    const map = this.map;
    return new Promise((resolve, reject) => {
      // 判断指定Id的图片资源是否已加载到地图中
      if (this.hasImage(id)) {
        console.warn(`Image图片资源[${id}]已加载渲染到地图中，无需重复加载!`);
        resolve(id);
      } else {
        if (map) {
          map.loadImage(url, (error, image) => {
            if (error) {
              console.error(error);
              reject(error);
            } else {
              map.addImage(id, image);
              resolve(id);
            }
          });
        } else {
          reject();
        }
      }
    });
  },

  /**
   * 批量加载图片资源到地图Map样式库
   * @param {Array} list 图片资源列表
   */
  loadImages(list) {
    return new Promise((resolve, reject) => {
      if (isNotEmptyArray(list)) {
        const promises = [];
        list.map(item => {
          if (item.id && item.url) {
            promises.push(
              this.loadImage(item.id, item.url)
                .then(id => id)
                .catch(() => null),
            );
          }
        });
        Promise.all(promises).then(ids => {
          resolve(ids.filter(id => id !== null));
        });
      } else {
        reject();
      }
    });
  },

  /**
   * 删除指定Id的图片资源
   * @param {String} id 图片的唯一Id名称
   */
  removeImage(id) {
    const map = this.map;
    if (map && this.hasImage(id)) {
      map.removeImage(id);
    }
  },

  /**
   * 清空所有已加载的图片资源
   */
  clearImages() {
    const imageIds = this.getAllImageIds();
    if (imageIds && imageIds.length) {
      imageIds.map(id => {
        this.removeImage(id);
      });
    }
  },
};

export default resource;
