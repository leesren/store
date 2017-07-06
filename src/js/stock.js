var app = new Vue({
    el: '#wrapper',
    data: {
        tableData: instock_mockdata,
        goods_filter: {
            selected: 1,
            options: [{
                value: 0,
                label: '201706'
            }, {
                value: 1,
                label: '201705'
            }, {
                value: 2,
                label: '201704'
            }, {
                value: 3,
                label: '201703'
            }, {
                value: 4,
                label: '201702'
            }],
            value: ''
        },
        activeName: '0',
        dialog: {
            gridData: instock_mockdata,
            dialogTableVisible: false,
        },
        tree_node:{
            data:tree_node,
            visible:false
        }
    },
    created: function () {

    },
    methods: {
        handleCommand: function (v) {
            this.goods_filter.selected = v;
        },
        handleClick: function (tab, event) {
            console.log(tab, event);
        },
        handleExport: function () {
            eher_util.element_table_2_table()
        },
        rowClick:function(row, event, column){
            console.log(arguments);
            this.dialog.dialogTableVisible = true;
        },
        openSelectStore:function(){
            this.tree_node.visible = true;
        }
    }
})