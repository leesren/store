var app = window.$app = new Vue({
    el: '#wrapper',
    mixins: [mixin],
    data: {
        orgId: '8787426330226801974',
<<<<<<< HEAD
        id: location.hash.slice(2) || '', // 详情的id
        approveEmpId: '8787426330226802018', // 审核人id
=======
        id: location.hash.slice(2) || '',// 详情的id 
>>>>>>> cdf15f1a25c5a7625304840b902aeeb590ea4024
        status: 0,
        formInline: {
            buyer: '',
            in_time: '',
            store: '',
            desc: ''
        },
        formInlineRules: {
            buyer: { required: true, message: '请选择采购人' },
            in_time: { required: true, message: '请选择入库时间' },
            store: { required: true, message: '请选择仓库' },
        },
        tableData: [],
        dataList: {
            storeList: [],
            store_selected: '',
            signerList: [],
            signer_selected: ''
<<<<<<< HEAD
        }
    },
    computed: {
        _disabled: function() {
            return this.status === 1;
        }
    },
=======

        },
        empId: '8787426330226802018',
        hasPower: false
    }, 
>>>>>>> cdf15f1a25c5a7625304840b902aeeb590ea4024
    watch: {},
    created: function () {
        this.dataRequest = window.$dataRequest = new dataRequest(this.orgId);
        this.validator_data = window.$validator_data = new validator_data();
    },
    mounted: function () {

        if (this.id) {
            this.controlPower();
            this.initDataInfo();
        }
        this.visibility_view();
    },
    methods: {
        initDataInfo: function () { // 初始化单的详情
            var self = this;
            this.$http.post('/doWareHouse/queryDeliDetail', { "id": this.id })
                .then(function (result) {
                    self.formInline.in_time = result.deliveryDate;
                    self.formInline.buyer = result.receiveEmpId;
                    self.formInline.store = result.storageId;
                    self.formInline.desc = result.note;
                    self.tableData = result.itemList;
                    self.status = result.status;
                }, function (error) {
                    console.error(error);
                })
        },
<<<<<<< HEAD
        _change: function(v) {
=======
        _change: function (v) {
>>>>>>> cdf15f1a25c5a7625304840b902aeeb590ea4024
            var newObj = Object.assign({}, this.tableData[v])
            Vue.set(this.tableData, v, newObj);
        },
        _count: function (i) {
            var el = this.tableData[i];
            return (el.price * el.quantity).toFixed(2);
        },
<<<<<<< HEAD
        submit: function(e) {
=======
        submit: function (e) {
>>>>>>> cdf15f1a25c5a7625304840b902aeeb590ea4024

        },
        clear_table: function () {
            eher_util.create_handsontable();
        },
<<<<<<< HEAD
        save_request: function(data) {
=======
        save_request: function (callback) {
>>>>>>> cdf15f1a25c5a7625304840b902aeeb590ea4024
            if (!this.tableData.length) { this.$message({ message: '保存失败,您未添加产品', type: 'warning' }); return; }
            var data = {
                "storageId": this.formInline.store + '',
                "deliveryDate": eher_util.date2String(this.formInline.in_time),
                "note": this.formInline.desc,
                "receiveEmpId": this.formInline.buyer + '',
<<<<<<< HEAD
                "operatorId": this.approveEmpId, // 不填
=======
                "operatorId": this.approveEmpId,// 不填
>>>>>>> cdf15f1a25c5a7625304840b902aeeb590ea4024
                "itemList": this.tableData
            }
            var api = '/doWareHouse/saveDeliOrder';
            if (this.id) {
                data.id = this.id;
                api = '/doWareHouse/modifyDeliOrder';
            }
            var self = this;
<<<<<<< HEAD
            this.$http.post(api, data)
                .then(function(result) {
                    self.$message({ message: '添加成功', type: 'success' });
                    setTimeout(function() {
                        window.location.reload();
                    }, 400)
                }, function(error) {
                    console.error(error);
                    self.$message({ message: '添加失败,code：' + error, type: 'warning' });
                }).catch(function(error) {
                    console.error(error);
                    self.$message({ message: '添加失败', type: 'warning' });
                })

        },
        save: function() {
            var self = this;
            this.validator_data.isValid_form(this)
                .then(function() {
                    self.save_request();
=======
            return new Promise(function (resolve) {
                self.$http.post(api, data)
                    .then(function (result) {

                        if (callback) return resolve(result)
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
        save: function (callback) {
            var self = this;
            return this.validator_data.isValid_form(this)
                .then(function () {
                    return self.save_request();
>>>>>>> cdf15f1a25c5a7625304840b902aeeb590ea4024
                })
        },
        sign: function () {
            var self = this;
<<<<<<< HEAD
            if (this.id && this.approveEmpId)
                this.$http.post('/doWareHouse/approveDeliOrder', { id: this.id, approveEmpId: this.approveEmpId })
                .then(function(result) {
                    self.$message({ message: '审批成功', type: 'success' });
                    window.location.reload()
                }, function(error) {
                    self.$log(error);
                    self.$message({ message: '审批失败,code：' + error, type: 'warning' });
                })
=======
            if (this.id) {
                var _pp = function () {
                    self.$http.post('/doWareHouse/approveDeliOrder', { id: this.id, approveEmpId: this.approveEmpId })
                        .then(function (result) {
                            self.$message({ message: '审批成功', type: 'success' });
                            window.location.reload()
                        }, function (error) {
                            self.$log(error);
                            self.$message({ message: '审批失败,code：' + error, type: 'warning' });
                        })
                }
                this.save()
                    .then(function () {
                        _pp();
                    })
            }
>>>>>>> cdf15f1a25c5a7625304840b902aeeb590ea4024
        },
        unsign: function () {
            var self = this;
            this.$http.post('/doWareHouse/antiApproveDeliOrder', { id: this.id, empId: this.approveEmpId })
                .then(function (result) {
                    self.$message({ message: '取消审批成功', type: 'success' });
                    window.location.reload()
                }, function (error) {
                    self.$log(error);
                    self.$message({ message: '取消审批失败,code：' + error, type: 'warning' });
                })
        },
        out_excel: function () {
            eher_util.element_table_2_table('eltableBox', 7, '产品出库');
        },
<<<<<<< HEAD
        delete_confirm: function() {
=======
        delete_confirm: function () {
>>>>>>> cdf15f1a25c5a7625304840b902aeeb590ea4024
            var self = this;
            this.$http.post('/doWareHouse/cancelDeliOrder', { id: this.id })
                .then(function (result) {
                    setTimeout(function () {
                        history.go(-1);
                    }, 400)
                }, function (error) {
                    self.$log(error);
                    self.$message({ message: '删除出库单失败,code:' + error, type: 'warning' });
                })
        },
<<<<<<< HEAD
        controlPower: function() {
            var type = this.status == 0 ? '3' : '4';
            this.checkPower(type)
=======
        controlPower: function () {
            var self = this;
            var type = self.status == 0 ? '3' : '4';
            this.$http.post('/doWareHouse/checkPermission', { empId: self.empId, type: type }).then(function (result) {
                self.hasPower = result;
            }, function (error) {
                self.$log(error);
            })
>>>>>>> cdf15f1a25c5a7625304840b902aeeb590ea4024
        }
    }
})
window.$dataRequest.query_store($app.orgId);
window.$dataRequest.query_signer($app.orgId);