define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'administrator/index' + location.search,
                    add_url: 'administrator/add',
                    edit_url: 'administrator/edit',
                    del_url: '',
                    multi_url: 'administrator/multi',
                    table: 'administrator',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                columns: [
                    [

                        {field: 'id', title: __('Id'),visible:false},
                        {field: 'user_id', title: __('商户Id')},
                        {field: 'password', title: __('Password')},
                        {field: 'user_name', title: __('账号')},
                        {field: 'super', title: __('权限'),formatter: Table.api.formatter.status,
                            custom: {1: 'success',0: 'info',2: 'success'},
                            searchList: {1:"超管",0: '普通',2: '超商'}},
                        {field: 'name', title: __('Name')},
                        {field: 'phone', title: __('手机号码')},
                        {field: 'address', title: __('地址')},
                        {field: 'forbidden', title: __('是否禁用'),formatter: Table.api.formatter.status,
                            custom: {1: 'success',0: 'info',},
                            searchList: {1:"是",0: '否'}},
                        {field: 'ali_account', title: __('支付宝账号')},
                        {field: 'ali_account_name', title: __('支付宝账号姓名')},
                        {field: 'bank_account', title: __('银行账号姓名')},
                        {field: 'bank_account_type', title: __('银行账号类型')},
                        {field: 'bank_account_name', title: __('银行卡账号')},
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}
                    ]
                ]
            });

            // 为表格绑定事件
            Table.api.bindevent(table);
        },
        add: function () {
            Controller.api.bindevent();
        },
        admin_add: function () {
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