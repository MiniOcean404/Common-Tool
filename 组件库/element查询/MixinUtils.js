import Table from 'components/common/Table';
import Pagination from 'components/common/Pagination';
import Input from 'components/common/Input';

const defaultDate = [
	{
		data: ['createDateBegin', 'createDateEnd'],
	},
];

export const tableMixin = {
	components: {
		Table,
		Pagination,
		Input,
	},
	data() {
		return {
			// todo 查询的所有数据
			queryAllData: {},

			// todo 表格搜索数据
			queryData: {},
			cloneData: {},

			// todo 页码改变
			pageOption: {
				currentPage: 1,
				total: 0,
				pageSize: 10,
			},

			// todo 时间选择
			pickerOptions: {
				shortcuts: [
					{
						text: '昨天',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setDate(start.getDate() - 1);
							end.setDate(end.getDate() - 1);
							picker.$emit('pick', [start, end]);
						},
					},
					{
						text: '本周',
						onClick(picker) {
							const end = new Date();
							let start = new Date();
							const currentDay = new Date().getDay() === 0 ? 7 : new Date().getDay();

							start.setDate(start.getDate() - currentDay + 1);
							end.setDate(end.getDate());
							picker.$emit('pick', [start, end]);
						},
					},
					{
						text: '本月',
						onClick(picker) {
							let end = new Date();
							let start = new Date();

							start.setDate(1);
							end.setMonth(end.getMonth() + 1);
							end.setDate(0);
							picker.$emit('pick', [start, end]);
						},
					},
					{
						text: '上个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setMonth(start.getMonth() - 1);
							start.setDate(1);

							end.setDate(0);
							picker.$emit('pick', [start, end]);
						},
					},
					{
						text: '最近三个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
							picker.$emit('pick', [start, end]);
						},
					},
					{
						text: '本年',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setDate(1);
							start.setMonth(0);

							picker.$emit('pick', [start, end]);
						},
					},
				],
			},
		};
	},
	methods: {
		//todo 通用列表数据初始化
		getSelectList(api, list, value, label, params, isclear) {
			api(params).then(({ data }) => {
				if (isclear) list.length = 0;

				if (list.length === 0) {
					data.forEach((i) => {
						const obj = {};
						obj.value = i[value];
						obj.label = i[label];
						list.push(obj);
					});
				}
			});
		},

		// todo 通用查询
		async getList(api, query, page, tableData, currentPage, dateArr = defaultDate, cb) {
			let data = JSON.parse(JSON.stringify(query));

			// 处理页数
			data.pageNum = currentPage !== undefined ? (page.currentPage = currentPage) : (page.currentPage = 1);
			data.pageSize = page.pageSize;

			// 处理时间
			dateArr.forEach((date) => {
				for (const [key, value] of Object.entries(date)) {
					if (data[key] !== null && data[key] !== undefined) {
						data[value[0]] = data[key][0];
						data[value[1]] = data[key][1];
						delete data[key];
					}
				}
			});

			// 请求结果
			const result = await api(data);

			if (result && result.code === 200) {
				tableData.resultData = cb ? everyData(result.rows, cb) : result.rows;

				page.total = result.total;
				this.queryAllData = result;
			} else if (result === '') {
				tableData.resultData = [];
				page.total = 0;
			}

			// 请求数据clone
			this.cloneData = data;

			return true;
		},

		// todo 通用校验
		check(message, key, value) {
			if (value === undefined && (key === '' || key === null || key === undefined)) {
				this.$message({ type: 'error', message });
				throw new TypeError('填写的内容为空');
			} else if (value && key === value) {
				this.$message({ type: 'error', message });
				throw new TypeError('填写的内容错误');
			}
		},

		// todo 点击查询按钮
		queryButton(e, apiNum) {
			this.requestDeploy();
		},

		// todo 页码改变
		currentPageChange(current) {
			this.requestDeploy(current);
		},
	},
};

// todo 过滤函数
function everyData(data, cb) {
	return data.map((item) => {
		const arr = Object.entries(item);
		for (const i of arr) {
			if (cb(i)) {
				item[cb(i)[0]] = cb(i)[1];
			}
		}
		return item;
	});
}
