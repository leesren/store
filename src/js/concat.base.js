/**
 * Created by lessren on 2017/6/9.
 */
function log(v, isFormat) {
    console.log(!isFormat ? v : JSON.stringify(v, null, 2))
}
var _http = {
    base_prams: {
        "device": "11111",
        "sessionId": "",
        "account": "admin",
        "version": "7.2.0",
        "data": {}
    },
    // serverPath: 'http://120.24.74.199:9001/eher/api' 
    // serverPath: 'http://120.24.74.199:9001/eher/api' 
    serverPath: 'http://120.24.74.199:9001/managermentstore'
}
function post(api, data) {
    return new Promise(function (resolve, reject) {
        var base_prams = _http.base_prams;
        base_prams.data = data;
        $.ajax({
            contentType: 'application/json',
            dataType: 'json',
            type: 'POST',
            url: _http.serverPath + api,
            data: JSON.stringify(base_prams),
            success: function (result) {
                if (result.retCode === "000000") {
                    resolve(result.data);
                } else {
                    reject(result.retMsg);
                }
            },
            error: function (error) {
                if (error && error.statusText) {
                    reject(error.statusText);
                } else {
                    reject(error);
                }
            }
        });
    })
}
function get(api) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: 'GET',
            url: _http.serverPath + api,
            success: function (result) {
                if (result.retCode === "000000") {
                    resolve(result.data);
                } else {
                    reject(result.retCode);
                }
            },
            error: function (error) {
                if (error && error.statusText) {
                    reject(error.statusText);
                } else {
                    reject(error);
                }
            },
            contentType: "application/json"
        });
    })
}
function uploadFile2Oss(file) {
    return new Promise(function (resolve, reject) {
        AliYun.UploadImg(file)
            .then(function (result) {
                resolve({ name: result.name, url: result.url })
            }, function (error) {
                reject(error)
            });
    })
}

if (window.Vue) {
    Vue.prototype.$http = {
        post: post
    }
    Vue.prototype.$log = log;
}
function handsontable_util(hottable) {
    this.table = hottable;
}
handsontable_util.prototype.update_col_last_header = function(text) {
    var h = this.table.getColHeader();
    h[h.length - 1] = text;
    this.table.updateSettings({
        colHeaders: h
    }, false)
}
handsontable_util.prototype.highlight_col = function(row, column) {
    var td = this.table.getCell(row, column);
    td.classList.add('htInvalid');
}
handsontable_util.prototype._remove_excle_item = function() {
    if (!window.hottabel) return;
    var selectRow = hottabel.getSelected();
    try {
        $app.excle_origin.handson_data.data.splice(selectRow[0], 1);
        hottabel.render();
    } catch (error) {
        console.error(error);
    }

}

function eher_util() {}

eher_util.prototype.removeElementById = function(id) {
    if (id) {
        var el = document.getElementById(id);
        if (el) {
            el.remove();
        } else {
            console.error('the element contain id="' + id + '"is not contain');
        }
    }
}
eher_util.prototype.createElementById = function(id, hookid) {
    var $el = document.getElementById(id);
    if (!$el) {
        throw new Error('the element which id=' + id + ' is not contain in dom tree,please check it against');
    }
    var $hookel = hookid ? document.getElementById(hookid) : document.querySelector('body');
    var div = document.createElement('div');
    div.setAttribute("id", id);
    $el.remove();
    $hookel.append(div);
}
eher_util.prototype.excel_2_handsontable = function(excel_data) {
    var numberic_pattern = /\d+/;
    var _colums = function(_h) {
        function renderButtons(instance, td, row, col, prop, value, cellProperties) {
            td.innerHTML = '<div style="text-align:center;color:red"><button onclick="hot_util._remove_excle_item()" type="primary" style="color:#20a0ff" class="el-button el-button--text el-button--small" type="button">移除</button></div>';
        }
        return [{ data: _h[0], type: 'text' }, //allowInvalid: false,
            { data: _h[1], type: 'text' },
            { data: _h[2], type: 'numeric' },
            { data: _h[3], type: 'numeric' },
            { data: 'Delete', renderer: renderButtons }
        ]
    }
    if (!excel_data) {
        var _h = ["产品编号", "产品名称", "数量", "单价"];
        return {
            header: _h,
            colums: _colums(_h),
            data: []
        }
    }
    if (!(excel_data instanceof Array)) return null;
    var cellsObj = excel_data.slice(1);
    var sheetHeader = excel_data.slice(0, 1)[0];
    var list = [];

    for (var i = 0; i < cellsObj.length; i++) {
        var temp = {};
        for (var j = 0; j < cellsObj[i].length; j++) {
            temp[sheetHeader[j]] = cellsObj[i][j];
        }
        list.push(temp);
    }
    return {
        colums: _colums(sheetHeader),
        header: sheetHeader,
        data: list
    }
}
eher_util.prototype.check_table = function() {
    var _validte = this.validate(),
        _isvalid = true;;
    var _checknum = function(value, row, column) {
        var td = hottabel.getCell(row, column);
        if (!_validte.isNumeric(value, 1)) {
            td.classList.add('htInvalid');
            _isvalid = false;
        } else {
            td.classList.remove('htInvalid');
        }
    }
    var _checkword = function(value, row, column) {
        var td = hottabel.getCell(row, column);
        if (!value) return;
        if (!_validte.minLength(value.trim(), 1)) {
            td.classList.add('htInvalid');
            _isvalid = false;
        } else {
            td.classList.remove('htInvalid');
        }
    }
    var data = hottabel.getData();
    for (var i = 0, len = data.length; i < len; i++) {
        var row = i;
        changes = data;
        _checkword(changes[i][0], row, 0);
        _checkword(changes[i][1], row, 1);
        _checknum(changes[i][2], row, 2);
        _checknum(changes[i][3], row, 3);
    }
    return _isvalid;
}


eher_util.prototype.create_handsontable = function(ss, domId, handson_data) {
    // this.createElementById('tablebox', 'tablehook')
    var excelObj = handson_data || this.excel_2_handsontable(ss);
    var hotElement = document.getElementById(domId || 'tablebox');
    var _validte = eher_util.validate();

    var hotSettings = {
        data: excelObj.data,
        columns: excelObj.colums, // handsontable 表格字段配置
        stretchH: 'all',
        // width: table_width,
        autoWrapRow: true,
        height: 281,
        maxRows: 22,
        rowHeaders: true,
        colHeaders: excelObj.header,
        removeRowPlugin: true,
        manualColumnResize: true,
        manualRowResize: true,
        afterChange: function(changes, source) {
            var _checknum = function(value, row, column) {
                var td = hottabel.getCell(row, column);
                if (!_validte.isNumeric(value, 1)) {
                    td.classList.add('htInvalid');
                } else {
                    td.classList.remove('htInvalid');
                }
            }
            var _checkword = function(value, row, column) {
                var td = hottabel.getCell(row, column);
                if (!_validte.minLength(value.trim(), 1)) {
                    td.classList.add('htInvalid');
                } else {
                    td.classList.remove('htInvalid');
                }
            }
            if (!changes && source === 'loadData') {
                return;

            }
            var _doIsClear = function() {
                if (hottabel.getColHeader().length != changes.length) return false;
                var isClear = true;
                changes.forEach(function(e) {
                    if ((e[3] + '').trim() != '') {
                        isClear = false;
                    }
                });
                if (isClear) { // 是不是清空
                    if (!window.hottabel) return isClear;
                    var selectRow = hottabel.getSelected();
                    try {
                        $app.excle_origin.handson_data.data.splice(selectRow[0], 1);
                        hottabel.render();
                    } catch (error) {
                        console.error(error);
                    }
                }
                return isClear
            }
            if (_doIsClear()) return;
            for (var i = changes.length - 1; i >= 0; i--) {
                var row = changes[i][0];
                if (changes[i][1] === excelObj.header[0]) {
                    _checkword(changes[i][3], row, 0);
                } else if (changes[i][1] === excelObj.header[1]) {
                    _checkword(changes[i][3], row, 1);
                } else if (changes[i][1] === excelObj.header[2]) {
                    _checknum(changes[i][3], row, 2);
                } else if (changes[i][1] === excelObj.header[3]) {
                    _checknum(changes[i][3], row, 3);
                }
            }
        }
    };
    window.hottabel = new Handsontable(hotElement, hotSettings);
    var hot_util = window.hot_util = new handsontable_util(window.hottabel);
    hot_util.update_col_last_header('操作');
}
eher_util.prototype.s2ab = function s2ab(s) {
    if (typeof ArrayBuffer !== 'undefined') {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    } else {
        var buf = new Array(s.length);
        for (var i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }
}


eher_util.prototype.element_table_2_table = function(id, removeContents, filename) { // 把element-ui 对应的table，转化成标准table
    var $table = $('#' + id);
    if (!$table) { return }
    var _thead = $table.find('thead');
    var _tbody = $table.find('tbody');

    var table = document.createElement('table');
    table.setAttribute('id', id + '_table');
    table.appendChild($.clone(_thead[0]));
    var _t = $.clone(_tbody[0]);
    if (removeContents) {
        $(_t).find('tr').each(function(index, el) {
            $($(el).find('td')[removeContents]).html('');
        })
    }
    table.appendChild(_t);
    this.export_2_excle(table, filename || '仓库');
}
eher_util.prototype.export_2_excle = function(table_dom, filename) { // 导出到excle
    var type = 'xlsx';
    var wb = XLSX.utils.table_to_book(table_dom, { sheet: "Sheet JS" });
    var wbout = XLSX.write(wb, { bookType: type, bookSST: true, type: 'binary' });
    var fname = (filename || 'test') + '.' + type;
    try {
        saveAs(new Blob([eher_util.s2ab(wbout)], { type: "application/octet-stream" }), fname);
    } catch (e) { if (typeof console != 'undefined') console.log(e, wbout); }
}
eher_util.prototype.date2String = function(date) { // 导出到excle
    if (!(date instanceof Date)) {
        console.warn("您给的参数不是Date 实例");
        return date;
    }
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let m = "" + month,
        d = "";
    if (month < 10) {
        m = "0" + month;
    }

    let day = date.getDate();
    d = day + '';
    if (day < 10) {
        d = "0" + day;
    }
    return year + '-' + m + '-' + d;
}
eher_util.prototype.date_month = function(date) {
    if (!(date instanceof Date)) {
        console.warn("您给的参数不是Date 实例");
        return date;
    }
    str = this.date2String(date);
    var arr = str.split('-');
    arr.pop();
    return arr.join('-');
}
eher_util.prototype.destory_handsontable = function(id) {
    if (!window.hottabel) return;
    hottabel.destroy();
    var $dom = $('#' + id);
    if (!$dom) return;
    $dom.removeAttr('style').removeAttr('class').removeAttr('data-originalstyle');
}
eher_util.prototype.convert_handsontable_2_excle = function() {
        if (!window.hottabel) throw 'not init hondsontable instance ...'
        var data = hottabel.getSourceData();
        var list = [],
            headers = hottabel.getColHeader();
        for (var i = 0; i < data.length; i++) {
            var item = data[i],
                l = [];
            l.push(item[headers[0]]);
            l.push(item[headers[1]]);
            l.push(item[headers[2]]);
            l.push(item[headers[3]]);
            list.push(l);
        }
        return list;
    }
    /*
     * 频率控制 返回函数连续调用时，fn 执行频率限定为每多少时间执行一次
     * @param fn {function}  需要调用的函数
     * @param delay  {number}    延迟时间，单位毫秒
     * @param immediate  {bool} 给 immediate参数传递false 绑定的函数先执行，而不是delay后后执行。
     * @return {function}实际调用函数
     */
eher_util.prototype.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function() {
        var now = Date.now();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};
/*
 * 空闲控制 返回函数连续调用时，空闲时间必须大于或等于 delay，fn 才会执行
 * @param fn {function}  要调用的函数
 * @param delay   {number}    空闲时间
 * @param immediate  {bool} 给 immediate参数传递false 绑定的函数先执行，而不是delay后后执行。
 * @return {function}实际调用函数
 */

eher_util.prototype.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
        var last = Date.now() - timestamp;

        if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            }
        }
    };

    return function() {
        context = this;
        args = arguments;
        timestamp = Date.now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }

        return result;
    };
};
eher_util.prototype.getData_from_excle = function(target) {
    return new Promise(function(resolve, reject) {
        var files = target.files;

        if (!files || files.length === 0) { return reject() }

        var file = files[0];
        var fileReader = new FileReader();
        fileReader.onload = function(e) {
            var filename = file.name;
            // call 'xlsx' to read the file  
            var binary = "";
            var bytes = new Uint8Array(e.target.result);
            var length = bytes.byteLength;
            for (var i = 0; i < length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            var oFile = XLSX.read(binary, { type: 'binary', cellDates: true, cellStyles: true });
            var cells = JSON.stringify(oFile.Sheets);
            for (var key in oFile['Sheets']) {

                var data = XLSX.utils.sheet_to_json(oFile['Sheets'][key], { header: 1 });
                showme(data);
                target.value = '';
            }
        };
        fileReader.readAsArrayBuffer(file);
        var showme = function(ss) {
            resolve(ss)
        }
    })

}
eher_util.prototype.status_data = function(name) { // 返回通用的数据
    var store_status = ['未审批', '已审批'];
    var sign_status = [{ value: 0, text: '未审批' }, { value: 1, text: '已审批' }, { value: 2, text: '已删除' }];
    var outstore_status = [{ value: null, text: '全部' }, { value: 0, text: '未审批' }, { value: 1, text: '已审批' }];
    var transfer_status = [{ value: null, text: '全部' }, { value: '0', text: '待调拨' }, { value: '1', text: '已调拨' }];
    return {
        sign_status: sign_status,
        store_status: store_status,
        outstore_status: outstore_status,
        transfer_status: transfer_status,
    }
}
eher_util.prototype.remove_mutiple_2_list = function(a, b) { // 两数组重复
    for (var i = 0, len = a.length; i < len; i++) { // 去重处理
        if (!b.length) {
            b.push(a[i]);
            continue;
        }
        var flag = false;
        for (var j = 0; j < b.length; j++) {
            if (a[i].id == b[j].id) {
                flag = true;
                break;
            }
        }
        if (!flag) {
            b.push(a[i]);
        }
    }
}

eher_util.prototype.validate = function(v, type, options) {
    function IsNumeric(input) {
        return (+input) == input && ('' + input).trim().length > 0;
    }

    function isDate(d) {
        if (window.moment) {
            return window.moment(d).isValid()
        }
        return Date.parse(d) + '' != 'NaN'
    }

    function isEmptyInputValue(value) {
        return value == null || value.length === 0;
    }

    function isEmail(v) {
        var EMAIL_REGEXP =
            /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
        return EMAIL_REGEXP.test(v)
    }

    function min(v, _min) {
        if (isEmptyInputValue(v) || isEmptyInputValue(_min)) {
            return false;
        }
        const value = parseFloat(v);
        return !isNaN(value) && value < min
    }

    function max(v, _max) {
        if (isEmptyInputValue(v) || isEmptyInputValue(_max)) {
            return false;
        }
        const value = parseFloat(v);
        return !isNaN(value) && value > _max
    }

    function minLength(v, len) {
        if (isEmptyInputValue(v)) {
            return false; // don't validate empty values to allow optional controls
        }
        var length = v ? v.length : 0;
        return length >= len
    }

    function maxLength(v, len) {
        var length = v ? v.length : 0;
        return length <= len
    }
    return {
        maxLength: maxLength,
        minLength: minLength,
        max: max,
        min: max,
        isEmail: isEmail,
        isEmptyInputValue: isEmptyInputValue,
        isDate: isDate,
        isNumeric: IsNumeric
    }
}
eher_util.prototype.build_brand_stores_2_eltree = function(list) {
    if (!list) return;

    function storeinfo(store) {
        if (store instanceof Array) {
            for (var j = 0; j < store.length; j++) {
                var s = store[j];
                if (s.leaf) {
                    s.id = s.content.id;
                    s.label = s.content.name;
                    s.parentId = s.content.parentId;
                } else {
                    storeinfo(s)
                }
            }
        } else {
            store.id = store.content.id;
            store.label = store.content.name;
            store.parentId = store.content.parentId;
            if (!store.leaf) {
                storeinfo(store.children);
            }
        }
    }
    storeinfo(list);
    return list;
}
eher_util.prototype.get_brand_stores = function(brandTree) {
    if (!brandTree) return;
    var l = [];

    function storeinfo(store) {
        if (store instanceof Array) {
            for (var j = 0; j < store.length; j++) {
                var s = store[j];
                s.leaf ? l.push(s.content) : storeinfo(s);
            }
        } else {
            store['id'] = store.content.id;
            store['name'] = store.content.name;
            store['parentId'] = store.content.parentId;
            l.push(store.content);
            if (!store.leaf) {
                storeinfo(store.children);
            }
        }
    }
    storeinfo(brandTree);
    return l;
}





function dataRequest(orgId) {
    this.orgId = orgId;
}
dataRequest.prototype.listGoods = function(keyWord, page, size, orgId) {
    var data = {
        orgId: this.orgId,
        keyWord: keyWord,
        page: page || 1,
        size: size || 10
    }
    if (orgId) {
        data.orgId = orgId;
    }
    return Vue.prototype.$http.post('/doResourceCommon/listGoods', data)
}
dataRequest.prototype.query_stores = function(id, tolist) {
    return new Promise(function(resolve, reject) {
        Vue.prototype.$http.post('/doResourceCommon/listOrgTree', { "orgId": id })
            .then(function(result) {
                resolve(tolist ? eher_util.get_brand_stores(result) : eher_util.build_brand_stores_2_eltree(result));
            }, function(e) {
                reject(e);
            })
    });
}

dataRequest.prototype.query_hourse = function(orgId) { // 查询仓库
    return Vue.prototype.$http.post('/doResourceCommon/listStorage', { "orgId": orgId })
}
dataRequest.prototype.query_product_by_barcode = function(barCode) { // 查询仓库
    return Vue.prototype.$http.post('/doResourceCommon/checkBarCode', { "barCode": barCode })
}
dataRequest.prototype.query_store = function(orgId) { // 查询仓库
    var self = window.$app;
    if (!self) { return }
    return new Promise(function(reslove, reject) {
        self.$http.post('/doResourceCommon/listStorage', { "orgId": orgId })
            .then(function(result) {
                if (result && result.length > 0) {
                    if (self.dataList && self.dataList.storeList) {
                        self.dataList.storeList = result;
                    }
                    reslove(result);
                }
            }, function(error) {
                console.error(error);
                reject(error);
            }).catch(function(error) {
                console.error(error);
                reject(error);
            })
    })

}
dataRequest.prototype.query_signer = function(orgId) { // 审核人
    var self = window.$app;
    if (!self) { return }
    self.$http.post('/doResourceCommon/listEmployee', { "orgId": orgId })
        .then(function(result) {
            if (result && result.length > 0) {
                self.dataList.signerList = result;
            }
        }, function(error) {
            console.error(error);
        }).catch(function(error) {
            console.error(error);
        })
};

function validator_data() {}

validator_data.prototype.isvalid_handsontable = function() {
    return new Promise(function(resolve, reject) {
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
                if (excelObj.htabel_header[j].validator &&
                    excelObj.htabel_header[j].date_format &&
                    !moment(el, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
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
validator_data.prototype.isValid_form = function(self) {
    return new Promise(function(resolve, reject) {
        self.$refs.ruleForm.validate((valid) => {
            if (valid) {
                resolve();
            } else {
                reject();
            }
        })

    });
}

validator_data.prototype.covert_handsontable_data = function(hottable) {
    var hot = hottable || window['hottabel'];
    if (!hot) throw 'hondsontable not init ...';
    var source_data = hot.getSourceData();
    var result = [];
    source_data.forEach(function(el, index) {
        result.push(eher_util.handsontable_data_2_obj(el));
    })
    return result;
}
validator_data.prototype.checkProductNo = function(orgId) {
    if (!orgId) return Promise.reject('参数错误');
    var isValid = function(result) {
        return new Promise(function(resolve, reject) {
            if (!(result instanceof Array)) reject([]);
            var _isValid = true,
                l = [],
                _checkResult = '';
            for (var i = 0, len = result.length; i < len; i++) {
                var el = result[i],
                    tmp = {};
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
    var listNo = valid_excle_data.map(function(el) {
        return el[key]
    })

    return Vue.prototype.$http.post('/doResourceCommon/checkProductNo', { orgId: orgId, productNoList: listNo })
        .then(function(result) {
            return isValid(result);
        })
}


window.eher_util = new eher_util();
window.validator_data = validator_data;
window.dataRequest = dataRequest;
Vue.component('my-upload', {
    template: '<div class="my-upload" style="width:auto" :class="__disabled()">'
    + '<button class="el-button--small  el-button " :disabled="disabled" :class="_class()" @click="handleClick"><slot>上传文件</slot> </button>'
    + '<input class="el-upload__input myel-upload__input" type="file" ref="input" @change="_onChange" :accept="accept"></input>'
    + '</div>',
    props: {
        multiple: {
            type: [String, Boolean]
        },
        accept: {
            type: String,
            default: ''
        },
        change: Function,
        type: {
            type: String,
            default: 'primary'// type="success"
        },
        disabled: [String, Boolean]
    },
    methods: {
        _onChange: function (e) {
            this.change(e.target);
            // this.$emit('change',e.target)
        },
        handleClick: function () {
            var el = this.$refs.input;
            if (el) el.click();
        },
        submit: function () {
            console.log('submit');
        },
        _class: function () {
            return { "el-button--primary": this.type === "primary", "el-button--success": this.type === "success", "is-disabled": this.disabled }
        },
        __disabled: function () {
            return { 'el-input is-disabled': this.disabled }
        }
    }
})
Vue.component('my-excle-note', {
    template: '<div><div>注意：</div>' +
    '<ul>' +
    ' <li>从Excle导入的产品，必须是已经存在的产品，不然导入失败</li>' +
    '<li>模板格式是不是正确，重复编号的产品只去第一条</li>' +
    '<li>Excle里的数据格式是否在正确，请确认您输入的日期格式、数字格式、编号、中英文符号是否正确</li>' +
    '</ul></div>'
})
Vue.component('my-query-filter', {
    template: '<div flex flexbox flex-center>' +
    '<label for="" style="margin:0 10px 0 40px">输入产品条形码</label>' +
    '<section flex="" class="el-input el-input--small">' +
    '<input autocomplete="off" placeholder="筛选/查询" @blur="handleBlur" @focus="handleFocus" @input="handleInput" :value="currentValue" v-bind="$props" size="small" type="text" @keyup.enter="handleKeyEnter" class="el-input__inner query--input">' +
    '</section>' +
    '</div>',
    props: {
        value: [String, Number],
        disabled: Boolean,
    },
    watch: {
        'value'(val, oldValue) {
            this.setCurrentValue(val);
        }
    },
    data: function () {
        return {
            currentValue: this.value
        }
    },
    methods: {
        handleKeyEnter: function (e) {
            this.$emit('keydown-enter', e);
        },
        handleInput(event) {
            var value = event.target.value;
            this.$emit('input', value);
            this.setCurrentValue(value);
        },
        setCurrentValue(value) {
            if (value === this.currentValue) return;
            this.currentValue = value;
        },
        handleBlur(event) {
            this.$emit('blur', event);
        },
        handleFocus(event) {
            this.$emit('focus', event);
        },
    }
})


var mixin = window.mixin = {
    data: {
        approveEmpId: null,// 审核人id
        barcode: '',
        orgId: '8787426330226801974',
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
        },
        visibility: '', //visible
        hasPower: false
    },
    computed: {
        _disabled: function () {
            return this.status === 1;
        }
    },
    methods: {
        save_excle: function(callback) { // v 用于回调
            var self = this;
            return new Promise(function(resolve, reject) {
                if (eher_util.check_table()) {
                    var _seriadata = function(_res, type) {
                        if (type) {
                            self.dialog.excle_result_visible = false;
                            if (!(callback instanceof MouseEvent)) {
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
                        .then(function(result) {
                            _seriadata(result, true);
                        }, function(result) {
                            _seriadata(result);
                        })
                }
            });
        },
        excleOpenCallback: function() {
            var self = this;
            setTimeout(function() {
                eher_util.create_handsontable(self.excle_origin.list, 'mydialogExcle', self.excle_origin.handson_data)
            }, 100)
        },
        _onChange: function(target) {
            var self = this;
            eher_util.getData_from_excle(target)
                .then(function(data) {
                    eher_util.destory_handsontable('mydialogExcle'); // 清楚handsontable 数据
                    self.excle_origin.list = data;
                    self.excle_origin.handson_data = eher_util.excel_2_handsontable(data);
                    self.dialog.excle_result_visible = true;
                    self.excle_origin.check_result = [];
                })

        },
        dialogInputChange: eher_util.throttle(function(e) {
            console.log(e);
            this.dialog.keyWord = e;
            this.dialog.current = 1;
            this.add();
        }, 800),
        handleCommand: function(v) {
            this.goods_filter.selected = v;
        },
        dialogHandleCurrentChange(val) {
            this.dialog.current = val;
            this.dialog.selected = -1;
            this.add();
        },

        dialogSelectProductClose: function(v) { // v 决定是否回调
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
        dialogSelectedItem: function(item, index) {
            if (index === this.dialog.selected) {
                this.dialog.selected = -1;
            } else {
                this.dialog.selected = index;
            }
        },
        addItem: function(data, index) {
            if (!data) return;
            var contain = this.tableData.filter(function(el, index) {
                return el.productId === data.id
            })
            if (contain && contain.length > 0) return;
            data.productId = data.id;
            data.productName = data.name;
            delete data.id;
            delete data.name;
            this.tableData.push(data);
        },
        add: function() {
            var self = this;
            this.dataRequest.listGoods(this.dialog.keyWord, this.dialog.current, '', this.orgId).then(function(result) {
                if (result) {
                    self.dialog.list = result.list;
                    self.dialog.total = result.total;
                }
                self.dialog.dialogVisible = true;
            })
        },
        clear_table: function() {
            eher_util.create_handsontable();
        },
        deleteRow: function(index) {
            this.tableData.splice(index, 1);
        },
        visibility_view: function () {
            var el = $('.my-invisi')
            if (el) {
                el.removeClass('my-invisi');
            }
        },
        keyupEnter: function (callback) {
            var self = this, callback = !(callback instanceof KeyboardEvent);
            return new Promise(function (resolve, reject) {

                self.dataRequest.query_product_by_barcode(self.barcode)
                    .then(function(e) {
                        if (!e) {
                            self.$message({ message: '无此产品条形码相关的产品', type: 'warning' });
                            return;
                        }
                        self.$message({ message: '找到相关产品', type: 'success' });
                        if (callback) return resolve(e);
                        e.quantity = e.quantity || 1;
                        self.addItem(e);
                    }, function(e) {
                        self.$message({ message: '取消审批失败,code：' + e, type: 'warning' });
                        reject(e);
                    })
            })

        },
        checkPower: function(type) {
            var self = this;
            this.$http.post('/doWareHouse/checkPermission', { empId: self.approveEmpId, type: type }).then(function(result) {
                self.hasPower = result;
            }, function(error) {
                self.$log(error);
            })
        }
    }
};