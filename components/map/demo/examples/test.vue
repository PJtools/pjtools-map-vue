<template>
	<div style="margin: 10px;">
		<pj-map bordered height="700" 
						baseUrl="/static/GeoMap/" 
						config="../MapConfig/map.config.js"
						@loaded="handleMapLoaded">
		</pj-map>
	</div>
</template>

<script>
  export default {
		props: ['id'],
		data () {
			return {
				iMapApi: null
			};
		},
		methods: {
			handleMapLoaded(iMapApi) {
				this.iMapApi = iMapApi;
				console.log('loaded');
			},
		}
	}
</script>
