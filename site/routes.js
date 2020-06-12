import Layout from './components/layout';
import Iframe from './components/iframe';
import demoRoutes from './demoRoutes';

export default [
  {
    path: '/components',
    component: Layout,
    props: route => {
      const name = route.path.split('/components/')[1].split('/')[0];
      return { name, showDemo: true };
    },
    children: demoRoutes,
  },
  {
    path: '/iframe',
    component: Iframe,
    children: demoRoutes.map(item => ({
      ...item,
      props: route => {
        const hash = route.hash.replace('#', '');
        return { iframeName: hash };
      },
    })),
  },
  {
    path: '/',
    component: Layout,
    props: route => {
      const name = route.path.split('/docs/vue/')[1].split('/')[0];
      return { name, showApi: true };
    },
    children: [
      {
        path: 'docs/vue/changelog',
        component: () => import('../docs/vue/changelog.en-US.md'),
      },
      {
        path: 'docs/vue/changelog-cn',
        component: () => import('../docs/vue/changelog.zh-CN.md'),
      },
      {
        path: 'docs/vue/faq',
        component: () => import('../docs/vue/faq.en-US.md'),
      },
      {
        path: 'docs/vue/faq-cn',
        component: () => import('../docs/vue/faq.zh-CN.md'),
      },
      {
        path: 'docs/vue/imapapi',
        component: () => import('../docs/vue/map.en-US.md'),
      },
      {
        path: 'docs/vue/imapapi-cn',
        component: () => import('../docs/vue/map.zh-CN.md'),
      },
      { path: '', redirect: '/docs/vue/changelog-cn/' },
    ],
  },
  { path: '/*', redirect: '/docs/vue/changelog-cn/' },
];
