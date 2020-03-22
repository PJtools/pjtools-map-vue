<template>
	<div style="margin: 10px;">
		<pj-map bordered height="600" 
						baseUrl="/static/GeoMap/" 
						config="../MapConfig/map.config.js" 
						@loaded="handleMapLoaded">
		</pj-map>
	</div>
</template>

<script>
	import config from '../../../site/static/MapConfig/map.config';

  export default {
		props: ['id'],
		data () {
			return {
				iMapApi: null,
			};
		},
		methods: {
			handleMapLoaded(iMapApi) {
				this.iMapApi = iMapApi;
				console.log('loaded');

				// window.setTimeout(() => {
				// 	console.log('start');
				// 	const layer = iMapApi.Services.getServicesLayer('XYZTile', 'abc', 'http://t0.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${token}', {
				// 		proxy: false
				// 	});
				// 	console.log(layer);
				// }, 3000);
			}
		}
	}
</script>
