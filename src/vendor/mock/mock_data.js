yod.type('Instock', {
    name: '@ChineseName',
    no: '@Int(20170811029017777256,201706150290177774256)',
    status: '审批中',
    in_time: "@Date('YYYY-MM-DD HH:mm:ss', -2)",
    stock: '@ChineseName.repeat(1,2).join("")',
    buyer: '@ChineseName',
    create_time: "@Date('YYYY-MM-DD HH:mm:ss', -2)",
    signer: '@ChineseName',
    sign_time: "@Date('YYYY-MM-DD HH:mm:ss', -2)",
    desc: '-',
    id: '@Id',
    numbers: '@Int(0, 100)'
});
// 重复生成 2 - 4 个用户
var instock_mockdata = yod({
    status: 'ok',
    list: '@Instock.repeat(0,40)'
}).list


var tree_node = {
    defaultProps: {
        children: 'children',
        label: 'label'
    },
    list: [{
        id: 1,
        label: '深圳一禾美云1',
        children: [{
            id: 100,
            label: '深圳一禾美云南山店 1-1',
            children: [{
                id: 101,
                label: '深圳一禾美云南山店 AAA'
            }, {
                id: 102,
                label: '深圳一禾美云南山店 BBB'
            }]
        },{
            id: 200,
            label: '深圳一禾美云罗湖店 1-1',
            children: [{
                id: 201,
                label: '深圳一禾美云罗湖店 AAA'
            }, {
                id: 202,
                label: '深圳一禾美云罗湖店 BBB'
            }]
        },{
            id: 300,
            label: '深圳一禾美云宝安店 1-1',
            children: [{
                id: 301,
                label: '深圳一禾美云罗湖店 AAA'
            }, {
                id: 302,
                label: '深圳一禾美云罗湖店 BBB'
            }]
        }]
    }, {
        id: 2,
        label: '一级 2',
        children: [{
            id: 5,
            label: '二级 2-1'
        }, {
            id: 6,
            label: '二级 2-2'
        }]
    }]

}

