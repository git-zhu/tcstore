define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'withdrawal/index' + location.search,
                    add_url: 'withdrawal/add',
                    edit_url: 'withdrawal/edit',
                    del_url: 'withdrawal/del',
                    multi_url: 'withdrawal/multi',
                    table: 'withdrawal',
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

                        {field: 'wo_id', title: __('工单号')},
                        {field: 'create_time', title: __('创建时间'), operate:'RANGE', addclass:'datetimerange'},
                        {field: 'finish_time', title: __('结算时间'), operate:'RANGE', addclass:'datetimerange'},
                        {field: 'status', title: __('Status'),formatter: Table.api.formatter.status,
                            custom: {1: 'success',0: 'info',NULL:'info'},
                            searchList: {1:"已结算",0: '未结算',NULL: '未结算'}},
                        {field: 'total_amount', title: __('总金额')},
                        {field: 'wx_amount', title: __('微信金额')},
                        {field: 'ali_amount', title: __('支付宝金额')},
                        {field: 'administrator.name', title: __('管理员姓名'),operate: 'LIKE %...%'}
/*                        {field: 'count', title: __('结算'), table: table,buttons:[
                                {   name:'detail',
                                    text:'结算',
                                    title:'结算',
                                    icon:'fa fa-cny',
                                    classname:'btn btn-xs btn-primary btn-dialog',
                                    confirm:'确认结算？',
                                    url:'withdrawal/count',
                                    visible:function (row) {
                                    if(row.status == 0){
                                        return true;
                                    }

                                    }
                                }
                            ],
                            events: Table.api.events.operate, formatter: Table.api.formatter.buttons},
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}*/
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