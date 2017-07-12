var app = new Vue({
    el: '#pager_main',
    data: {
        goods_filter: {
            selected: null,
            options: eher_util.status_data().sign_status,
            outstore_status: eher_util.status_data().outstore_status
        },
        orgId: '8787426330226801975',
        activeIndex: '0',
        tableData: {
            '0': {
                list: [],
                total: 0,
                page: 1,
                loaded: false
            },
            '1': {
                list: [],
                total: 0,
                page: 1,
                loaded: false
            },
            '2': {
                list: [],
                total: 0,
                page: 1,
                loaded: false
            },
            size: 4
        },
        status: {
            loading: false
        },
        filters: {
            status: null,
            startDate: '',
            endDate: eher_util.date2String(new Date),
        },
        tabIndexArray: [],
    },
    created: function () {
        var date = new Date();
        var monthAgo = date.getFullYear() + "-" + date.getMonth() + "-" + (date.getDate() + 1);
        this.filters.startDate = eher_util.date2String(monthAgo);
        this.tabIndexArray[0] = '0';
        this.questListEntryOrder();
    },
    methods: {
        handleClick: function (nav) {
            if (this.tableData[this.activeIndex].loaded && nav) { return; }
            if (this.activeIndex === '0') {
                this.questListEntryOrder()
            } else if (this.activeIndex === '1') {
                this.query_in_out()
            } else if (this.activeIndex === '2') {
                this.query_in_out()
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
            this.tabIndexArray = [];
            this.questListEntryOrder();
        },
        rowClick: function (row, event, column) {
            var link = {
                '0': './check.html#/',
                '1': './transfer-out.html#/',
                '2': './transfer-in.html#/'
            }
            // var link = this.activeIndex == 0 ? './transfer.html#/' : this.activeIndex == 1 ? './transfer-out.html#/' : './transfer-in.html#/';

            window.open(link[this.activeIndex + ''] + row.id);
        },
        handleChange: function () {
            this.questListEntryOrder();
        },
        questListEntryOrder: function () {
            if (this.status.loading) return;
            this.status.status = true;
            var t = this.tableData['0'];
            var data = {
                "startTime": eher_util.date2String(this.filters.startDate),
                "endTime": eher_util.date2String(this.filters.endDate),
                "status": 0,
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
                }).catch(function (error) {
                    self.status.loading = false;
                })
        },
        query_in_out: function () {
            if (this.status.loading) return;
            this.status.loading = true;
            var t = this.tableData[this.activeIndex], api;
            if (this.activeIndex === '1') {
                api = '/doWareHouse/listEntryOrder';
            } else if (this.activeIndex === '2') {
                api = '/doWareHouse/listDeliOrder';
            }
            var data = {
                "orgId": this.orgId,
                "startDate": eher_util.date2String(this.filters.startDate),
                "endDate": eher_util.date2String(this.filters.endDate),
                "status": this.goods_filter.selected,
                "type": 5,// 1 是手动入库单 5是盘点入库
                "page": t.page,
                "size": this.tableData.size
            }
            var self = this;
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
                }).catch(function (error) {
                    self.status.loading = false;
                })
        }
    }
})