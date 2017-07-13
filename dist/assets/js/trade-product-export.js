
window.$app = new Vue({
    el: '#wrapper',
    mixins: [mixin],
    data: {
        orgId: '8787426330226801974',
        goods_filter: { 
            startDate: eher_util.date2String(new Date),
            endDate: eher_util.date2String(new Date),
        },
        data_list: {
            stores: {
                list: [],
                tree: null,
                visible: false
            },
            center_store: {
                tableData: [],
                total: 0,
                page: 1,
            },
            tableData_center_export: [],
            tableData_child_export: [],
            is_exporting: false,
            size: 10,
            first_time:0
        }
    }, 
    created: function () {
        window.$dataRequest = this.$dataRequest = new dataRequest();
        window.$validator_data = this.$validator_data = new validator_data();
    },
    mounted: function () {
        var self = this;
        this.query_stores()
            .then(function (res) {
                self.query_products();
            })
        this.visibility_view();
    },
    methods: {
        open_store_tree: function () {
            this.data_list.first_time++;
            var self = this;
            this.data_list.stores.visible = true
            if (this.data_list.first_time === 1) {
                setTimeout(function () {
                    self.$refs.tree.setCheckedNodes(self.data_list.stores.tree);
                }, 200)
            }
        },
        select_store: function () {
            var self = this;
            self.data_list.center_store.tableData = [];
            self.data_list.center_store.total = 0;
            self.data_list.center_store.page = 1;
            var nodes = this.$refs.tree.getCheckedNodes();
            if (nodes.length) {
                this.query_products(nodes);
            }
            this.data_list.stores.visible = false;
        },
        handleExport: function () {
            this.export_2_excle();
        },
        currentChange: function (v) {
            this.data_list.center_store.page = v;
            this.query_products();
        },
        query_stores: function () {
            var self = this;
            return new Promise(function (resolve) {
                this.$dataRequest.query_stores(self.orgId)
                    .then(function (res) {
                        self.data_list.stores.tree = [res];
                        resolve(res);
                    }, function (e) {
                        self.$message({ message: '查询组织失败,code：' + e, type: 'warning' });
                        console.error(e);
                    })
            })

        },
        getproductIds: function (organizationLists) {
            if (!this.data_list.stores.list.length) {
                this.data_list.stores.list = eher_util.get_brand_stores(this.data_list.stores.tree);
            }
            var orgList = this.data_list.stores.list;
            if (organizationLists && organizationLists instanceof Array) {
                orgList = organizationLists;
            }

            var organizationList = orgList.map(function (e) {
                return { organizationId: e.id }
            })
            return organizationList;
        },
        query_products: function (organizationLists) {
            var organizationList = this.getproductIds(organizationLists);
            var self = this, page = this.data_list.center_store.page;
            this.$http.post('/doWareHouse/allTradeDetail', {
                "organizationList": organizationList,
                "startTime": eher_util.date2String(self.goods_filter.startDate),
                "endTime": eher_util.date2String(self.goods_filter.endDate), 
                "page": page,
                "size": self.data_list.size
            })
                .then(function (result) {
                    self.data_list.center_store.tableData = result.list;
                    self.data_list.center_store.total = result.totalSize;
                }, function (error) {
                    console.log(error);
                    self.$message({ message: '查询失败,code：' + error, type: 'warning' });
                })
        },
        export_2_excle: function () {
            if (this.data_list.is_exporting) return;
            this.data_list.is_exporting = true;
            var self = this, api = '/doWareHouse/allTradeDetail';;

            var build_table = function (list) {
                var id = 'export_tpl', filename = '产品交易报表';
                self.data_list.tableData_child_export = list;
                setTimeout(function () {
                    eher_util.element_table_2_table(id, '', filename);
                    self.data_list.is_exporting = false;
                }, 300)
            }
            this.$http.post(api, {
                "organizationList": self.getproductIds(),
                "startTime": eher_util.date2String(self.goods_filter.startDate),
                "endTime": eher_util.date2String(self.goods_filter.endDate),
                "exportFlag": true
            })
                .then(function (result) {
                    build_table(result);
                }, function (error) {
                    self.data_list.is_exporting = false;
                })
        }
    }
})