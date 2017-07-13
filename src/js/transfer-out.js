var app = window.$app = new Vue({
    el: '#wrapper',
    mixins: [mixin],
    data: {
        orgId: '8787426330226801974',
        id: location.hash.slice(2) || '', // 详情的id
        status: 0,
        formInline: {},
        tableData: [],
        dataList: {
            stores: [],
            in_houses: [],
            out_houses: [],
            cache_house: {}
        }
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
        this.visibility_view();
    },
    methods: {
        initDataInfo: function() { // 初始化单的详情
            var self = this;
            this.$http.post('/doWareHouse/listDeliveryOrderItemFromTransfer', { "id": this.id })
                .then(function(result) {
                    self.formInline = result;
                    self.tableData = result.itemList;
                    self.selectStoreChange(self.formInline.fromOrgId, 'out');
                }, function(error) {
                    console.error(error);
                })
        },
        selectStoreChange: function(v, type) {
            var self = this,
                _cache = this.dataList.cache_house[v];
            if (_cache) {
                self.dataList.out_houses = _cache;
                return
            }
            self.dataRequest.query_hourse(this.formInline.fromOrgId)
                .then(function(res) {
                    self.dataList.out_houses = self.dataList.cache_house[v] = res;
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
                "storageId": this.formInline.fromStorageId + '',
                "orderNo": this.formInline.orderNo,
                "deliveryDate": eher_util.date2String(this.formInline.orderDate),
                "note": this.formInline.note,
                "itemList": this.tableData
            }
            var self = this;
            return new Promise(function(resolve, reject) {
                self.$http.post('/doWareHouse/modifyDeliOrder', data)
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
        out_excel: function() {
            eher_util.element_table_2_table('eltableBox', 8, '调拨出库单');
        }

    }
})
window.$dataRequest.query_store($app.orgId);
window.$dataRequest.query_signer($app.orgId);