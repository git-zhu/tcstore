define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'device_sales/index' + location.search,
                    add_url: 'device_sales/add',
                    edit_url: 'device_sales/edit',
                    del_url: 'device_sales/del',
                    multi_url: 'device_sales/multi',
                    table: 'order_info',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                search:false,
                columns: [
                    [
                        {field: 'id', title: __('ID'),visible: false,operate: false},
                        {field: 'device_id', title: __('设备编号')},
                        {field: 'create_time', title: __('时间'), operate:'RANGE', addclass:'datetimerange',visible: false},
                        {field: 'administrator.name', title: __('Administrator.name')},
                        {field: 'count', title: __('订单量'),operate: false},
                        {field: 'price', title: __('客单价'),operate: false},
                        {field: 'money', title: __('总收入'),operate: false},
                        {field: 'operate', title: __('Operate'), table: table,buttons:[
                                {name:'detail',text:'销量统计',title:'销量统计',icon:'fa fa-list-alt',classname:'btn btn-xs btn-info btn-dialog',url:'stock/sales?device_id={device_id}'}
                            ],
                            events: Table.api.events.operate, formatter: Table.api.formatter.buttons}
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