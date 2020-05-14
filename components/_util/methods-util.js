/**
 * @文件说明: 定义函数方法的工具类
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-03-11 22:23:05
 */

import {
  isArray as isAntdArray,
  isInteger as isAntdInteger,
  isFunction as isAntdFunction,
  has as antdHas,
} from 'ant-design-vue/es/_util/vue-types/utils';

/**
 * 获取转换的前缀ClassName名称
 * @param {string} suffixCls 前缀Class名
 * @param {string} customizePrefixCls 自定义前缀Class名
 */
export const getPrefixCls = (suffixCls, customizePrefixCls) => {
  if (customizePrefixCls) return customizePrefixCls;
  return `pjtools-${suffixCls}`;
};

/**
 * 判断是否为字符串类型
 * @param {string} value 待判断的值
 */
export const isString = value => {
  return !!(typeof value === 'string');
};

/**
 * 判断是否为数值（包括：字符串型数值）
 * @param {number} value 待判断的数值
 */
export const isNumeric = value => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * 判断是否为Function型函数
 * @param {function} value 待判断的对象
 */
export const isFunction = isAntdFunction;

/**
 * 判断是否为Array数组类型
 * @param {array} value 待判断的对象
 */
export const isArray = isAntdArray;

/**
 * 判断是否为非零长度的Array数组类型
 * @param {array} value 待判断的对象
 */
export const isNotEmptyArray = value => {
  return !!(isArray(value) && value.length);
};

/**
 * 判断是否为Boolean布尔类型
 * @param {boolean} value 待判断的对象
 */
export const isBoolean = value => {
  return typeof value === 'boolean';
};

/**
 * 判断是否为布尔类型的True值
 * @param {boolean} value 待判断的对象
 */
export const isBooleanTrue = value => {
  return !!(isBoolean(value) && value === true);
};

/**
 * 判断是否为布尔类型的False值
 * @param {boolean} value 待判断的对象
 */
export const isBooleanFlase = value => {
  return !!(isBoolean(value) && value === false);
};

/**
 * 判断是否为Integer整数类型
 * @param {number} value 待判断的对象
 */
export const isInteger = isAntdInteger;

/**
 * 判断是否为空值，其中：undefined， null，''， NaN，false，[]，{}，不包括数值0
 * @param {any} value 待判断的对象
 */
export const isEmpty = value => {
  switch (typeof value) {
    case 'undefined':
      return true;
    case 'string':
      if (value.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, '').length === 0) {
        return true;
      }
      break;
    case 'boolean':
      if (!value) {
        return true;
      }
      break;
    case 'number':
      if (isNaN(value)) {
        return true;
      }
      break;
    case 'object':
      if (null === value || value.length === 0) {
        return true;
      }
      for (let i in value) {
        return false;
      }
      return true;
  }
  return false;
};

/**
 * 判断Object对象是否存在属性名
 * @param {number} obj Object对象
 * @param {string} prop 待检查的属性名
 */
export const has = antdHas;

/**
 * 判断是否为Http形式的链接地址
 * @param {string} value 待检查的链接地址
 */
export const isHttpUrl = value => {
  const reg = new RegExp('(https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]');
  return reg.test(value);
};

/**
 * 判断是否为地图Map的坐标数组结构
 * @param {string} value 待检查的地理坐标
 */
export const isCoordinate = value => {
  if (value && isArray(value) && value.length === 2) {
    if (typeof value[0] === 'number' && typeof value[1] === 'number') {
      if (value[0] === 0 && value[1] === 0) {
        return false;
      }
      return true;
    }
  }
  return false;
};

/**
 * 在DOM对象上添加Class类名
 * @param {Element} el DOM对象
 * @param {string} cls 待添加的ClassName名
 */
export const addClass = (el, cls) => {
  if (!cls || !(cls = cls.trim())) {
    return;
  }

  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(c => el.classList.add(c));
    } else {
      el.classList.add(cls);
    }
  } else {
    const cur = ` ${el.getAttribute('class') || ''} `;
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim());
    }
  }
};

/**
 * 在DOM对象上移除Class类名
 * @param {Element} el DOM对象
 * @param {string} cls 待移除的ClassName名
 */
export const removeClass = (el, cls) => {
  if (!cls || !(cls = cls.trim())) {
    return;
  }

  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(c => el.classList.remove(c));
    } else {
      el.classList.remove(cls);
    }
    if (!el.classList.length) {
      el.removeAttribute('class');
    }
  } else {
    let cur = ` ${el.getAttribute('class') || ''} `;
    const tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    cur = cur.trim();
    if (cur) {
      el.setAttribute('class', cur);
    } else {
      el.removeAttribute('class');
    }
  }
};

/**
 * 将相对路径地址转换成绝对路径地址
 * @param {string} url 待转换的相对路径
 * @param {string} prefix 前缀路径
 */
export const getUrlToLink = (url, prefix = null) => {
  if (prefix) {
    url = prefix + '/' + url;
  }
  url = url.replace(/\/\/\//g, '/').replace(/\/\//g, '/');
  // 借助浏览器等链接能力辅助转化
  const link = document.createElement('a');
  link.href = url;
  return link.href;
};

/**
 * 通过异步Fetch请求JS文件，读取文件流并解析
 * @param {string} url 待请求的JS文件路径地址
 */
export const fetchJsFile = url => {
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: 'GET',
    })
      .then(response => {
        response &&
          response.text().then(data => {
            try {
              const json = data && eval(data);
              resolve(json);
            } catch (e) {
              resolve(null);
            }
          });
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * 通过GET异步Fetch请求JSON数据
 * @param {string} url 待请求的地址
 */
export const fetchGetJson = url => {
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: 'GET',
    })
      .then(response => {
        response &&
          response
            .json()
            .then(data => {
              resolve(data);
            })
            .catch(error => {
              reject(error);
            });
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * 通过POST异步Fetch请求JSON数据
 * @param {string} url 待请求的地址
 */
export const fetchPostJson = (url, data = {}) => {
  return new Promise((resolve, reject) => {
    let formdata = '';
    Object.keys(data).map((key, idx) => {
      if (idx !== 0) {
        formdata += '&';
      }
      formdata += `${encodeURIComponent(key)}=${typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]}`;
    });

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: formdata,
    })
      .then(response => {
        response &&
          response
            .json()
            .then(data => {
              resolve(data);
            })
            .catch(error => {
              reject(error);
            });
      })
      .catch(error => {
        reject(error);
      });
  });
};
