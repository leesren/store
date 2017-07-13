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