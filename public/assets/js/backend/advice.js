define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'advice/index' + location.search,
                    add_url: 'advice/add',
                    edit_url: 'advice/edit',
                    del_url: 'advice/del',
                    multi_url: 'advice/multi',
                    table: 'advice',
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

                        {field: 'id', title: __('Id')},
                        {field: 'device_id', title: __('设备名称')},
                        {field: 'user_id', title: __('用户编号')},
                        {field: 'phone', title: __('电话')},
                        {field: 'way', title: __('来源'),
                            formatter: Table.api.formatter.status,
                            custom: {1: 'info',0:'success'},
                            searchList: {1:"支付宝",0: '微信'}},
                        {field: 'content', title: __('内容')},
                        {field: 'create_time', title: __('发起时间'), operate:'RANGE', addclass:'datetimerange'},
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