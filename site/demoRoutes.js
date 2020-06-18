export default [
  {
    path: 'preload',
    component: () => import('../components/preload/demo/index.vue'),
  },
  {
    path: 'preload-cn',
    component: () => import('../components/preload/demo/index.vue'),
  },
  {
    path: 'map',
    component: () => import('../components/map/demo/index.vue'),
  },
  {
    path: 'map-cn',
    component: () => import('../components/map/demo/index.vue'),
  },

  {
    path: 'tianditu',
    component: () => import('../components/map/demo/examples/Providers/Tianditu/index.vue'),
  },
  {
    path: 'tianditu-cn',
    component: () => import('../components/map/demo/examples/Providers/Tianditu/index.vue'),
  },
  {
    path: 'baidu',
    component: () => import('../components/map/demo/examples/Providers/Baidu/index.vue'),
  },
  {
    path: 'baidu-cn',
    component: () => import('../components/map/demo/examples/Providers/Baidu/index.vue'),
  },

  {
    path: 'drag-pan',
    component: () => import('../components/map/demo/examples/Handlers/DragPan/index.vue'),
  },
  {
    path: 'drag-pan-cn',
    component: () => import('../components/map/demo/examples/Handlers/DragPan/index.vue'),
  },
  {
    path: 'drag-rotate',
    component: () => import('../components/map/demo/examples/Handlers/DragRotate/index.vue'),
  },
  {
    path: 'drag-rotate-cn',
    component: () => import('../components/map/demo/examples/Handlers/DragRotate/index.vue'),
  },
  {
    path: 'scroll-zoom',
    component: () => import('../components/map/demo/examples/Handlers/ScrollZoom/index.vue'),
  },
  {
    path: 'scroll-zoom-cn',
    component: () => import('../components/map/demo/examples/Handlers/ScrollZoom/index.vue'),
  },
  {
    path: 'box-zoom',
    component: () => import('../components/map/demo/examples/Handlers/BoxZoom/index.vue'),
  },
  {
    path: 'box-zoom-cn',
    component: () => import('../components/map/demo/examples/Handlers/BoxZoom/index.vue'),
  },
  {
    path: 'keyboard',
    component: () => import('../components/map/demo/examples/Handlers/Keyboard/index.vue'),
  },
  {
    path: 'keyboard-cn',
    component: () => import('../components/map/demo/examples/Handlers/Keyboard/index.vue'),
  },
  {
    path: 'double-click-zoom',
    component: () => import('../components/map/demo/examples/Handlers/DoubleClickZoom/index.vue'),
  },
  {
    path: 'double-click-zoom-cn',
    component: () => import('../components/map/demo/examples/Handlers/DoubleClickZoom/index.vue'),
  },
  {
    path: 'zoom-in-out',
    component: () => import('../components/map/demo/examples/Handlers/ZoomInOut/index.vue'),
  },
  {
    path: 'zoom-in-out-cn',
    component: () => import('../components/map/demo/examples/Handlers/ZoomInOut/index.vue'),
  },
  {
    path: 'cursor',
    component: () => import('../components/map/demo/examples/Handlers/Cursor/index.vue'),
  },
  {
    path: 'cursor-cn',
    component: () => import('../components/map/demo/examples/Handlers/Cursor/index.vue'),
  },

  {
    path: 'fullscreen',
    component: () => import('../components/map/demo/examples/Interfaces/Fullscreen/index.vue'),
  },
  {
    path: 'fullscreen-cn',
    component: () => import('../components/map/demo/examples/Interfaces/Fullscreen/index.vue'),
  },
  {
    path: 'measure',
    component: () => import('../components/map/demo/examples/Interfaces/Measure/index.vue'),
  },
  {
    path: 'measure-cn',
    component: () => import('../components/map/demo/examples/Interfaces/Measure/index.vue'),
  },
  {
    path: 'draw',
    component: () => import('../components/map/demo/examples/Interfaces/Draw/index.vue'),
  },
  {
    path: 'draw-cn',
    component: () => import('../components/map/demo/examples/Interfaces/Draw/index.vue'),
  },

  {
    path: 'marker',
    component: () => import('../components/map/demo/examples/Marker/index.vue'),
  },
  {
    path: 'marker-cn',
    component: () => import('../components/map/demo/examples/Marker/index.vue'),
  },
  {
    path: 'popup',
    component: () => import('../components/map/demo/examples/Popup/index.vue'),
  },
  {
    path: 'popup-cn',
    component: () => import('../components/map/demo/examples/Popup/index.vue'),
  },
];
