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
                  <span> - </span>
                  <span>PJtools-Map-Vue</span>
                </div>
                <div>
                  <a href="https://www.antdv.com/docs/vue/introduce-cn/" target="_blank">
                    Ant Design
                  </a>
                  <span> - </span>
                  <span>Vue</span>
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
              </div>
            </a-col>
            <a-col md={8} sm={24} xs={24}>
              <div class="footer-center">
                <h2>{isCN ? '更多产品' : 'More Products'}</h2>
                <div>
                  <a href="http://192.168.100.231:8888/geomap-api/js_mapbox.html" rel="noopener noreferrer" target="_blank">
                    GeoGlobe
                  </a>
                  <span> - </span>
                  <span>mapboxgl</span>
                </div>
                <div>
                  <a href="https://docs.mapbox.com/mapbox-gl-js/api" rel="noopener noreferrer" target="_blank">
                    Mapbox GL
                  </a>
                  <span> - </span>
                  <span>Javascript</span>
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
