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
