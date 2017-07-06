var mixin = { 
    methods: {
        _save_excle: function (self) {
            if (eher_util.check_table()) {
                var _seriadata = function (_res, type) {
                    if (type) {
                        eher_util.remove_mutiple_2_list(_res, self.tableData)
                        self.dialog.excle_result_visible = false;
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
                        _seriadata(result, true)
                    }, function (result) {
                        _seriadata(result)
                    })
            }
        },
        _excleOpenCallback:function(){
            var self = this;
            setTimeout(function () {
                eher_util.create_handsontable(self.excle_origin.list, 'mydialogExcle', self.excle_origin.handson_data)
            }, 100)
        }
    }
};