var mixin = {
    data: {
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
        },
        excle_origin: {
            list: [],
            check_result: [],
            handson_data: {}
        }
    },
    methods: {
        save_excle: function (callback) {// v 用于回调
            var self = this;
            return new Promise(function (resolve, reject) {
                if (eher_util.check_table()) {
                    var _seriadata = function (_res, type) {
                        if (type) {
                            self.dialog.excle_result_visible = false; 
                            if(callback){
                                return resolve(_res);
                            }
                            eher_util.remove_mutiple_2_list(_res, self.tableData)
                        } else {
                            self.excle_origin.check_result = _res;
                            for (var i = 0, len = _res.length; i < len; i++) {
                                if (_res[i]._checkMsg) {
                                    hottabel.selectCellByProp(i, 0);
                                    window.hot_util && window.hot_util.highlight_col(i, 0);
                                }
                            }
                        }
                    }
                    self.validator_data.checkProductNo(self.orgId)
                        .then(function (result) {
                            _seriadata(result, true);
                        }, function (result) {
                            _seriadata(result);
                        })
                }
            });
        },
        excleOpenCallback: function () {
            var self = this;
            setTimeout(function () {
                eher_util.create_handsontable(self.excle_origin.list, 'mydialogExcle', self.excle_origin.handson_data)
            }, 100)
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
        dialogInputChange: eher_util.throttle(function (e) {
            console.log(e);
            this.dialog.keyWord = e;
            this.dialog.current = 1;
            this.add();
        }, 800),
        handleCommand: function (v) {
            this.goods_filter.selected = v;
        },
        dialogHandleCurrentChange(val) {
            this.dialog.current = val;
            this.dialog.selected = -1;
            this.add();
        },

        dialogSelectProductClose: function (v) {// v 决定是否回调
            if (this.dialog.selected === -1) return;
            var obj = this.dialog.list[this.dialog.selected];
            this.dialog.dialogVisible = false
            if (!v) {
                obj.quantity = 1;
                this.addItem(obj);
            } else {
                return Promise.resolve(obj)
            }
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
        clear_table: function () {
            eher_util.create_handsontable();
        },
        deleteRow: function (index) {
            this.tableData.splice(index, 1);
        },
    }
};