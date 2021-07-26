<template>
	<el-table
		:cell-style="cellColor"
		:data="tableData.resultData"
		:height="height"
		:highlight-current-row="isRadio"
		border
		style="width: 100%"
		@row-click="tableClick"
		@current-change="handleSelectionChange"
		@selection-change="handleSelectionChange"
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
			label="序号"
			type="index"
			width="50"
		></el-table-column>

		<!--内容列-->
		<el-table-column
			v-for="(item, index) in tableData.needData"
			:key="index"
			:label="item[1]"
			:prop="item[0]"
			:width="item[2]"
			align="center"
			header-align="center"
		>
			<template slot-scope="scope">
				<span
					:style="{ color: item[3], cursor: item[4] ? 'pointer' : 'normal' }"
					@click.stop="handleRowClick(item[4], scope.row)"
				>
					{{ item[5] === true ? item[6] : scope.row[item[0]] }}
				</span>
			</template>
		</el-table-column>

		<div v-if="OperateCol.isOperateCol">
			<!--操作列-->
			<el-table-column
				:label="OperateCol.colName"
				:width="OperateColWidth"
				align="center"
				fixed="right"
				header-align="center"
			>
				<template slot-scope="scope">
					<el-button
						v-for="(item, index) in OperateCol.OperateColData"
						v-show="isShowButton(scope, item.name)"
						:key="item.name"
						size="small"
						type="text"
						@click.native.prevent="operateHandle(scope.$index, scope.row, item.name)"
					>
						<span :style="{ color: item.color }">{{ item.name }}</span>
					</el-button>
				</template>
			</el-table-column>
		</div>
	</el-table>
</template>

<script>
export default {
	name: 'Table',
	props: {
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
							zip: 200333
						}
					],
					// todo 字段名 显示名字 列宽度
					needData: [
						['agentName', '代理人', '', '#409EFF', true, false],
						['agentName', '代理人', '', '#409EFF', true, false]
					]
				}
			}
		},
		// todo 操作列自定义
		OperateCol: {
			type: Object,
			default() {
				return {
					isOperateCol: false,
					colName: '操作',
					OperateColData: [{ name: '移除', color: '#409EFF' }]
				}
			}
		},
		// todo 操作列宽度
		OperateColWidth: {
			type: String,
			default: '200'
		},

		buttonIsFilter: {
			type: Boolean,
			default: false
		},
		// todo 需要展示的按钮
		needButton: {
			type: Object,
			default() {
				return {
					field: '',
					controlShow: [],
					button: []
				}
			}
		},
		height: {
			type: String,
			default: '530px'
		},
		isIndex: {
			type: Boolean,
			default: true
		},
		isCheckbox: {
			type: Boolean,
			default: false
		},
		isRadio: {
			type: Boolean,
			default: false
		}
	},
	computed: {},
	methods: {
		// todo 操作列方式
		operateHandle(index, rows, currentCol) {
			this.$emit('operateHandle', index, rows, currentCol)
		},

		// todo 单选多选方式
		handleSelectionChange(val) {
			this.$emit('handleSelectionChange', val)
		},

		// todo 表格中另外的点击
		handleRowClick(isClick, row) {
			if (isClick) {
				this.$emit('cell-click', row)
			}
		},

		// todo 控制是否展示条件中的按钮
		isShowButton(scope, name) {
			if (this.buttonIsFilter === false) return true

			if (this.buttonIsFilter === true) {
				const value = scope.row[this.needButton.field]
				const isShowArr = this.needButton.controlShow
				const buttonArr = this.needButton.button

				const a = isShowArr.findIndex(item => {
					return item === value
				})

				if (a === -1) {
					return true
				} else if (a > -1) {
					const b = buttonArr.findIndex(item => {
						return item === name
					})
					return b > -1
				}
			}
		},

		cellColor(row) {},

		tableClick(row, column, cell, event) {}
	}
}
</script>

<style lang="less" scoped></style>
