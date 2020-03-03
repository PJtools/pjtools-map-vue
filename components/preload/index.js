/**
 * @文件说明: 动态预加载资源文件
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-02-04 16:17:14
 */

import createjs from 'createjs-npm/lib/preload';
import merge from 'lodash/merge';

// 定义默认的预加载对象的参数选项
const DEFAULT_PRELOAD_OPTIONS = {
  // 定义预加载的基础前缀路径
  baseUrl: '',
  // 执行预加载时的进度百分比回调，范围：0-100之间
  onProgress: null,
  // 执行预加载时单个文件加载完成的回调
  onFileload: null,
};

/**
 * 根据Manifest配置清单文件读取对应的JSON数据项
 * @param {String} baseUrl 基础前缀路径
 */
const fetchManifestList = function(baseUrl = DEFAULT_PRELOAD_OPTIONS.baseUrl) {
  const instance = api.getInstance(baseUrl);
  return new Promise((resolve, reject) => {
    instance.loadFile('manifest.json');

    const errorMsg = `解析[manifest.json]配置文件时失败，请检查路径配置或数据是否有误.`;
    const fileLoaded = response => {
      const result = response && response.result;
      if (result && typeof result === 'object' && result.load) {
        // 处理Manifest配置的别名
        const paths = result.paths || {};
        const outExports = result.exports || {};
        const alias = {};
        Object.keys(paths).map(key => {
          alias[key] = paths[key];
        });
        api.$alias = { ...api.$alias, ...alias };

        // 转换配置项为文件初始请求清单
        const cssList = (result && result.load && result.load.css) || [];
        const filesCss = [];
        cssList.map(item => {
          filesCss.push({ id: item, src: api.$alias[item] || item, type: createjs.AbstractLoader.CSS, exports: null });
        });
        const jsList = (result && result.load && result.load.js) || [];
        const filesJs = [];
        jsList.map(item => {
          filesJs.push({ id: item, src: api.$alias[item] || item, type: createjs.AbstractLoader.JAVASCRIPT, exports: outExports[item] || null });
        });
        // 注销实例对象
        instance.destroy();
        // 返回清单数据
        resolve({ css: filesCss, js: filesJs });
      } else {
        reject(errorMsg);
      }
    };
    const fileLoadError = error => {
      reject(errorMsg);
    };
    instance.on('fileload', fileLoaded, null, true);
    instance.on('error', fileLoadError, null, true);
  });
};

/**
 * 根据静态的Manifest数据转换成指定的对应的JSON数据项
 * @param {Array} manifest 待处理的Manifest数据集合
 */
const handleStaticManifestList = manifest => {
  return new Promise(resolve => {
    const filesCss = [];
    const filesJs = [];
    const result = manifest && Array.isArray(manifest) ? manifest : [];

    result &&
      result.map(item => {
        const file = {};
        // 判断是否是否为Object选项
        if (typeof item === 'object' && item.src) {
          file.id = item.id || item.src;
          file.src = item.src;
          file.exports = item.exports && Array.isArray(item.exports) ? item.exports : null;
          if (item.type && ['javascript', 'css'].indexOf(item.type.toLowerCase()) !== -1) {
            file.type = item.type.toLowerCase();
          }
        } else if (typeof item === 'string') {
          file.id = item;
          file.src = item;
          file.exports = null;
        }
        // 判断文件类型是否还未区分类型，则根据文件地址后缀进行自动判断
        if (!file.type) {
          let suffix = file.src.substring(file.src.lastIndexOf('.') + 1);
          suffix = suffix.split('?')[0].toLowerCase();
          file.type = suffix === 'css' ? 'css' : 'javascript';
        }

        if (file.src && file.id) {
          switch (file.type) {
            case 'css':
              filesCss.push(file);
              break;
            case 'javascript':
            default:
              filesJs.push(file);
              break;
          }
        }
      });

    resolve({ css: filesCss, js: filesJs });
  });
};

const api = {
  // 挂接CreateJs的PreloadJS原生对象
  createjs,

  // 缓存配置文件型Manifest资源清单列表（注意：不会缓存手动加载清单列表）
  $cacheManifest: null,

  // 解析文件路径的别名集合
  $alias: {},

  // 文件资源解析成功的对象缓存
  $caches: {},

  /**
   * 设置全局参数配置选项
   * @param {Object} options 配置选项
   */
  config(options = {}) {
    // 覆盖预加载的基础前缀路径
    if (options.baseUrl) {
      DEFAULT_PRELOAD_OPTIONS.baseUrl = options.baseUrl;
    }
  },

  /**
   * 全局Preloadjs的资源队列请求
   * @param {String} baseUrl 设置基础前缀路径，默认以全局基础路径为缺省；注意，当地址为Http路径或../相对路径时，则拼接时会忽略基础前缀路径；
   */
  getInstance(baseUrl = DEFAULT_PRELOAD_OPTIONS.baseUrl) {
    return new createjs.LoadQueue(false, baseUrl);
  },

  /**
   * 预加载异步请求资源文件，获取对应请求各资源的实例对象
   * @param {Array} manifest 选填项，资源清单数据集，当仅有单一数组传参或2个传参时，此参数有效.
   * @param {Object} options 选填项，参数配置选项，当单一集合传参或2个传参时，此参数有效.
   * @returns 返回Promise对象
   */
  load() {
    let options = {};
    let manifest = null;
    // 判断是否为1个形参数
    if (arguments.length === 1) {
      // 判断唯一的形参值是否为数组格式
      if (Array.isArray(arguments[0])) {
        manifest = arguments[0];
      } else {
        options = arguments[0] || {};
      }
    } else if (arguments.length === 2) {
      // 判断是否为2个形参数
      manifest = arguments[0] && Array.isArray(arguments[0]) ? arguments[0] : [];
      options = arguments[1] || {};
    }
    // 合并默认参数选项
    const opts = merge({}, DEFAULT_PRELOAD_OPTIONS, options);

    return new Promise((resolve, reject) => {
      // 预加载文件清单处理完毕
      const loadFilesReady = data => {
        // 缓存配置文件型的清单列表数据
        if (!manifest && !this.$cacheManifest) {
          this.$cacheManifest = data;
        }
        const filesManifest = [...data.css, ...data.js];
        const outExports = {};
        // 过滤筛选已加载完毕的文件资源
        const manifestList = [];
        filesManifest.map(item => {
          const cacheItem = this.$caches[item.id];
          // 判断是否未缓存未加载，则放入待预处理队列中
          if (!cacheItem || cacheItem.status !== true) {
            manifestList.push(item);
          } else {
            cacheItem.exports && Object.assign(outExports, cacheItem.exports);
          }
        });

        // 判断时有待处理的文件资源清单，则进行预处理加载，反之直接完成
        if (manifestList && manifestList.length) {
          const instance = this.getInstance(opts.baseUrl);
          instance.loadManifest(manifestList);
          instance.maintainScriptOrder = true;
          // 当队列遇到任何错误时触发事件
          const loadError = () => {
            reject('预加载文件时发生解析错误，请检查文件路径或文件格式是否正确.');
          };
          // 当队列中单个文件完成加载时触发事件
          const fileLoaded = response => {
            const { item, result } = response;
            // 记录缓存对象
            const cache = {
              id: item.id,
              src: item.src,
              type: item.type,
              tag: result,
              // 文件预加载完成时的状态，当为True时则成功加载，反之则加载失败
              status: !!(result && result.tagName && ['LINK', 'SCRIPT'].indexOf(result.tagName) !== -1),
            };
            if (item.type === 'javascript') {
              const jsExportsList = item.exports && Array.isArray(item.exports) ? item.exports : [];
              const jsExports = {};
              jsExportsList &&
                jsExportsList.map(key => {
                  if (window[key]) {
                    jsExports[key] = window[key];
                  }
                });
              cache.exports = jsExports;
            } else {
              cache.exports = null;
            }
            // 合并输出对象
            cache.exports && Object.assign(outExports, cache.exports);
            // 缓存输出的全局对象
            this.$caches[item.id] = cache;
            opts.onFileload && typeof opts.onFileload === 'function' && opts.onFileload.call(this, cache);
          };
          // 触发队列请求中进度情况
          const progress = response => {
            const percentage = (response.progress * 100).toFixed(1);
            // 执行请求进度回调
            opts.onProgress && typeof opts.onProgress === 'function' && opts.onProgress.call(this, Number(percentage));
          };
          // 当队列完成加载所有文件时触发事件
          const loadCompleted = () => {
            // 注销实例对象
            instance.destroy();
            resolve(outExports);
          };
          instance.on('fileload', fileLoaded, this, false);
          instance.on('progress', progress, this, false);
          instance.on('error', loadError, this, false);
          instance.on('complete', loadCompleted, this, true);
        } else {
          // 当全部已缓存时，则直接完成并输出对象
          resolve(outExports);
        }
      };

      // 判断是否有资源清单的数据集合
      if (!manifest) {
        if (this.$cacheManifest) {
          loadFilesReady(this.$cacheManifest);
        } else {
          fetchManifestList(opts.baseUrl).then(loadFilesReady);
        }
      } else {
        handleStaticManifestList(manifest).then(loadFilesReady);
      }
    });
  },

  /**
   * 获取指定Id的缓存资源输出对象
   * @param {String} id 文件资源项的Id名
   * @returns 返回导出的对象
   */
  get(id) {
    if (this.$caches[id]) {
      return this.$caches[id].exports;
    }
    return null;
  },

  /**
   * 获取当前所有缓存资源的输出对象集合
   */
  getAll() {
    if (this.$caches) {
      const keys = Object.keys(this.$caches);
      const outExports = {};
      keys.map(key => {
        const out = this.get(key);
        out && Object.assign(outExports, out);
      });
      return outExports;
    }
    return null;
  },

  /**
   * 获取指定Id的缓存资源的标签HTML DOM对象
   * @param {String} id 文件资源项的Id名
   */
  getElement(id) {
    if (this.$caches[id]) {
      const element = this.$caches[id].tag;
      return element instanceof HTMLElement ? element : null;
    }
    return null;
  },
};

export default api;

export { createjs };
