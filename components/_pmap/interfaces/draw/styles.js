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
    // Point
    'point-color': 'rgba(186, 231, 255, 0.7)',
    'point-radius': 5,
    'point-outline-color': 'rgba(23, 144, 255, 0.9)',
    'point-outline-width': 1.5,
    // Line
    'line-color': 'rgba(23, 144, 255, 0.9)',
    'line-width': 2.5,
    // Polygon
    'polygon-color': 'rgba(23, 144, 255, 0.4)',
    'polygon-outline-color': 'rgba(23, 144, 255, 0.9)',
    'polygon-outline-width': 2.5,
  },
  // 不活动状态
  inactive: {
    // Point
    'point-color': 'rgba(181, 245, 236, 0.7)',
    'point-radius': 5,
    'point-outline-color': 'rgba(20, 194, 194, 0.9)',
    'point-outline-width': 2,
    // Line
    'line-color': 'rgba(20, 194, 194, 0.9)',
    'line-width': 3,
    // Polygon
    'polygon-color': 'rgba(20, 194, 194, 0.4)',
    'polygon-outline-color': 'rgba(20, 194, 194, 0.9)',
    'polygon-outline-width': 3,
  },
  // 活动状态
  active: {
    // Point
    'point-color': 'rgba(255, 216, 191, 0.7)',
    'point-radius': 6,
    'point-outline-color': 'rgba(250, 84, 28, 0.9)',
    'point-outline-width': 2,
    // Line
    'line-color': 'rgba(250, 84, 28, 0.9)',
    'line-width': 3,
    // MoveLine
    'moveline-color': 'rgba(250, 84, 28, 0.6)',
    'moveline-dasharray': [0.8, 2],
    // Polygon
    'polygon-color': 'rgba(250, 84, 28, 0.2)',
    'polygon-outline-color': 'rgba(250, 84, 28, 0.9)',
    'polygon-outline-width': 3,
    // Vertex
    'vertex-color': 'rgba(255, 216, 191, 0.9)',
    'vertex-radius': 4,
    'vertex-outline-color': 'rgba(250, 84, 28, 0.9)',
    'vertex-outline-width': 1.5,
    // MidPoint
  },
};

// 设定绘图的图层结构
export const getDrawLayers = function(theme) {
  return [
    // ----- 非活动状态 -----
    // Polygon Feature要素图层
    {
      id: 'draw-inactive-polygon',
      type: 'polygon',
      options: {
        paint: {
          'fill-color': ['case', ['==', ['get', 'draw:mode'], 'static'], theme.static['polygon-color'], theme.inactive['polygon-color']],
        },
        filter: ['all', ['==', '$type', 'Polygon'], ['==', 'draw:meta', 'feature'], ['!=', 'draw:active', 'true']],
      },
    },
    {
      id: 'draw-inactive-polygon-outline',
      type: 'line',
      options: {
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'draw:mode'], 'static'],
            theme.static['polygon-outline-color'],
            theme.inactive['polygon-outline-color'],
          ],
          'line-width': [
            'case',
            ['==', ['get', 'draw:mode'], 'static'],
            theme.static['polygon-outline-width'],
            theme.inactive['polygon-outline-width'],
          ],
        },
        filter: ['all', ['==', '$type', 'Polygon'], ['==', 'draw:meta', 'feature'], ['!=', 'draw:active', 'true']],
      },
    },
    // Line Feature要素图层
    {
      id: 'draw-inactive-line',
      type: 'line',
      options: {
        paint: {
          'line-color': ['case', ['==', ['get', 'draw:mode'], 'static'], theme.static['line-color'], theme.inactive['line-color']],
          'line-width': ['case', ['==', ['get', 'draw:mode'], 'static'], theme.static['line-width'], theme.inactive['line-width']],
        },
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'draw:meta', 'feature'], ['!=', 'draw:active', 'true']],
      },
    },
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

    // ----- 活动状态 -----
    // Polygon Feature要素图层
    {
      id: 'draw-active-polygon',
      type: 'polygon',
      options: {
        paint: {
          'fill-color': theme.active['polygon-color'],
        },
        filter: ['all', ['==', '$type', 'Polygon'], ['==', 'draw:meta', 'feature'], ['==', 'draw:active', 'true']],
      },
    },
    {
      id: 'draw-active-polygon-outline',
      type: 'line',
      options: {
        paint: {
          'line-color': theme.active['polygon-outline-color'],
          'line-width': theme.active['polygon-outline-width'],
        },
        filter: [
          'all',
          ['==', '$type', 'Polygon'],
          ['==', 'draw:meta', 'feature'],
          ['in', 'draw:mode', 'select', 'edit'],
          ['==', 'draw:active', 'true'],
        ],
      },
    },
    {
      id: 'draw-active-polygon-templine',
      type: 'line',
      options: {
        paint: {
          'line-color': theme.active['polygon-outline-color'],
          'line-width': theme.active['polygon-outline-width'],
        },
        filter: [
          'all',
          ['==', '$type', 'LineString'],
          ['==', 'draw:meta', 'templine'],
          ['==', 'draw:mode', 'polygon'],
          ['==', 'draw:active', 'true'],
        ],
      },
    },
    // Line Feature要素图层
    {
      id: 'draw-active-line',
      type: 'line',
      options: {
        paint: {
          'line-color': theme.active['line-color'],
          'line-width': theme.active['line-width'],
        },
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'draw:meta', 'feature'], ['==', 'draw:active', 'true']],
      },
    },
    // Move Line Feature要素图层
    {
      id: 'draw-active-moveline',
      type: 'line',
      options: {
        paint: {
          'line-color': theme.active['moveline-color'],
          'line-width': ['case', ['==', ['get', 'draw:mode'], 'line'], theme.active['line-width'], theme.active['polygon-outline-width']],
          'line-dasharray': theme.active['moveline-dasharray'],
        },
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'draw:meta', 'moveline'], ['==', 'draw:active', 'true']],
      },
    },
    // Vertex Feature要素图层
    {
      id: 'draw-active-vertex',
      type: 'point',
      options: {
        paint: {
          'circle-color': theme.active['vertex-color'],
          'circle-radius': theme.active['vertex-radius'],
          'circle-stroke-color': theme.active['vertex-outline-color'],
          'circle-stroke-width': theme.active['vertex-outline-width'],
        },
        filter: ['all', ['==', '$type', 'Point'], ['==', 'draw:meta', 'vertex'], ['==', 'draw:active', 'true']],
      },
    },
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
