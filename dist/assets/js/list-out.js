
var app = new Vue({
    el: '#pager_main',
    data: {
        goods_filter: {
            selected: null,
            options: eher_util.status_data().sign_status,
            outstore_status: eher_util.status_data().outstore_status
        },
        orgId: '8787426330226801974',
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
        }
    },
    created: function () {
        this.questListEntryOrder();

    },
    methods: {

        handleCommand: function (v) {
            this.goods_filter.selected = v;
            this.filters.status = this.goods_filter.options[v].value;
        },
        handleCurrentChange: function (v) {
            this.status.current = v;
            this.questListEntryOrder();
        },
        query: function () {
            this.questListEntryOrder();
        },
        rowClick: function (row, event, column) {
            console.log(row);
            window.location.href = './out.html#/'+row.id;
        },
        handleChange:function(){
            this.questListEntryOrder();
        },
        questListEntryOrder: function () {
            if (this.status.loading) return;
            this.status.status = true;
            var data = {
                "orgId": this.orgId,
                "startDate": eher_util.date2String(this.filters.startDate),
                "endDate": eher_util.date2String(this.filters.endDate),
                "status": this.goods_filter.selected,
                "type": 1,
                "page": this.status.current,
                "size": this.status.size
            }
            var self = this;
            this.$http.post('/doWareHouse/listDeliOrder', data)
                .then(function (result) {
                    if (result.list) {
                        self.tableData.list = result.list;
                        self.tableData.total = result.total;
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