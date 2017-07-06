

var app = new Vue({
    el: '#pager_main',
    data: {
        goods_filter: {
            selected: 0,
            options: [
                { key: 0, text: '全部' }, { key: 1, text: '黄金糕' }, { key: 2, text: '蚵仔煎' }, { key: 3, text: '双皮奶' }, { key: 4, text: '螺蛳粉' }, { key: 5, text: '狮子头' },
            ]
        },
        start: "2017-04-15",
        end: "2017-06-15",
        tableData: instock_mockdata,
    },
    created: function () {
    },
    methods: {
        handleCommand: function (v) {
            this.goods_filter.selected = v;
        }
    }
})