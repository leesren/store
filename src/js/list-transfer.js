var app = new Vue({
    el: '#pager_main',
    mixins: [ mixin ],
    data: {
        goods_filter: {
            selected: null,
            bill_status: eher_util.status_data().store_status,
            outstore_status: eher_util.status_data().transfer_status
        },
        orgId: '8787426330226801974',
        activeIndex: 0,
        tableData: {
            list: [],
            total: 0
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
            var link = this.activeIndex == 0 ? './transfer.html#/' : this.activeIndex == 1 ? './transfer-out.html#/' : './transfer-in.html#/';
            window.location.href = (link + row.id); 
        },
        handleChange: function() {
            this.questListEntryOrder();
        },
        questListEntryOrder: function() {
            if (this.status.loading) return;
            this.status.status = true;
            var data = {
                "orgId": this.orgId,
                "startDate": eher_util.date2String(this.filters.startDate),
                "endDate": eher_util.date2String(this.filters.endDate),
                "status": this.goods_filter.selected,
                "type": 3,
                "page": this.status.current,
                "size": this.status.size
            }
            var self = this; 
            var url = this.activeIndex == 0 ? '/doWareHouse/listTransferOrder' : this.activeIndex == 1 ?
                '/doWareHouse/listDelivertyOrderFromTransfer' : '/doWareHouse/listEntryOrderFromTransfer'; 
            this.$http.post(url, data)
                .then(function(result) {
                    if (result.list) {
                        self.tableData.list = result.list;
                        self.tableData.total = result.total;
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