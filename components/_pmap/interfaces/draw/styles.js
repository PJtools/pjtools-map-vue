/**
 * @文件说明: 定义Draw绘图的默认图形样式
 * @创建人: pjtools@vip.qq.com
 * @创建时间: 2020-05-21 16:54:57
 */

import Constants from './constants';

// 图层样式的参数主题
export const defaultDrawTheme = {
  // 静态状态
  static: {
    'point-color': 'rgba(186, 231, 255, 0.7)',
    'point-radius': 5,
    'point-outline-color': 'rgba(23, 144, 255, 0.9)',
    'point-outline-width': 1.5,
  },
  // 不活动状态
  inactive: {
    'point-color': 'rgba(181, 245, 236, 0.7)',
    'point-radius': 5,
    'point-outline-color': 'rgba(20, 194, 194, 0.9)',
    'point-outline-width': 2,
  },
  // 活动状态
  active: {
    'point-color': 'rgba(255, 216, 191, 0.7)',
    'point-radius': 6,
    'point-outline-color': 'rgba(250, 84, 28, 0.9)',
    'point-outline-width': 2,
  },
};

// 设定绘图的图层结构
export const getDrawLayers = function(theme) {
  return [
    // ----- 非活动状态 -----
    // Point Feature要素图层
    {
      id: 'draw-inactive-point',
      type: 'point',
      options: {
        paint: {
          'circle-color': ['case', ['==', ['get', 'draw:mode'], 'static'], theme.static['point-color'], theme.inactive['point-color']],
          'circle-radius': ['case', ['==', ['get', 'draw:mode'], 'static'], theme.static['point-radius'], theme.inactive['point-radius']],
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'draw:mode'], 'static'],
            theme.static['point-outline-color'],
            theme.inactive['point-outline-color'],
          ],
          'circle-stroke-width': [
            'case',
            ['==', ['get', 'draw:mode'], 'static'],
            theme.static['point-outline-width'],
            theme.inactive['point-outline-width'],
          ],
        },
        filter: ['all', ['==', '$type', 'Point'], ['==', 'draw:meta', 'feature'], ['!=', 'draw:active', 'true']],
      },
    },

    // // ----- 活动状态 -----
    // Point Feature要素图层
    {
      id: 'draw-active-point',
      type: 'point',
      options: {
        paint: {
          'circle-color': theme.active['point-color'],
          'circle-radius': theme.active['point-radius'],
          'circle-stroke-color': theme.active['point-outline-color'],
          'circle-stroke-width': theme.active['point-outline-width'],
        },
        filter: ['all', ['==', '$type', 'Point'], ['==', 'draw:meta', 'feature'], ['==', 'draw:active', 'true']],
      },
    },
  ];
};
