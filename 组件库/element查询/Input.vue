<template>
	<div class="up_content">
		<slot name="up" v-bind:queryData="queryData"></slot>

		<div class="button">
			<slot name="button"></slot>
		</div>

		<slot></slot>

		<div class="tab">
			<slot name="tab"></slot>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Input',
	props: {
		queryData: {
			type: Object,
			default() {
				return {}
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.up_content {
	.button {
		display: flex;
		justify-content: flex-end;
	}
}
</style>
