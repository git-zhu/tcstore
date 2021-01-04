define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'activity_record/index' + location.search,
                    add_url: 'activity_record/add',
                    edit_url: 'activity_record/edit',
                    del_url: 'activity_record/del',
                    multi_url: 'activity_record/multi',
                    table: 'activity_record',
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
                        {field: 'activity_id', title: __('活动编号')},
                        {field: 'device_id', title: __('设备编号')},
                        {field: 'administrator_id', title: __('管理员ID')},
                        {field: 'user_id', title: __('用户ID')},
                        {field: 'phone', title: __('手机')},
                        {field: 'create_order', title: __('是否生成订单'),
                            formatter: Table.api.formatter.status,
                            custom: {1: 'success',0: 'info'},
                            searchList: {1:"是",0: '否'}},
                        {field: 'create_time', title: __('创建时间'), operate:'RANGE', addclass:'datetimerange'},
                        {field: 'open_time', title: __('开门时间'), operate:'RANGE', addclass:'datetimerange'},
                        {field: 'close_time', title: __('关门时间'), operate:'RANGE', addclass:'datetimerange'},
                        {field: 'replenished', title: __('是否为上货'),
                            formatter: Table.api.formatter.status,
                            custom: {1: 'success',0: 'info'},
                            searchList: {1:"是",0: '否'}
                        },

                        {field: 'orderinfo.activity_id', title: __('订单编号')},

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