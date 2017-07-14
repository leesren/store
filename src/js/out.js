var app = window.$app = new Vue({
    el: '#wrapper',
    mixins: [mixin],
    data: {
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

        if (this.id) {
            this.controlPower();
            this.initDataInfo();
        }
        this.visibility_view();
    },
    methods: {
        initDataInfo: function() { // 初始化单的详情
            var self = this;
            this.$http.post('/doWareHouse/queryDeliDetail', { "id": this.id })
                .then(function(result) {
                    self.formInline.in_time = result.deliveryDate;
                    self.formInline.buyer = result.receiveEmpId;
                    self.formInline.store = result.storageId;
                    self.formInline.desc = result.note;
                    self.tableData = result.itemList;
                    self.status = result.status;
                }, function(error) {
                    console.error(error);
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
        submit: function(e) {

        },
        clear_table: function() {
            eher_util.create_handsontable();
        },
        save_request: function(data) {
            if (!this.tableData.length) { this.$message({ message: '保存失败,您未添加产品', type: 'warning' }); return; }
            var data = {
                "storageId": this.formInline.store + '',
                "deliveryDate": eher_util.date2String(this.formInline.in_time),
                "note": this.formInline.desc,
                "receiveEmpId": this.formInline.buyer + '',
                "operatorId": this.approveEmpId, // 不填
                "itemList": this.tableData
            }
            var api = '/doWareHouse/saveDeliOrder';
            if (this.id) {
                data.id = this.id;
                api = '/doWareHouse/modifyDeliOrder';
            }
            var self = this;
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
                })
        },
        sign: function() {
            var self = this;

            if (this.id && this.approveEmpId)
                this.$http.post('/doWareHouse/approveDeliOrder', { id: this.id, approveEmpId: this.approveEmpId })
                .then(function(result) {
                    self.$message({ message: '审批成功', type: 'success' });
                    window.location.reload()
                }, function(error) {
                    self.$log(error);
                    self.$message({ message: '审批失败,code：' + error, type: 'warning' });
                })

        },
        unsign: function() {
            var self = this;
            this.$http.post('/doWareHouse/antiApproveDeliOrder', { id: this.id, empId: this.approveEmpId })
                .then(function(result) {
                    self.$message({ message: '取消审批成功', type: 'success' });
                    window.location.reload()
                }, function(error) {
                    self.$log(error);
                    self.$message({ message: '取消审批失败,code：' + error, type: 'warning' });
                })
        },
        out_excel: function() {
            eher_util.element_table_2_table('eltableBox', 7, '产品出库');
        },
        delete_confirm: function() {
            var self = this;
            this.$http.post('/doWareHouse/cancelDeliOrder', { id: this.id })
                .then(function(result) {
                    setTimeout(function() {
                        history.go(-1);
                    }, 400)
                }, function(error) {
                    self.$log(error);
                    self.$message({ message: '删除出库单失败,code:' + error, type: 'warning' });
                })
        },
        controlPower: function() {
            var type = this.status == 0 ? '3' : '4';
            this.checkPower(type)
        }
    }
})
window.$dataRequest.query_store($app.orgId);
window.$dataRequest.query_signer($app.orgId);