<template>
	<div style="margin: 10px;">
		<pj-map bordered height="600" baseUrl="/static/GeoMap/" config="../MapConfig/map.config.js"></pj-map>
	</div>
</template>

<script>
	import config from '../../../site/static/MapConfig/map.config';

  export default {
		props: ['id'],
		data () {
			return {
			};
		},
		mounted () {
		}
	}
</script>
