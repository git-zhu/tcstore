define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            //自定义导出
            var submitForm = function (ids, layero) {
                var options = table.bootstrapTable('getOptions');

                var columns = [];
                $.each(options.columns[0], function (i, j) {
                    if (j.field && !j.checkbox && j.visible && j.field != 'operate') {
                        columns.push(j.field);
                    }
                });
                var search = options.queryParams({});
                $("input[name=search]", layero).val(options.searchText);
                $("input[name=ids]", layero).val(ids);
                $("input[name=filter]", layero).val(search.filter);
                $("input[name=op]", layero).val(search.op);
                $("input[name=columns]", layero).val(columns.join(','));
                $("form", layero).submit();
            };
            $(document).on("click", ".btn-export", function () {
                var ids = Table.api.selectedids(table);
                var page = table.bootstrapTable('getData');
                var all = table.bootstrapTable('getOptions').totalRows;

                Layer.confirm("请选择导出的选项<form action='" + Fast.api.fixurl("order_info/export") + "' method='post' target='_blank'><input type='hidden' name='ids' value='' /><input type='hidden' name='filter' ><input type='hidden' name='op'><input type='hidden' name='search'><input type='hidden' name='columns'></form>", {
                    title: '导出数据',
                    btn: ["选中项(" + ids.length + "条)", "本页(" + page.length + "条)", "全部(" + all + "条)"],
                    success: function (layero, index) {
                        $(".layui-layer-btn a", layero).addClass("layui-layer-btn0");
                    }
                    , yes: function (index, layero) {
                        submitForm(ids.join(","), layero);
                        return false;
                    }
                    ,
                    btn2: function (index, layero) {
                        var ids = [];
                        $.each(page, function (i, j) {
                            ids.push(j.id);
                        });
                        submitForm(ids.join(","), layero);
                        return false;
                    }
                    ,
                    btn3: function (index, layero) {
                        submitForm("all", layero);
                        return false;
                    }
                })
            });
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'order_info/index' + location.search,
                    //add_url: 'order_info/add',
                    //edit_url: 'order_info/edit',
                    del_url: 'order_info/del',
                    multi_url: 'order_info/multi',
                    detail_url:'order_info/order_detail',
                    table: 'order_info',
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

                        {field: 'id',title: __('ID'),visible: false},
                        {field: 'order_id', title: __('订单编号'),operate: 'LIKE %...%'},
                        {field: 'device_id', title: __('设备编号'),operate: 'LIKE %...%'},
                        {field: 'order_name', title: __('订单标题'),operate: 'LIKE %...%'},
                        {field: 'order_money', title: __('订单总额')},
                        {field: 'create_time', title: __('创建时间'), operate:'RANGE', addclass:'datetimerange'},
                        {field: 'order_status', title: __('订单状态'),
                            formatter: Table.api.formatter.status,
                            custom: {1: 'info',2: 'success',3: 'gray', 4: 'danger',0: 'danger'},
                            searchList: {1:"已确认",2: '已支付',3:"已退款或失效", 4: '扣款失败',0: '未支付'}},
                        {field: 'pay_way', title: __('支付方式'),
                            formatter: Table.api.formatter.status,
                            custom: {0: 'success',1: 'info'},
                            searchList: {0:"微信",1: '支付宝'}},
                        {field: 'activityrecord.phone', title: __('用户手机号码')},
                        {field: 'operate', title: __('Operate'), table: table,buttons:[
                                {name:'detail',text:'查看详情',title:'查看详情',icon:'fa fa-list',classname:'btn btn-xs btn-primary btn-dialog',url:'order_info/detail'}
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
        order_detail:function(){
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