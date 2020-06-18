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
