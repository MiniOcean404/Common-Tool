<template>
	<div class="block">
		<el-pagination
			background
			@current-change="currentPageChangeHandle"
			:current-page="pageOption.currentPage"
			:layout="layout"
			:total="pageOption.total"
			:page-size="pageOption.pageSize"
			@size-change="sizeChange"
		></el-pagination>
	</div>
</template>

<script>
export default {
	name: 'Pagination',
	props: {
		pageOption: {
			type: Object,
			default() {
				return {
					currentPage: 1,
					total: 100,
					pageSize: 10,
				};
			},
		},
		layout: {
			type: String,
			default: 'total, sizes, prev, pager, next, jumper',
		},
	},
	methods: {
		currentPageChangeHandle(currentPage) {
			this.$emit('currentPageChange', currentPage);
		},
		sizeChange(size) {
			this.$emit('size-change', size);
		},
	},
};
</script>

<style scoped lang="scss">
.block {
	display: flex;
	justify-content: flex-end;
	margin: 20px 0 0 0;
}
</style>
