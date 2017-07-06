
var app = window.$app = new Vue({
    el: '#wrapper',
    mixins: [ mixin ],
    data: {
        orgId: '8787426330226801974',
        id: location.hash.slice(2) || '',// 详情的id
        approveEmpId: '8787426330226802018',// 审核人id
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
        this.dataRequest = window.$dataRequest = new dataRequest(this.orgId);
        this.validator_data = window.$validator_data = new validator_data();
    },
    mounted: function () {

        if (this.id) {
            this.initDataInfo();
        }
    },
    methods: {
        initDataInfo: function () {// 初始化单的详情
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

        save_request: function (data) {
            if (!this.tableData.length) { this.$message({ message: '保存失败,您未添加产品', type: 'warning' }); return; }
            var data = {
                "storageId": this.formInline.store + '',
                "deliveryDate": eher_util.date2String(this.formInline.in_time),
                "note": this.formInline.desc,
                "receiveEmpId": this.formInline.buyer + '',
                "operatorId": '8787426330226802018',// 不填
                "itemList": this.tableData
            }
            var api = '/doWareHouse/saveDeliOrder';
            if (this.id) {
                data.id = this.id;
                api = '/doWareHouse/modifyDeliOrder';
            }
            var self = this;
            this.$http.post(api, data)
                .then(function (result) {
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

        },
        save: function () {
            var self = this;
            this.validator_data.isValid_form(this)
                .then(function () {
                    self.save_request();
                })
        },
        sign: function () {
            var self = this;
            if (this.id && this.approveEmpId)
                this.$http.post('/doWareHouse/approveDeliOrder', { id: this.id, approveEmpId: this.approveEmpId })
                    .then(function (result) {
                        self.$message({ message: '审批成功', type: 'success' });
                        window.location.reload()
                    }, function (error) {
                        self.$log(error);
                        self.$message({ message: '审批失败,code：' + error, type: 'warning' });
                    })
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
        excleOpenCallback: function () {
            this._excleOpenCallback();
        },
        delete_confirm: function () {
            this.dialog.deletedialogVisible = false;
        },
        save_excle: function () {
             this._save_excle(this);
        }
    }
})
window.$dataRequest.query_store($app.orgId);
window.$dataRequest.query_signer($app.orgId);