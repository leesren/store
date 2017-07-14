
window.$app = new Vue({
    el: '#wrapper',
    mixins: [mixin],
    data: {
        goods_filter: {
            value: '',
            month: eher_util.date_month(new Date)
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
            child_store: {
                tableData: [],
                total: 0,
                page: 1,
            },
            dialog: {
                tableData: [],
                total: 0,
                page: 1,
                organizationId: '',
                productId: '',
            },
            store_list: null,// 门店列表
            tableData_center_export: [],
            tableData_child_export: [],
            is_exporting: false,
            size: 10
        },
        activeName: '0',
        dialog: {
            gridData: [],
            dialogTableVisible: false,
            first_time: 0,
        }
    },
    computed: {

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
            this.dialog.first_time++;
            var self = this;
            this.data_list.stores.visible = true
            if (this.dialog.first_time === 1) {
                setTimeout(function () {
                    self.$refs.tree.setCheckedNodes(self.data_list.stores.tree);
                }, 200)
            }
        },
        select_store: function () {
            var self = this, t;
            t = self.activeName == '0' ? self.data_list.center_store : self.data_list.child_store
            t.tableData = [];
            t.page = 1;
            t.total = 0;
            self.data_list.child_store.total = self.data_list.center_store.total = 0;// 两个tab都置空
            var nodes = this.$refs.tree.getCheckedNodes();
            if (nodes.length) {
                this.store_list = nodes;
                this.query_products(nodes);
            }
            this.data_list.stores.visible = false;
        },
        handleCommand: function (v) {
            this.goods_filter.selected = v;
        },
        handleTabsClick: function (tab, event) {

            if (this.activeName == '0' && this.data_list.center_store.total === 0) {
                this.query_products(this.store_list || undefined);
            } else if (this.data_list.child_store.total === 0) {
                this.query_products(this.store_list || undefined);
            }
        },
        handleExport: function () {
            this.export_2_excle();
        },
        rowClick: function (row, event, column) {
            this.query_item_detail(row.organizationId, row.id);
        },
        currentChange: function (v) {
            this.activeName == '0' ? this.data_list.center_store.page = v : this.data_list.child_store.page = v
            this.query_products();
        },
        currentDialogChange: function (v) {
            this.data_list.dialog.page = v;
            this.query_item_detail(this.data_list.dialog.organizationId, this.data_list.dialog.productId);
        },
        query_item_detail: function (organizationId, productId) {
            var self = this, api, page = this.data_list.dialog.page;
            if (self.activeName == '0') {
                api = '/doWareHouse/monthInvertoryDetailByOrganization';
            } else {
                api = '/doWareHouse/monthInvertoryDetailByStorage';
            }

            this.$http.post(api, {
                "organizationId": organizationId,
                "productId": productId,
                "month": eher_util.date_month(self.goods_filter.month),
                "keywords": "",
                "page": page,
                "size": self.data_list.size
            })
                .then(function (result) {
                    self.data_list.dialog.tableData = result.list;
                    self.data_list.dialog.total = result.totalSize;
                    self.data_list.dialog.productId = productId;
                    self.data_list.dialog.organizationId = organizationId;
                    self.dialog.dialogTableVisible = true;
                }, function (error) {
                    self.$message({ message: '查询失败,code：' + error, type: 'warning' });
                })
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
            var self = this, api, page;
            if (self.activeName == '0') {
                api = '/doWareHouse/monthInvertoryByOrganization';
                page = self.data_list.center_store.page;
            } else {
                api = '/doWareHouse/monthInvertoryByStorage';
                page = self.data_list.child_store.page;
            }
            this.$http.post(api, {
                organizationList: organizationList,
                "month": eher_util.date_month(self.goods_filter.month),
                "keywords": self.goods_filter.value,
                "page": page,
                "size": self.data_list.size
            })
                .then(function (result) {
                    if (self.activeName == '0') {
                        self.data_list.center_store.tableData = result.list;
                        self.data_list.center_store.total = result.totalSize;
                    } else {
                        self.data_list.child_store.tableData = result.list;
                        self.data_list.child_store.total = result.totalSize;
                    }
                }, function (error) {
                    console.log(error);
                })
        },
        export_2_excle: function () {
            if (this.data_list.is_exporting) return;
            this.data_list.is_exporting = true;
            var self = this, api = '';
            if (this.activeName === '0') {
                api = '/doWareHouse/monthInvertoryByOrganization';
            } else {
                api = '/doWareHouse/monthInvertoryByStorage'
            }
            var build_table = function (list) {
                var id = '', filename = '';
                if (self.activeName === '0') {
                    self.data_list.tableData_center_export = list;
                    id = 'center';
                    filename = '产品库存报表';
                } else {
                    self.data_list.tableData_child_export = list;
                    id = 'child';
                    filename = '产品分仓报表';
                }
                setTimeout(function () {
                    eher_util.element_table_2_table(id, '', filename);
                    self.data_list.is_exporting = false;
                }, 300)
            }
            this.$http.post(api, {
                "organizationList": self.getproductIds(),
                "month": eher_util.date_month(self.goods_filter.month),
                "keywords": self.goods_filter.value,
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