

var app = window.$app = new Vue({
    el: '#wrapper',
    mixins: [ mixin ],
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
        },
        excle_origin: {
            list: [],
            check_result: [],
            handson_data: {}
        },
        dialog: {
            dialogVisible: false,
            input: '',
            list: [],
            selected: -1,
            total: 0,
            size: 10,
            current: 1,
            dialog_excle: false,
            keyWord: '',
            excle_result_visible: false,
            deletedialogVisible: false,
            excle_result_tableData: []
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
        this.query_store();
    },
    mounted: function () {
        var self = this;
        this.dataRequest = new dataRequest(this.orgId);
        this.validator_data = new validator_data();
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
            console.log(v);
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
        dialogHandleCurrentChange(val) {
            this.dialog.current = val;
            this.dialog.selected = -1;
            this.add();
        },
        dialogInputChange: function (e) {
            // console.log(e);
            this.dialog.keyWord = e;
            this.dialog.current = 1;
            this.add();
        },
        dialogSelectProductClose: function () {
            if (this.dialog.selected === -1) return;
            var obj = this.dialog.list[this.dialog.selected];
            obj.quantity = 1;
            this.addItem(obj);
            this.dialog.dialogVisible = false
        },
        dialogSelectedItem: function (item, index) {
            if (index === this.dialog.selected) {
                this.dialog.selected = -1;
            } else {
                this.dialog.selected = index;
            }
        },
        addItem: function (data, index) {
            if (!data) return;
            var contain = this.tableData.filter(function (el, index) {
                return el.productId === data.id
            })
            if (contain && contain.length > 0) return;
            data.productId = data.id;
            data.productName = data.name;
            delete data.id;
            delete data.name;
            this.tableData.push(data);
        },
        add: function () {
            var self = this;
            this.dataRequest.listGoods(this.dialog.keyWord, this.dialog.current).then(function (result) {
                if (result) {
                    self.dialog.list = result.list;
                    self.dialog.total = result.total;
                }
                self.dialog.dialogVisible = true;
            })
        },

        query_store: function () {// 查询仓库
            var self = this;
            this.$http.post('/doResourceCommon/listStorage', { "orgId": this.orgId })
                .then(function (result) {
                    if (result && result.length > 0) {
                        self.dataList.storeList = result;
                    }
                }, function (error) {
                    console.error(error);
                }).catch(function (error) {
                    console.error(error);
                })
        },
        query_signer: function () {// 审核人
            var self = this;
            this.$http.post('/doResourceCommon/listEmployee', { "orgId": this.orgId })
                .then(function (result) {
                    if (result && result.length > 0) {
                        self.dataList.signerList = result;
                    }
                }, function (error) {
                    console.error(error);
                }).catch(function (error) {
                    console.error(error);
                })
        },
        deleteRow: function (index) {
            this.tableData.splice(index, 1);
        },
        _onChange: function (target) {
            var self = this;
            eher_util.getData_from_excle(target)
                .then(function (data) {
                    // var header = data.shift(0);
                    // var list = data, l = [];
                    eher_util.destory_handsontable('mydialogExcle');// 清楚handsontable 数据
                    self.excle_origin.list = data;
                    self.excle_origin.handson_data = eher_util.excel_2_handsontable(data);
                    self.dialog.excle_result_visible = true;
                    self.excle_origin.check_result = [];
                })

        },
        submit: function (e) {

        },
        clear_table: function () {
            eher_util.create_handsontable();
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
            var self = this, type;
            return this.validator_data.isValid_form(this)
                .then(function () {
                    return self.save_request( typeof type === 'string');
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
        excleOpenCallback: function () {
            var self = this;
            setTimeout(function () {
                eher_util.create_handsontable(self.excle_origin.list, 'mydialogExcle', self.excle_origin.handson_data)
            }, 100)
        },
        delete_confirm: function () {
            this.dialog.deletedialogVisible = false;
        },
        save_excle: function () {
            if (eher_util.check_table()) {
                var self = this;
                var _seriadata = function (_res, type) {
                    if (type) {
                        eher_util.remove_mutiple_2_list(_res,self.tableData)
                        self.dialog.excle_result_visible = false;
                    } else {
                        self.excle_origin.check_result = _res;
                        for (var i = 0, len = _res.length; i < len; i++) {
                            if (_res[i]._checkMsg) {
                                hottabel.selectCellByProp(i, 0);
                                window.hot_util && window.hot_util.highlight_col(i,0);
                            }
                        }
                    }
                }
                self.validator_data.checkProductNo(self.orgId)
                    .then(function (result) {
                        _seriadata(result, true)
                    }, function (result) {
                        _seriadata(result)
                    })
            }
        }
    }
})