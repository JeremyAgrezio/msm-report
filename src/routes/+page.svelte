<script lang="ts">
	import MapBox from '$lib/map/MapBox.svelte';
	import Lightings from '$lib/formTypes/Lightings.svelte';

	let selected: string;
	const typesShowMap = [1, 2, 3];

	enum reportType {
		'Lighting' = 1,
		'Illegal dumping' = 2,
		'Roadways' = 3,
		'Other' = 4
	}

	const reportTypeOptions = Object.entries(reportType).filter(([key, value]) => isNaN(Number(key)));
</script>

<svelte:head>
	<title>Report</title>
	<meta name="description" content="Mont-Saint-Martin's report app" />
</svelte:head>

<section>
	<h1>Reporting form</h1>
	<h2>
		Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque eleifend lacinia finibus. Duis
		mollis velit at orci condimentum dignissim. Integer ligula velit, finibus sit amet enim eu,
		suscipit facilisis ipsum.
	</h2>
	<form method="POST" action="?/report">
		<div class="form">
			<div class="mb-3 me-3">
				<label for="lastName" class="form-label">Last name</label>
				<input type="text" class="form-control" name="lastName" placeholder="Your last name" />
			</div>
			<div class="mb-3 me-3">
				<label for="firstName" class="form-label">First name</label>
				<input type="text" class="form-control" name="firstName" placeholder="Your first name" />
			</div>
			<div class="mb-3 me-3">
				<label for="email" class="form-label">Email address</label>
				<input type="text" class="form-control" name="email" placeholder="john.doe@email.fr" />
			</div>
			<div class="mb-3 me-3">
				<label for="phone" class="form-label">Phone number</label>
				<input type="text" class="form-control" name="phone" placeholder="062642****" />
			</div>
			<div class="mb-3 me-3">
				<label for="reportType" class="form-label">Report Type</label>
				<select class="form-control" id="reportType" bind:value={selected}>
					<option value="" selected>Choose...</option>
					{#each reportTypeOptions as [key, value]}
						<option {value}>{key}</option>
					{/each}
				</select>
			</div>
			{#if parseInt(selected) === reportType['Lighting']}
				<Lightings />
      {:else if parseInt(selected) === reportType['Illegal dumping']}
        <div></div>
			{/if}
		</div>

		{#if typesShowMap.includes(parseInt(selected))}
			<div class="map">
				<MapBox />
			</div>
		{/if}
	</form>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
		padding: 10px;
	}

	h1 {
		margin-bottom: 0.5em;
		width: 100%;
	}

	h2 {
		max-width: 32em;
		text-align: justify;
		margin-bottom: 1em;
	}

	.form {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		padding: 10px;
		width: 100%;
	}

	.map {
		width: 100%;
		height: 300px;
		margin-top: 10px;
	}

	@media (max-width: 768px) {
		.form {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 480px) {
		h2 {
			text-align: left;
		}
	}
</style>
