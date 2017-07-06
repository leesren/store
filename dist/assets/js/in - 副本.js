


function dataRequest(orgId) {
    this.orgId = orgId;
}
dataRequest.prototype.listGoods = function (keyWord, page, size) {
    var data = {
        orgId: this.orgId,
        keyWord: keyWord,
        page: page || 1,
        size: size || 10
    }
    return Vue.prototype.$http.post('/doResourceCommon/listGoods', data)
}

function validator_data() { }

validator_data.prototype.isvalid_handsontable = function () {
    return new Promise(function (resolve, reject) {
        var dd = hottabel.getData();
        if (dd.length === 0) {
            return reject();
        }
        // 检测试不是空行
        for (var index = 0, len = dd.length; index < len; index++) {
            if (hottabel.isEmptyRow(index)) {
                hottabel.alter('remove_row', index);
                break;
            }
        }

        dd = hottabel.getData();
        if (dd.length === 0) {
            return reject();
        }
        // 检测所有的单元格
        var is_valid = [];
        for (index = 0, len = dd.length; index < len; index++) {
            var element = dd[index];
            var is_continue = true;
            for (var j = 0; j < element.length; j++) {
                var el = element[j];
                if (excelObj.htabel_header[j].validator && (el === '' || el === null || el === undefined)) {
                    is_valid.push({ r: index, c: j })
                    continue;
                }
                if (excelObj.htabel_header[j].validator
                    && excelObj.htabel_header[j].date_format
                    && !moment(el, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
                    is_valid.push({ r: index, c: j })
                    continue;
                }
                if (excelObj.htabel_header[j].validator && !excelObj.htabel_header[j].validator.test(el)) {
                    is_valid.push({ r: index, c: j })
                    continue;
                }
            }
        }
        // 高亮提示是不是符合格式
        if (is_valid.length > 0) {
            for (index = 0; index < is_valid.length; index++) {
                var element = is_valid[index];

                var cell = hottabel.getCell(element.r, element.c);
                if (cell) {
                    cell.classList.add('htInvalid');
                }
            }
            return reject()
        } else {
            console.log(JSON.stringify(dd, null, 2));
            return resolve(dd);
        }
    })

}
validator_data.prototype.isValid_form = function (self) {
    return new Promise(function (resolve, reject) {
        self.$refs.ruleForm.validate((valid) => {
            if (valid) {
                resolve();
            } else {
                reject();
            }
        })

    });
}

validator_data.prototype.covert_handsontable_data = function (hottable) {
    var hot = hottable || window['hottabel'];
    if (!hot) throw 'hondsontable not init ...';
    var source_data = hot.getSourceData();
    var result = [];
    source_data.forEach(function (el, index) {
        result.push(eher_util.handsontable_data_2_obj(el));
    })
    return result;
}
validator_data.prototype.checkProductNo = function (orgId) {
    if (!orgId) return Promise.reject('参数错误');
    var isValid = function (result) {
        return new Promise(function (resolve, reject) {
            if (!(result instanceof Array)) reject([]);
            var _isValid = true, l = [], _checkResult = '';
            for (var i = 0, len = result.length; i < len; i++) {
                var el = result[i], tmp = {};
                if (el && el.valid == 0) {
                    _isValid = false;
                }
                _checkResult = el.valid === 0 ? '产品编号不存在' : '';
                l.push({
                    "productId": el.id,
                    "numberCode": el.numberCode,
                    "productName": el.name,
                    "unitId": el.unitId,
                    "unitName": el.unitName,
                    "price": el.price || 0,
                    "spec": el.spec,
                    "quantity": el.quantity || 1,
                    "valid": el.valid,
                    "_checkMsg": _checkResult
                })
            }
            _isValid ? resolve(l) : reject(l);
        })
    }
    var self = $app;
    var valid_excle_data = self.excle_origin.handson_data.data;
    if (!valid_excle_data) return;

    var key = $app.excle_origin.handson_data.header[0];
    var listNo = valid_excle_data.map(function (el) {
        return el[key]
    })

    return Vue.prototype.$http.post('/doResourceCommon/checkProductNo', { orgId: orgId, productNoList: listNo })
        .then(function (result) {
            return isValid(result);
        })
}
var app = window.$app = new Vue({
    el: '#wrapper',
    data: {
        orgId: '8787426330226801974',
        id: '8752752929078097473',// 详情的id
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
        this.query_store();
        this.query_signer();
    },
    mounted: function () {

        console.log(this.$refs.coderef);
        this.dataRequest = new dataRequest(this.orgId);
        this.validator_data = new validator_data();

        if (this.id) {
            this.initDataInfo();
        }
    },
    methods: {
        initDataInfo: function () {// 初始化单的详情
            var self = this;
            this.$http.post('/doWareHouse/queryEntryDetail', { "id": this.id })
                .then(function (result) {
                    self.formInline.in_time = result.entryDate;
                    self.formInline.buyer = result.purchaseEmpId;
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


        save_request: function (data) {

            var data = {
                "storageId": this.formInline.store + '',
                "entryDate": eher_util.date2String(this.formInline.in_time),
                "note": this.formInline.desc,
                "purchaseEmpId": this.formInline.buyer + '',
                "operatorId": '8787426330226802018',// 不填
                "itemList": this.tableData
            }
            var api = '/doWareHouse/saveEntryOrder';
            if (this.id) {
                data.id = this.id;
                api = '/doWareHouse/modifyEntryOrder';
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
                this.$http.post('/doWareHouse/approveEntryOrder', { id: this.id, approveEmpId: this.approveEmpId })
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
            this.$http.post('/doWareHouse/antiApproveEntryOrder', { id: this.id, empId: this.approveEmpId })
                .then(function (result) {
                    self.$message({ message: '取消审批成功', type: 'success' });
                    window.location.reload()
                }, function (error) {
                    self.$log(error);
                    self.$message({ message: '取消审批失败,code：' + error, type: 'warning' });
                })
        },
        out_excel: function () {
            eher_util.element_table_2_table('eltableBox', 7, '产品入库');
        },
        excleOpenCallback: function () {
            console.log('dd');
            var self = this;
            setTimeout(function () {
                eher_util.create_handsontable(self.excle_origin.list, 'mydialogExcle', self.excle_origin.handson_data)
            }, 100)
        },
        delete_confirm: function () {
            this.dialog.deletedialogVisible = false;
            console.log('dd');
        },
        save_excle: function () {
            if (eher_util.check_table()) {
                var self = this;
                var _seriadata = function (_res, type) {
                    if (type) {
                        self.tableData = self.tableData.concat(_res);
                        self.dialog.excle_result_visible = false;
                    } else {
                        self.excle_origin.check_result = _res;
                        for (var i = 0, len = _res.length; i < len; i++) {
                            if (_res[i]._checkMsg) {
                                hottabel.selectCellByProp(i, 0);
                                break;
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