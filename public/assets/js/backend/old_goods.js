define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'old_goods/index' + location.search,
                    add_url: '',
                    edit_url: '',
                    del_url: '',
                    multi_url: 'old_goods/multi',
                    table: 'goods',
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
                        {field: 'goods_id', title: __('商品编号')},
                        {field: 'name', title: __('Name'),operate: 'LIKE %...%'},
                        //{field: 'barcode', title: __('Barcode')},
                        {field: 'pic', title: __('商品图'),formatter:Table.api.formatter.image},
                        //{field: 'planogram', title: __('Planogram'),formatter:Table.api.formatter.image},
                        {field: 'device_type', title: __('适用设备'),
                            formatter: Table.api.formatter.status,
                            custom: {0:'success',1: 'info',2: 'success'},
                            searchList: {0:"全部",1: "静态",2:"动态"}},
                        //{field: 'goodstype.name', title: __('Goodstype.name')},
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate} ]
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