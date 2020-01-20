<script>
export default {
  props: {
    isCN: Boolean,
  },
  render() {
    const isCN = this.isCN;
    return (
      <footer id="footer">
        <div class="footer-wrap">
          <a-row>
            <a-col md={8} sm={24} xs={24}>
              <div class="footer-center">
                <h2>Ant Design</h2>
                <div>
                  <a href="https://github.com/PJtools/pjtools-map-vue" target="_blank ">
                    <span>GitHub</span>
                  </a>
                  <span></span>
                  <span>
                    <i class="anticon anticon-github"></i>
                  </span>
                </div>
                <div>
                  <a href="https://ant.design/docs/react/introduce-cn" target="_blank">
                    Ant Design
                  </a>
                  <span> - </span>
                  <span>React</span>
                </div>
                <div>
                  <a href="https://www.antdv.com/docs/vue/introduce-cn/" target="_blank">
                    Ant Design
                  </a>
                  <span> - </span>
                  <span>Vue</span>
                </div>
                <div>
                  <a href="https://ng.ant.design/docs/introduce/zh" target="_blank">
                    Ant Design
                  </a>
                  <span> - </span>
                  <span>Angular</span>
                </div>
                <div>
                  <a href="https://github.com/websemantics/awesome-ant-design" target="_blank ">
                    <span>Awesome Ant Design</span>
                  </a>
                </div>
              </div>
            </a-col>
            <a-col md={8} sm={24} xs={24}>
              <div class="footer-center">
                <h2>{isCN ? '资源链接' : 'Resources'}</h2>
                <div>
                  <a href="https://cn.vuejs.org/" target="_blank">
                    Vue
                  </a>
                </div>
                <div>
                  <a href="https://cli.vuejs.org/" target="_blank">
                    Vue CLI
                  </a>
                </div>
                <div>
                  <a href="http://library.ant.design/" rel="noopener noreferrer" target="_blank">
                    AntD Library
                  </a>
                </div>
              </div>
            </a-col>
            <a-col md={8} sm={24} xs={24}>
              <div class="footer-center">
                <h2>
                  <img
                    alt=""
                    class="title-icon"
                    src="https://gw.alipayobjects.com/zos/rmsportal/nBVXkrFdWHxbZlmMbsaH.svg"
                  />
                  <span>{isCN ? '更多产品' : 'More Products'}</span>
                </h2>
                <div>
                  <a href="https://antv.alipay.com/" rel="noopener noreferrer" target="_blank">
                    AntV
                  </a>
                  <span> - </span>
                  <span>{isCN ? '数据可视化' : 'Data Visualization'}</span>
                </div>
                <div>
                  <a href="https://eggjs.org/" rel="noopener noreferrer" target="_blank">
                    Egg
                  </a>
                  <span> - </span>
                  <span>{isCN ? '企业级 Node 开发框架' : 'Enterprise Node Framework'}</span>
                </div>
              </div>
            </a-col>
          </a-row>
        </div>
      </footer>
    );
  },
};
</script>
