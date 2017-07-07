

var app = window.$app = new Vue({
    el: '#wrapper',
    mixins: [mixin],
    data: {
        orgId: '8787426330209426723',
        id: location.hash.slice(2) || '',// 详情的id
        approveEmpId: '8787426330226802018',// 审核人id
        status: 0,
        formInline: {
            in_time: '',
            desc: '',
            out_store: '',// 调出门店
            out_warehouse: '',// 调出仓库
            in_store: '',// 调出门店
            in_warehouse: '',// 调出仓库
        },
        formInlineRules: {
            in_time: { required: true, message: '请选择调拨时间' },
            out_store: { required: true, message: '请选择门店' },
            out_warehouse: { required: true, message: '请选择仓库' },
            in_store: { required: true, message: '请选择门店' },
            in_warehouse: { required: true, message: '请选择仓库' },
        },
        tableData: [],
        dataList: {
            stores: [],
            in_houses: [],
            out_houses: [],
            cache_house: {}
        }
    },
    computed: {
        _disabled: function () {
            return this.status === 1;
        }
    },
    watch: {
    },
    created: function () {
        this.dataRequest = window.$dataRequest = new dataRequest(this.orgId);
        this.validator_data = window.$validator_data = new validator_data();
    },
    mounted: function () {
        var self = this;  
        this.dataRequest.query_stores(this.orgId).then(function (e) {
            self.dataList.stores = e;
        })
        if (this.id) {
            this.initDataInfo();
        }
    },
    methods: {
        initDataInfo: function () {// 初始化单的详情
            var self = this;
            this.$http.post('/doWareHouse/queryTransferDetail', { "id": this.id })
                .then(function (result) {
                    self.formInline.out_store = result.fromOrgId;
                    self.formInline.out_warehouse = result.fromStorageId;
                    self.formInline.in_store = result.toOrgId;
                    self.formInline.in_warehouse = result.toStorageId;
                    self.formInline.in_time = result.orderDate;
                    self.formInline.desc = result.note;

                    self.tableData = result.itemList;
                    self.status = +result.statusCode;
                    self.selectStoreChange(self.formInline.in_store, 'in');
                    self.selectStoreChange(self.formInline.out_store, 'out');
                }, function (error) {
                    console.error(error);
                })
        },
        selectStoreChange: function (v, type) {
            var self = this, _cache = this.dataList.cache_house[v];
            if (_cache) {
                if (type === 'in') {
                    self.dataList.in_houses = _cache;
                } else {
                    self.dataList.out_houses = _cache;
                }
                return
            }
            var orgId = type === 'in' ? this.formInline.in_store : this.formInline.out_store;
            self.dataRequest.query_hourse(orgId)
                .then(function (res) {
                    if (type === 'in') {
                        self.dataList.in_houses = self.dataList.cache_house[v] = res;
                    } else {
                        self.dataList.out_houses = self.dataList.cache_house[v] = res;
                    }
                }, function (error) {
                    self.$message({ message: '仓库查询失败,code：' + error, type: 'warning' });
                })
        },
        _change: function (v) {
            var newObj = Object.assign({}, this.tableData[v])
            Vue.set(this.tableData, v, newObj);
        },
        _count: function (i) {
            var el = this.tableData[i];
            return (el.price * el.quantity).toFixed(2);
        },
        handleCommand: function (v) {
            this.goods_filter.selected = v;
        },
        submit: function (e) {
 
        },
        save_request: function (callback) {
            if (!this.tableData.length) { this.$message({ message: '保存失败,您未添加产品', type: 'warning' }); return; }
            var data = {
                // "toOrgId": this.formInline.out_store + '',
                "toStorageId": this.formInline.out_warehouse + '',
                // "fromOrgId": this.formInline.in_store + '',
                "fromStorageId": this.formInline.in_warehouse + '',
                "orderDate": eher_util.date2String(this.formInline.in_time),
                "note": this.formInline.desc,
                "createEmpId": this.approveEmpId + '',
                "operatorId": this.approveEmpId + '',// 不填
                "itemList": this.tableData
            }
            var api = '/doWareHouse/saveTransferOrder';
            if (this.id) {
                data.id = this.id;
                api = '/doWareHouse/modifyTransferOrder';
            }
            var self = this;
            return new Promise(function (resolve, reject) {
                self.$http.post(api, data)
                    .then(function (result) {
                        if (callback) {
                            return resolve(result)
                        }
                        self.$message({ message: '添加成功', type: 'success' });
                        setTimeout(function () {
                            window.location.reload();
                        }, 400)
                    }, function (error) {
                        console.error(error);
                        self.$message({ message: '添加失败,code：' + error, type: 'warning' });
                    }).catch(function (error) {
                        console.error(error);
                        self.$message({ message: '添加失败', type: 'warning' });
                    })
            })


        },
        save: function (type) {
            var self = this;
            return this.validator_data.isValid_form(this)
                .then(function () {
                    return self.save_request(typeof type === 'string');
                })
        },
        sign: function () {
            var self = this;
            if (this.id && this.approveEmpId)
                this.save('sign').then(function (e) {
                    self.$http.post('/doWareHouse/approveTransferOrder', { id: self.id, approveEmpId: self.approveEmpId })
                        .then(function (result) {
                            self.$message({ message: '审批成功', type: 'success' });
                            window.location.reload()
                        }, function (error) {
                            self.$log(error);
                            self.$message({ message: '审批失败,code：' + error, type: 'warning' });
                        })
                })

        },
        unsign: function () {
            var self = this;
            this.$http.post('/doWareHouse/antiApproveTransferOrder', { id: this.id, empId: this.approveEmpId })
                .then(function (result) {
                    self.$message({ message: '取消审批成功', type: 'success' });
                    window.location.reload()
                }, function (error) {
                    self.$log(error);
                    self.$message({ message: '取消审批失败,code：' + error, type: 'warning' });
                })
        },
        out_excel: function () {
            eher_util.element_table_2_table('eltableBox', 7, '调拨单');
        },

        delete_confirm: function () {
            this.dialog.deletedialogVisible = false;
        }
    }
})
window.$dataRequest.query_store($app.orgId);
window.$dataRequest.query_signer($app.orgId);