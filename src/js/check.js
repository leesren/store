
var app = window.$app = new Vue({
    el: '#wrapper',
    mixins: [mixin],
    data: {
        orgId: '8787426330226801974',
        id: location.hash ? location.hash.slice(2) : '', // 详情的id
        status: 0,
        activeIndex: '0',
        formInline: {
            in_time: '',
            desc: '',
            check_warehouse: [], // 仓库
            check_person: '', // 盘点人
        },
        formInlineRules: {
            in_time: { required: true, message: '请选择盘点时间' },
            check_warehouse: { required: true, message: '请选择仓库' },
            check_person: { required: true, message: '请选择盘点人' },
        },
        filter_name: '',
        tableData: [],
        tableData2: [],
        dataList: {
            bill_status: eher_util.status_data().store_status,
            stores: [],
            in_houses: [],
            out_houses: [],
            cache_house: {},
            storeList: [],
            signerList: [],
            tableData: {
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
            }
        }
    },
    computed: {
        _disabled: function () {
            return this.status === 1;
        },

    },
    watch: {},
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
        this.visibility_view();
    },
    methods: {
        tabClick: function () {
            if (!+this.activeIndex) return;
            if (this.dataList.tableData[this.activeIndex].loaded) { return; }
            this.activeIndex != 0 && this.query_in_out();
        },
        _check_num: function (a) {
            var c = a > 0 ? 'red' : 'green';
            c = !a ? '' : c;
            return { 'color': c }
        },
        gettableData() {
            return this.tableData2.length ? this.tableData2 : this.tableData
        },
        filters_name: function () {
            var self = this;
            return this.tableData.filter(function (e) {
                return self.filter_name ? (e.name).indexOf(self.filter_name) != -1 : true
            })

        },
        initDataInfo: function () { // 初始化单的详情
            var self = this;
            this.$http.post('/checkInvertory/queryCheckInventoryDetail', {
                "checkInvertoryId": self.id, "start": -1, "limit": -1
            }).then(function (result) {
                self.formInline.in_time = result.checkTime;
                self.formInline.check_warehouse = result.storages.map(function (e) { return e.storageId });

                self.formInline.check_person = result.inventorycheckerId;

                self.tableData = result.list;
                self.formInline.desc = result.note;
                self.status = +result.status;
                self.selectStoreChange(self.formInline.check_warehouse);
            }, function (error) {
                console.error(error);
            })
        },
        selectStoreChange: function (v, type) {
            var self = this,
                _cache = this.dataList.cache_house[v];
            if (_cache) {
                self.dataList.out_houses = _cache;
                return
            }
            var orgId = this.formInline.out_storeId;
            self.dataRequest.query_hourse(orgId)
                .then(function (res) {
                    self.dataList.out_houses = self.dataList.cache_house[v] = res;
                }, function (error) {
                    self.$message({ message: '仓库查询失败,code：' + error, type: 'warning' });
                })
        },
        submit: function (e) {

        },
        save_request: function (callback) {
            if (!this.tableData.length) { this.$message({ message: '保存失败,您未添加产品', type: 'warning' }); return; }
            var self = this;
            var data = {
                "inventorychecker": self.formInline.check_person + '', //盘点人
                "acceptTime": eher_util.date2String(self.formInline.in_time), //盘点日期
                "description": self.formInline.desc, //备注
                "items": this.tableData.map(function (e) {
                    return {
                        "storageId": e.storageId, //仓库
                        "productId": e.productId, //产品
                        "beforeQuantity": e.beforeQuantity + '',  //库存数量
                        "unitId": e.unitId, //单位
                        "quantity": e.quantity + ''  //盘点数量
                    }
                })
            }
            var api = '/checkInvertory/save';
            if (this.id) {
                data.id = this.id;
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
            if (this.id)
                this.save('sign').then(function (e) {
                    self.$http.post('/checkInvertory/audit', { checkInvertoryId: self.id })
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
            this.$http.post('/checkInvertory/cancelAudit', { checkInvertoryId: this.id })
                .then(function (result) {
                    self.$message({ message: '取消审批成功', type: 'success' });
                    window.location.reload()
                }, function (error) {
                    self.$log(error);
                    self.$message({ message: '取消审批失败,code：' + error, type: 'warning' });
                })
        },
        out_excel: function () {
            eher_util.element_table_2_table('eltableBox', 9, '盘点');
        },

        delete_confirm: function () {
            this.dialog.deletedialogVisible = false;
        },
        add_inventory: function (res) {// 添加盘点v
            var self = this;
            if (res && res instanceof Array && res.length) {
                res.map(function (e) {
                    e.beforeQuantity = e.quantity;
                    self.addItem(e);
                })

            } else {
                self.$message({ message: '无产品信息', type: 'warning' });
            }
        },
        before_dialogSelectProductClose: function (e) {// 选择产品 --》 确定按钮
            var self = this;
            this.dialogSelectProductClose('callback').then(function (obj) {
                return self.queryStorageByProduct({ 'productId': obj.id })
            }).then(function (res) {
                self.add_inventory(res);
            }, function (e) {
                self.$message({ message: '查询失败,code：' + e, type: 'warning' });
            })
        },

        queryStorageByProduct: function (options) {
            var self = this;
            var obj = {
                "storageIds": this.formInline.check_warehouse,  //仓库
                "productId": null, //产品(添加产品)
                "barcode": null, //条形码
                "productCodes": null, //产品编号列表（excel导入）
            };
            obj = Object.assign(obj, options);
            return this.$http.post('/checkInvertory/queryStorageByProduct', obj)
        },
        before_add: function () {
            if (!this.formInline.check_warehouse.length) {
                this.$message({ message: '请先选择仓库', type: 'warning' });
                return;
            }
            this.add();
        },
        keyup_enter: function () {
            if (!this.filter_name) return;
            var self = this;
            this.validator_data.isValid_form(this)
                .then(function () {
                    return self.queryStorageByProduct({ barcode: self.filter_name })
                })
                .then(function (res) {
                    self.add_inventory(res);
                }, function (e) {
                    e && self.$message({ message: '查询失败', type: 'warning' });
                })

        },
        query_keyword: eher_util.throttle(function (e) {
            this.filter_name = e.target.value.trim();
            this.tableData2 = this.filters_name();
        }, 800),
        before_save_excle: function () {
            var self = this;
            this.save_excle('callback')
                .then(function (res) {
                    var listNo = res.map(function (e) {
                        return e.numberCode
                    })
                    if (!listNo.length) return;
                    self.queryStorageByProduct({ productCodes: listNo }).then(function (res) {
                        self.add_inventory(res);
                    }, function (e) {
                        self.$message({ message: '查询失败,code：' + e, type: 'warning' });
                    })
                }, function (e) {
                    console.error(e);
                    self.$message({ message: '操作失败', type: 'warning' });
                })
        },
        generateCheckInventories: function () {
            var self = this;
            var _post = function () {
                return self.$http.post('/checkInvertory/queryStorageByProduct', {
                    "storageIds": self.formInline.check_warehouse,  //仓库
                    "inventorychecker": self.formInline.check_person + '', //盘点人
                    "acceptTime": eher_util.date2String(self.formInline.in_time), //盘点日期
                    "description": self.formInline.desc, //备注
                })
            }
            this.validator_data.isValid_form(this)
                .then(function () {
                    return _post();
                })
                .then(function (res) {
                    self.add_inventory(res);
                }, function (e) {
                    self.$message({ message: '自动生成盘点失败', type: 'warning' });
                    console.error(e);
                })


        },
        handleCurrentChange: function (v, type) {
            this.dataList.tableData[type].page = v;
            if (this.dataList.tableData[this.activeIndex].loaded) { return; }
            this.activeIndex != 0 && this.query_in_out();
        },
        query_in_out: function () {
            var t = this.dataList.tableData[this.activeIndex], api;
            if (this.activeIndex === '1') {
                api = '/doWareHouse/listEntryOrder';
            } else if (this.activeIndex === '2') {
                api = '/doWareHouse/listDeliOrder';
            }
            var data = {
                "orgId": this.orgId,
                "startDate": eher_util.date2String(new Date),
                "endDate": eher_util.date2String(new Date),
                "status": null,
                "type": 5,// 1 是手动入库单 5是盘点入库
                "page": t.page,
                "size": this.dataList.tableData.size
            }
            var self = this;
            this.$http.post(api, data)
                .then(function (result) {
                    if (result.list) {
                        t.list = result.list;
                        t.total = result.total;
                        t.loaded = true;
                    }
                }, function (error) {
                }).catch(function (error) {
                })
        }
    }
})
window.$dataRequest.query_store($app.orgId);
window.$dataRequest.query_signer($app.orgId);