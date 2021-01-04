define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'device_goods/index' + location.search,
                    add_url: 'device_goods/add',
                    edit_url: 'device_goods/edit',
                    del_url: 'device_goods/del',
                    multi_url: 'device_goods/multi',
                    table: 'device_goods',
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
                        {field: 'device_id', title: __('Device_id'),operate: 'LIKE %...%'},
                        {field: 'goods_id', title: __('Goods_id'),visible:false},
                        //{field: 'administrator_id', title: __('Administrator_id')},
                        {field: 'name', title: __('Name'),operate: 'LIKE %...%'},
                        //{field: 'barcode', title: __('Barcode')},
                        {field: 'pic', title: __('Pic'),formatter:Table.api.formatter.image},
                        //{field: 'planogram', title: __('Planogram')},
                        //{field: 'device_type', title: __('Device_type')},
                        {field: 'code', title: __('Code'),visible:false},
                        //{field: 'price', title: __('Price')},
                        {field: 'coupon', title: __('Coupon')},
                        //{field: 'create_time', title: __('Create_time'), operate:'RANGE', addclass:'datetimerange'},
                        //{field: 'lst_up_time', title: __('Lst_up_time'), operate:'RANGE', addclass:'datetimerange'},
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