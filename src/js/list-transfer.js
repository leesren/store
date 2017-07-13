var app = new Vue({
    el: '#pager_main',
    mixins: [mixin],
    data: {
        goods_filter: {
            selected: null,
            bill_status: eher_util.status_data().store_status,
            outstore_status: eher_util.status_data().transfer_status
        },
        orgId: '8787426330226801974',
        activeIndex: 0,
        tableData: {
            '0': {
                list: [],
                total: 0,
                currentPage: 1
            },
            '1': {
                list: [],
                total: 0,
                currentPage: 1
            },
            '2': {
                list: [],
                total: 0,
                currentPage: 1
            },
            size: 10,
        },
        status: {
            current: 1,
            size: 10,
            loading: false
        },
        filters: {
            status: null,
            startDate: eher_util.date2String(new Date),
            endDate: eher_util.date2String(new Date),
        },
        tabIndexArray: [],
    },
    created: function() {
        this.tabIndexArray[0] = '0';
        this.questListEntryOrder();
    },
    mounted: function() {
        this.visibility_view();
    },
    methods: {
        handleClick: function(tab, event) {
            console.log(this.activeIndex);
            if (this.tabIndexArray[this.activeIndex] != this.activeIndex) {
                this.tabIndexArray[this.activeIndex] = this.activeIndex;
                this.questListEntryOrder();
            }

        },
        handleCommand: function(v) {
            this.goods_filter.selected = v;
            this.filters.status = this.goods_filter.options[v].value;
        },
        handleCurrentChange: function(v) {
            this.status.current = v;
            this.questListEntryOrder();
        },
        query: function() {
            this.tabIndexArray = [];
            this.questListEntryOrder();
        },
        rowClick: function(row, event, column) {
            console.log(row);
            var link = {
                '0': './transfer.html#/',
                '1': './transfer-out.html#/',
                '2': './transfer-in.html#/'
            }
            window.open(link[this.activeIndex] + row.id);
        },
        handleChange: function() {
            this.questListEntryOrder();
        },
        questListEntryOrder: function() {
            if (this.status.loading) return;
            this.status.loading = true;
            var data = {
                "orgId": this.orgId,
                "startDate": eher_util.date2String(this.filters.startDate),
                "endDate": eher_util.date2String(this.filters.endDate),
                "status": this.goods_filter.selected,
                "type": 3,
                "page": this.tableData[this.activeIndex].currentPage,
                "size": this.tableData.size
            }
            var self = this;
            var url = {
                '0': '/doWareHouse/listTransferOrder',
                '1': '/doWareHouse/listDelivertyOrderFromTransfer',
                '2': '/doWareHouse/listEntryOrderFromTransfer'
            }
            this.$http.post(url[self.activeIndex], data)
                .then(function(result) {
                    if (result.list) {
                        self.tableData[self.activeIndex].list = result.list;
                        self.tableData[self.activeIndex].total = result.total;
                    }
                    self.status.loading = false;
                }, function(error) {
                    self.status.loading = false;
                }).catch(function(error) {
                    self.status.loading = false;
                })
        }
    }
})