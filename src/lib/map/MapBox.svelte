<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
	import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
	import msmBorder from '$lib/map/geojson/msmBorder.json';
	import type { GeoJSONPolygon } from '$lib/types';

	let map: mapboxgl.Map;
	let mapContainer: HTMLDivElement;
	let lng: number = 5.7823;
	let lat: number = 49.5495;
	let zoom: number = 11;
	let markers: mapboxgl.Marker[] = [];
	let inMarker = false;

	onMount(() => {
		initializeMap();
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
		markers.forEach((marker) => marker.remove());
	});

	function initializeMap() {
		const initialState = { lng, lat, zoom };

		mapboxgl.accessToken =
			'pk.eyJ1IjoiamVyZW15YWdyIiwiYSI6ImNqbmxoMWFiYTFkaHMza3RhMW92azBvNWoifQ.qnV_rJsj9xUVWLlqSJby4w';

		try {
			map = new mapboxgl.Map({
				container: mapContainer,
				center: [initialState.lng, initialState.lat],
				zoom: initialState.zoom,
				style: 'mapbox://styles/mapbox/satellite-streets-v12',
				attributionControl: false
			});

			setMapBounds(initialState);
			addGeocoderControl();
			map.on('load', onMapLoad);
			map.on('move', updateData);
			map.on('click', onMapClick);
		} catch (error) {
			console.error('Error initializing map:', error);
		}
	}

	function setMapBounds(initialState: { lng: number; lat: number; zoom: number }) {
		const bounds = new mapboxgl.LngLatBounds(
			[initialState.lng - 0.06, initialState.lat - 0.06],
			[initialState.lng + 0.06, initialState.lat + 0.06]
		);
		map.setMaxBounds(bounds);
	}

	function addGeocoderControl() {
		const geocoder = new MapboxGeocoder({
			accessToken: mapboxgl.accessToken,
			mapboxgl: mapboxgl,
			countries: 'FR',
			language: 'fr'
		});

		geocoder.on('results', (e) => {
			e.features = e.features.filter(
				(feature: { geometry: { type: string; coordinates: number[] } }) => {
					if (feature.geometry.type === 'Point') {
						return isPointInPolygon(
							feature.geometry.coordinates,
							msmBorder.geometry.coordinates[0]
						);
					}
					return false;
				}
			);
		});

		map.addControl(geocoder);
	}

	function onMapLoad() {
		map.addSource('msm', {
			type: 'geojson',
			data: {
				type: 'FeatureCollection',
				features: [
					msmBorder as GeoJSONPolygon,
					{
						type: 'Feature',
						geometry: {
							type: 'Point',
							coordinates: [5.7815, 49.55]
						},
						properties: {
							nom: 'Mont-Saint-Martin'
						}
					}
				]
			}
		});

		addLayers();
	}

	function addLayers() {
		addBgLayer();
		addOutlineLayer();
		addCityNameLayer();
	}

	function addBgLayer() {
		map.addLayer({
			id: 'msm',
			type: 'fill',
			source: 'msm',
			layout: {},
			paint: {
				'fill-color': '#ffa500',
				'fill-opacity': 0.5
			}
		});
	}

	function addOutlineLayer() {
		map.addLayer({
			id: 'outline',
			type: 'line',
			source: 'msm',
			layout: {},
			paint: {
				'line-color': '#ffa500',
				'line-width': 3
			}
		});
	}

	function addCityNameLayer() {
		map.addLayer({
			id: 'msm-symbol',
			type: 'symbol',
			source: 'msm',
			layout: {
				'text-field': ['get', 'nom'],
				'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
				'text-offset': [0, 1.25],
				'text-anchor': 'top'
			},
			paint: {
				'text-color': '#000000',
				'text-halo-color': '#ffffff',
				'text-halo-width': 1
			}
		});
	}

	function updateData() {
		zoom = map.getZoom();
		lng = map.getCenter().lng;
		lat = map.getCenter().lat;

		const visibility = zoom > 12 ? 'none' : 'visible';
		map.setLayoutProperty('msm', 'visibility', visibility);
		map.setLayoutProperty('msm-symbol', 'visibility', visibility);
	}

	function onMapClick(e: mapboxgl.MapMouseEvent & mapboxgl.EventData) {
		if (zoom >= 14 && !inMarker) {
			const point = [e.lngLat.lng, e.lngLat.lat];
			const isInside = isPointInPolygon(point, msmBorder.geometry.coordinates[0]);

			if (isInside) {
				addPin(e.lngLat);
			}
		}
	}

	async function reverseGeocode(lngLat: mapboxgl.LngLat): Promise<string> {
		const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${mapboxgl.accessToken}&types=address&limit=1`;
		const response = await fetch(url);
		const data = await response.json();
		const feature = data.features[0];

		if (feature) {
			const streetNumber = feature.address || '';
			const streetName = feature.text || '';
			return `${streetNumber} ${streetName}`.trim() || 'Adresse inconnue';
		} else {
			return 'Adresse inconnue';
		}
	}
	
	async function addPin(lngLat: mapboxgl.LngLat) {
		const address = await reverseGeocode(lngLat);

		const popup = new mapboxgl.Popup({ offset: 25 }).setText(address);
		const marker = new mapboxgl.Marker().setLngLat(lngLat).setPopup(popup).addTo(map);

		const markerElement = marker.getElement();
		markerElement.style.cursor = 'pointer';

		markerElement.addEventListener('mouseenter', () => {
			inMarker = true;
			map.getCanvas().style.cursor = 'pointer';
			marker.togglePopup();
		});

		markerElement.addEventListener('mouseleave', () => {
			inMarker = false;
			map.getCanvas().style.cursor = '';
			marker.togglePopup();
		});

		markerElement.addEventListener('click', () => {
			marker.remove();
			markers = markers.filter((m) => m !== marker);
			map.getCanvas().style.cursor = '';
			setTimeout(() => {
				inMarker = false;
			}, 0);
		});

		markers.push(marker);
	}

	function isPointInPolygon(point: number[], polygon: number[][]) {
		let isInside = false;
		for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
			const xi = polygon[i][0],
				yi = polygon[i][1];
			const xj = polygon[j][0],
				yj = polygon[j][1];

			const intersect =
				yi > point[1] !== yj > point[1] &&
				point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi;
			if (intersect) isInside = !isInside;
		}
		return isInside;
	}
</script>

<div class="map">
	<div class="sidebar">
		Longitude: {lng.toFixed(4)} | Latitude: {lat.toFixed(4)} | Zoom: {zoom.toFixed(2)}
	</div>
	<div class="map-wrap">
		<div class="map" bind:this={mapContainer}></div>
	</div>
</div>

<style>
	.map {
		width: 100%;
		height: 300px;
	}
	.sidebar {
		display: none;
		position: absolute;
		zoom: 0.8;
		background-color: rgba(35, 55, 75, 0.9);
		color: #fff;
		padding: 6px 12px;
		font-family: monospace;
		z-index: 1;
		margin: 12px;
		border-radius: 4px;
	}
</style>
