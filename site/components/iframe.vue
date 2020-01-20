<script>
export default {
  props: {
    name: String,
    hash: String,
  },
  provide() {
    return {
      demoContext: this,
    };
  },
  render() {
    return (
      <div id="iframe-page">
        <router-view></router-view>
      </div>
    );
  },
};
</script>
