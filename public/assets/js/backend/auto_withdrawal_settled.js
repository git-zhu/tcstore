define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'auto_withdrawal_settled/index' + location.search,
                    add_url: 'auto_withdrawal_settled/add',
                    edit_url: '',
                    del_url: '',
                    multi_url: 'auto_withdrawal_settled/multi',
                    table: 'auto_withdrawal_settled',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                //禁用默认搜索
                search:false,
                columns: [
                    [
                        {field: 'id', title: __('Id'),visible:false},
                        {field: 'wo_id', title: __('Wo_id')},
                        //{field: 'administrator_id', title: __('商户ID')},
                        {field: 'administrator.name', title: __('商户姓名')},
                        {field: 'type', title: __('Type'),formatter: Table.api.formatter.status,
                            custom: {0: 'success',1: 'info',},
                            searchList: {0:"微信",1: '支付宝'}},
                        {field: 'status', title: __('结算状态'), formatter: Table.api.formatter.status,
                            custom: {1: 'success',0: 'info',},
                            searchList: {1:"已结算",0: '未结算'}},
                        {field: 'count', title: __('Count'), operate:'BETWEEN'},
                        {field: 'create_time', title: __('Create_time'), operate:'RANGE', addclass:'datetimerange'},
                        /*{field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}*/
                    ]
                ]
            });

            // 为表格绑定事件
            Table.api.bindevent(table);
        },
        add: function () {
            Controller.api.bindevent();
        },
        edit: function () {
            Controller.api.bindevent();
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});