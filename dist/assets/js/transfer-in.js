var app = window.$app = new Vue({
    el: '#wrapper',
    mixins: [mixin],
    data: {
        orgId: '8787426330209426723',
        id: location.hash.slice(2) || '', // 详情的id
        approveEmpId: '8787426330226802018', // 审核人id
        status: 0,
        formInline: {},
        tableData: [],
        dataList: {
            stores: [],
            in_houses: [],
            out_houses: [],
            cache_house: {}
        },
    },
    computed: {
        _disabled: function() {
            return this.status === 1;
        }
    },
    watch: {},
    created: function() {
        this.dataRequest = window.$dataRequest = new dataRequest(this.orgId);
        this.validator_data = window.$validator_data = new validator_data();
    },
    mounted: function() {
        var self = this;
        if (this.id) {
            this.initDataInfo();
        }
    },
    methods: {
        initDataInfo: function() { // 初始化单的详情
            var self = this;
            this.$http.post('/doWareHouse/listEntryOrderItemFromTransfer', { "id": this.id })
                .then(function(result) {
                    self.formInline = result;
                    self.tableData = result.itemList;
                    self.status = +result.statusCode;
                    self.selectStoreChange(self.formInline.fromOrgId, 'in');
                }, function(error) {
                    console.error(error);
                })
        },
        selectStoreChange: function(v, type) {
            var self = this,
                _cache = this.dataList.cache_house[v];
            if (_cache) {
                self.dataList.in_houses = _cache;
                return
            }
            self.dataRequest.query_hourse(this.formInline.fromOrgId)
                .then(function(res) {
                    self.dataList.in_houses = self.dataList.cache_house[v] = res;
                }, function(error) {
                    self.$message({ message: '仓库查询失败,code：' + error, type: 'warning' });
                })
        },
        _change: function(v) {
            var newObj = Object.assign({}, this.tableData[v])
            Vue.set(this.tableData, v, newObj);
        },
        _count: function(i) {
            var el = this.tableData[i];
            return (el.price * el.quantity).toFixed(2);
        },
        save_request: function(callback) {
            var data = {
                id: this.id,
                "storageId": this.formInline.toStorageId + '',
                "entryDate": eher_util.date2String(this.formInline.orderDate),
                "note": this.formInline.note,
                "operatorId": this.approveEmpId + '',
                "itemList": this.tableData
            }
            var self = this;
            return new Promise(function(resolve, reject) {
                self.$http.post('/doWareHouse/modifyEntryOrder', data)
                    .then(function(result) {
                        if (callback) {
                            return resolve(result)
                        }
                        self.$message({ message: '保存成功', type: 'success' });
                        setTimeout(function() {
                            window.location.reload();
                        }, 400)
                    }, function(error) {
                        console.error(error);
                        self.$message({ message: '保存失败,code：' + error, type: 'warning' });
                    }).catch(function(error) {
                        console.error(error);
                        self.$message({ message: '保存失败', type: 'warning' });
                    })
            })


        },
        save: function(type) {
            var self = this;
            return this.validator_data.isValid_form(this)
                .then(function() {
                    return self.save_request(typeof type === 'string');
                })
        },
        sign: function() {
            var self = this;
            if (this.id && this.approveEmpId)
                this.save('sign').then(function(e) {
                    self.$http.post('/doWareHouse/approveEntryOrder', { id: self.id, approveEmpId: self.approveEmpId })
                        .then(function(result) {
                            self.$message({ message: '审批成功', type: 'success' });
                            setTimeout(function() {
                                window.location.reload();
                            }, 400)
                        }, function(error) {
                            self.$log(error);
                            self.$message({ message: '审批失败,code：' + error, type: 'warning' });
                        })
                })

        },
        unsign: function() {
            var self = this;
            this.$http.post('/doWareHouse/antiApproveEntryOrder', { id: this.id, empId: this.approveEmpId })
                .then(function(result) {
                    self.$message({ message: '取消审批成功', type: 'success' });
                    setTimeout(function() {
                        window.location.reload();
                    }, 400)
                }, function(error) {
                    self.$log(error);
                    self.$message({ message: '取消审批失败,code：' + error, type: 'warning' });
                })
        },
        out_excel: function() {
            eher_util.element_table_2_table('eltableBox', 8, '调拨入库单');
        }

    }
})
window.$dataRequest.query_store($app.orgId);
window.$dataRequest.query_signer($app.orgId);