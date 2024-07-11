<script lang="ts"> 
    let selected: string;
</script>

<!--
<div class="mb-3 me-3">
    <label for="lastName" class="form-label">Last name</label>
    <input type="text" class="form-control" name="lastName" placeholder="Your last name" />
</div>
-->
<div class="mb-3 me-3">
    <label for="reportProblem" class="form-label">Report Problem</label>
    <select class="form-control" id="reportProblem" bind:value={selected}>
        <option selected>Choose...</option>
        <option value="1">Lights on, during the day</option>
        <option value="2">Lights off at night</option>
        <option value="3">Damaged post</option>
        <option value="4">Broken light</option>
        <option value="5">Degraded or non-functional traffic lights</option>
    </select>
</div>