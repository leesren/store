
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
dataRequest.prototype.query_stores = function (id,tolist) {
    return new Promise(function (resolve, reject) {
        Vue.prototype.$http.post('/doResourceCommon/listOrgTree', { "orgId": id })
            .then(function (result) {
                resolve( tolist ? eher_util.get_brand_stores(result) : eher_util.build_brand_stores_2_eltree(result));
            }, function (e) {
                reject(e);
            })
    });
}

dataRequest.prototype.query_hourse = function (orgId) {// 查询仓库
    return Vue.prototype.$http.post('/doResourceCommon/listStorage', { "orgId": orgId })
}
dataRequest.prototype.query_store = function (orgId) {// 查询仓库
    var self = window.$app;
    if (!self) { return }
    return new Promise(function (reslove, reject) {
        self.$http.post('/doResourceCommon/listStorage', { "orgId": orgId })
            .then(function (result) {
                if (result && result.length > 0) {
                    if (self.dataList && self.dataList.storeList) {
                        self.dataList.storeList = result;
                    }
                    reslove(result);
                }
            }, function (error) {
                console.error(error);
                reject(error);
            }).catch(function (error) {
                console.error(error);
                reject(error);
            })
    })

}
dataRequest.prototype.query_signer = function (orgId) {// 审核人
    var self = window.$app;
    if (!self) { return }
    self.$http.post('/doResourceCommon/listEmployee', { "orgId": orgId })
        .then(function (result) {
            if (result && result.length > 0) {
                self.dataList.signerList = result;
            }
        }, function (error) {
            console.error(error);
        }).catch(function (error) {
            console.error(error);
        })
};