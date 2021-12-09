<template>
	<el-table
		ref="custom-table"
		:data="tableData.resultData"
		:height="height"
		:highlight-current-row="isRadio"
		:border="false"
		header-align="center"
		style="width: 100%"
		:cell-style="cellColor"
		@row-click="tableClick"
		@current-change="choiceSingle"
		@selection-change="choiceMultiple"
		@row-dblclick="rowDBClick"
	>
		<!--多选-->
		<el-table-column
			v-if="isCheckbox"
			align="center"
			header-align="center"
			type="selection"
			width="55"
		></el-table-column>

		<!--序号-->
		<el-table-column
			v-if="isIndex"
			align="center"
			header-align="center"
			label="任务编号"
			type="index"
			width="100"
		></el-table-column>

		<!--内容列-->
		<el-table-column
			v-for="(item, index) in tableData.needData"
			:key="item[1]"
			:prop="item[0]"
			:label="item[1]"
			:width="item[2]"
			align="center"
			header-align="center"
		>
			<template slot-scope="scope">
				<span
					v-show="!isShowInput"
					:style="{ color: item[3], cursor: item[4] ? 'pointer' : 'normal' }"
					@click.stop="elementClick(item[4], scope, item[0])"
					@dblclick.stop="elementDbClick(scope)"
				>
					{{ item[5] ? item[5] : scope.row[item[0]] }}
				</span>

				<!--用于自定义表格内数据-->
				<div v-show="isShowInput">
					<slot name="custom" v-bind:scope="scope" v-bind:rowKey="item[0]"></slot>
				</div>
			</template>
		</el-table-column>

		<!--操作列-->
		<div v-if="OperateCol.colName">
			<el-table-column
				:label="OperateCol.colName"
				:width="OperateCol.width"
				header-align="center"
				align="center"
				fixed="right"
			>
				<template slot-scope="scope">
					<el-button
						v-for="(item, index) in OperateCol.OperateColData"
						v-show="isShowButton(scope, item.name)"
						:key="item.name"
						size="small"
						type="text"
						@click.native.prevent="colClick(scope.$index, scope.row, item.name)"
					>
						<span :style="{ color: item.color }">{{ item.name }}</span>
					</el-button>
				</template>
			</el-table-column>
		</div>
	</el-table>
</template>

<script>
import { debounce } from './utils';

export default {
	name: 'Table',
	props: {
		// * 表格数据，查询数据以及展示数据
		tableData: {
			type: Object,
			default() {
				return {
					// todo 查询结果数据
					resultData: [
						{
							date: '2016-05-03',
							name: '王小虎',
							province: '上海',
							city: '普陀区',
							address: '上海市普陀区金沙江路 1518 弄',
							zip: 200333,
						},
					],
					// * 字段名 显示名字 列宽度 颜色 是否需要点击事件 操作列名
					needData: [
						['agentName', '代理人', '', '#409EFF', true, false],
						['', '操作', '', '#409EFF', true, '修改'],
					],
				};
			},
		},
		// * 悬浮操作列自定义
		OperateCol: {
			type: Object,
			default() {
				return {
					colName: '',
					width: '200',
					OperateColData: [{ name: '', color: '#409EFF' }],
				};
			},
		},

		// 是否展示输入框
		isShowInput: {
			type: Boolean,
			default: false,
		},

		// * 是否需要过滤按钮
		buttonIsFilter: {
			type: Boolean,
			default: false,
		},

		// * 需要展示的按钮
		needButton: {
			type: Object,
			default() {
				return {
					field: '',
					controlShow: [],
					button: [],
				};
			},
		},

		// 表格高度
		height: {
			type: String,
			default: '600px',
		},

		// 是否需要序号列
		isIndex: {
			type: Boolean,
			default: true,
		},

		// 是否需要复选框
		isCheckbox: {
			type: Boolean,
			default: false,
		},

		// 是否需要单选框
		isRadio: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {};
	},
	computed: {},
	mounted() {
		window.addEventListener('resize', debounce(this.resizeRepaint, 150));
	},
	methods: {
		// * 表格中元素的单击
		elementClick(isClick, row, colName) {
			if (isClick) {
				this.$emit('cell-click', row, colName);
			}
		},

		// * 表格中元素的双击
		elementDbClick(scope) {
			this.$emit('ele-db-click', scope);
		},

		// * 某一行的双击
		rowDBClick(row, col, e) {
			this.$emit('row-dblclick', row, col, e);
		},

		// * 单选多选方式
		choiceSingle(val) {
			this.isRadio && this.$emit('choice-single-multiple', val);
		},
		choiceMultiple(val) {
			this.$emit('choice-single-multiple', val);
		},

		// * 操作列点击
		colClick(index, rows, currentCol) {
			this.$emit('operate-col', index, rows, currentCol);
		},

		// * 控制是否展示条件中的按钮
		isShowButton(scope, name) {
			if (this.buttonIsFilter === false) return true;

			if (this.buttonIsFilter) {
				const value = scope.row[this.needButton.field];
				const isShowArr = this.needButton.controlShow;
				const buttonArr = this.needButton.button;

				const a = isShowArr.findIndex((item) => {
					return item === value;
				});

				if (a === -1) {
					return true;
				} else if (a > -1) {
					const b = buttonArr.findIndex((item) => {
						return item === name;
					});
					return b > -1;
				}
			}
		},

		cellColor(row) {},

		tableClick(row, column, cell, event) {},

		resizeRepaint() {
			this.$refs['custom-table'].doLayout();
		},
	},
};
</script>

<style lang="less" scoped></style>
