define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'admin_user/index' + location.search,
                    add_url: 'admin_user/add',
                    edit_url: 'admin_user/edit',
                    del_url: 'admin_user/del',
                    multi_url: 'admin_user/multi',
                    table: 'user',
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
                        {checkbox: true},
                        {field: 'id', title: __('Id')},
                        {field: 'user_id', title: __('User_id')},
                        {field: 'haha_user_id', title: __('Haha_user_id')},
                        {field: 'open_id', title: __('Open_id')},
                        {field: 'phone', title: __('Phone')},
                        {field: 'wx_service_status', title: __('Wx_service_status')},
                        {field: 'ali_user_id', title: __('Ali_user_id')},
                        {field: 'ali_agreement_status', title: __('Ali_agreement_status')},
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