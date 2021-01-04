define(['jquery', 'bootstrap', 'backend', 'table', 'form','layui'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'device_info/index' + location.search,
                    add_url: 'device_info/add',
                    edit_url: 'device_info/edit',
                    del_url: 'device_info/del',
                    multi_url: 'device_info/multi',
                    table: 'device_info',
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
                        {field: 'device_id', title: __('Device_id')},
                        {field: 'name', title: __('Name'),visible:false},
                        {field: 'address', title: __('Address')},
                        {field: 'is_online', title: __('是否在线'), formatter: Table.api.formatter.status,
                            custom: {1: 'success',2: 'info',},
                            searchList: {1:"在线",0: '离线'}},
                        {field: 'status', title: __('设备状态'), formatter: Table.api.formatter.status,
                            custom: {1: 'success',2: 'info',},
                            searchList: {1:"正常",2: '冻结'}},
                        {field: 'administrator.name', title: __('商户姓名'),operate: 'LIKE %...%'},
                        {field: 'code', title: __('二维码'), table: table,buttons:[
                                {name:'code',text:'二维码',title:function(row){return row.device_id + ' - 二维码';},icon:'fa fa-list',classname:'btn btn-xs btn-primary btn-dialog',url:'device_info/code?ids={ids}&device_id={device_id}'}
                            ],
                            events: Table.api.events.operate, formatter: Table.api.formatter.buttons},
                        {field: 'goods', title: __('管理商品'), table: table,buttons:[
                                {name:'goods',text:'管理商品',title:'管理商品',icon:'fa fa-list',classname:'btn btn-xs btn-success btn-magic btn-addtabs',url:'device_goods/index?device_id={device_id}'}
                            ],
                            events: Table.api.events.operate, formatter: Table.api.formatter.buttons},
                       {field: 'device', title: __('分配设备'), table: table,buttons:[
                                {name:'device',text:'分配设备',title:'分配设备',icon:'fa fa-list',classname:'btn btn-xs btn-success btn-magic btn-dialog',url:'device_info/device_assigned?device_id={device_id}'}
                            ],
                            events: Table.api.events.operate, formatter: Table.api.formatter.buttons},
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate},
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
        },
        code: function () {
            Controller.api.bindevent();
            require.config({
                paths : {
                    "qrcode" : ["/assets/js/backend/my/qrcode/qrcode.min"],
                }
            });
                require(["qrcode"], function (Qrcode){
                $("#code").qrcode({
                    render: "canvas",
                    width: 300,
                    height: 300,
                    text: 'https://tc.inleft.com/start?deviceId=' + $("#qrcode").val(),
                });
            });

        },
        device_assigned: function () {
            Controller.api.bindevent();
            layui.use('form',function () {
                var form = layui.form;

            })

        }
    };
    return Controller;
});