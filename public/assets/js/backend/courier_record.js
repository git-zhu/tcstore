define(['jquery', 'bootstrap', 'backend', 'table', 'form','layui'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'courier_record/index' + location.search,
                    add_url: 'courier_record/add',
                    edit_url: 'courier_record/edit',
                    del_url: 'courier_record/del',
                    multi_url: 'courier_record/multi',
                    table: 'courier_record',
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
                        {field: 'courier_name', title: __('上货员姓名'),operate: 'LIKE %...%'},
                        {field: 'device_id', title: __('设备id'),operate: 'LIKE %...%'},
                        {field: 'status', title: __('Status'),formatter: Table.api.formatter.status,
                            custom: {1: 'success',0: 'info',},
                            searchList: {1:"上货成功",0: '非上货'}},
                        {field: 'lst_up_time', title: __('时间'), operate:'RANGE', addclass:'datetimerange'},
                        {field: 'operate', title: __('Operate'), table: table,buttons:[
                                {name:'detail',text:'查看详情',title:'查看详情',icon:'fa fa-list',classname:'btn btn-xs btn-primary btn-dialog',url:'courier_record/detail?ids={ids}'}
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
        detail: function () {
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