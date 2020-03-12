<template>
	<div style="margin: 10px;">
		<pj-map height="600" bordered>
		</pj-map>
	</div>
</template>

<script>
  export default {
		props: ['id'],
		data () {
			return {
			};
		},
		mounted () {
			// this.$preload.load({
			// 	baseUrl: '/static/GeoMap/'
			// }).then((exports) => {
			// 	console.log(exports);
			// });
		}
	}
</script>
