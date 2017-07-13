var $app = new Vue({
    el: '#pager_main',
    mixins: [mixin],
    data: {
        goods_filter: {
            selected: null,
            outstore_status: eher_util.status_data().outstore_status
        },
        activeIndex: '0',
        tableData: {
            '0': {
                list: [],
                total: 0,
                page: 1,
                loaded: false
            },
            size: 10
        },
        status: {
            loading: false
        },
        filters: {
            status: null,
            startDate: '',
            endDate: eher_util.date2String(new Date),
        }
    },
    created: function () {
        var date = new Date();
        var monthAgo = date.getFullYear() + "-" + date.getMonth() + "-" + (date.getDate() + 1);
        this.filters.startDate = eher_util.date2String(monthAgo);
        this.questListEntryOrder();
    },
    mounted: function () { 
        this.visibility_view();
    },
    methods: {
        handleClick: function (nav) {
            if (this.tableData[this.activeIndex].loaded && nav) { return; }
            if (this.activeIndex === '0') {
                this.questListEntryOrder()
            }
        },
        handleCommand: function (v) {
            this.goods_filter.selected = v;
            this.filters.status = this.goods_filter.options[v].value;
        },
        handleCurrentChange: function (v, type) {
            this.tableData[type].page = v;
            this.handleClick();
        },
        query: function () {
            this.questListEntryOrder();
        },
        rowClick: function (row, event, column) {
            var link = './check.html#/'
            location.href = (link + row.id);
        },
        handleChange: function () {
            this.questListEntryOrder();
        },
        questListEntryOrder: function () {
            if (this.status.loading) return;
            this.status.loading = true;
            var t = this.tableData['0'];
            var s = this.goods_filter.selected || -1;
            var data = {
                "startTime": eher_util.date2String(this.filters.startDate),
                "endTime": eher_util.date2String(this.filters.endDate),
                "status": this.goods_filter.outstore_status[+s + 1].value,
                "startNum": t.page,
                "limit": this.tableData.size
            }
            var self = this;
            var api = '/checkInvertory/queryCheckInventories';
            this.$http.post(api, data)
                .then(function (result) {
                    if (result.list) {
                        t.list = result.list;
                        t.total = result.total;
                        t.loaded = true;
                    }
                    self.status.loading = false;
                }, function (error) {
                    self.status.loading = false;
                    self.$message({ message: '查询失败code' + error, type: 'warning' });
                }).catch(function (error) {
                    self.status.loading = false;
                    self.$message({ message: '查询失败code', type: 'warning' });
                })
        }
    }
})