export default [
  {
    path: 'map',
    component: () => import('../components/map/demo/index.vue'),
  },
  {
    path: 'map-cn',
    component: () => import('../components/map/demo/index.vue'),
  },
  {
    path: 'preload',
    component: () => import('../components/preload/demo/index.vue'),
  },
  {
    path: 'preload-cn',
    component: () => import('../components/preload/demo/index.vue'),
  },
];
