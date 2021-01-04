define(['jquery', 'bootstrap', 'backend', 'table', 'form','layui'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'courier/index' + location.search,
                    add_url: 'courier/add',
                    edit_url: 'courier/edit',
                    del_url: 'courier/del',
                    multi_url: 'courier/multi',
                    table: 'courier',
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
                        {field: 'user_name', title: __('商户姓名'),operate: 'LIKE %...%'},
                        {field: 'device_id', title: __('设备id'),operate: 'LIKE %...%'},
                        {field: 'status', title: __('Status'),formatter: Table.api.formatter.status,
                            custom: {1: 'success',0: 'info',},
                            searchList: {1:"已绑定",0: '未绑定'}},
                        {field: 'create_time', title: __('创建时间'), operate:'RANGE', addclass:'datetimerange'},
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
        },
        courier_add: function () {
            layui.use('form',function () {
                var form = layui.form;

                Controller.api.bindevent();
                require.config({
                    paths : {
                        "qrcode" : ["/assets/js/backend/my/qrcode/qrcode.min"],
                    }
                });
                $("#createCode").click(function () {

                    var str = $("#qrcode").val();

                    //解决中文乱码
                    function toUtf8(str) {
                        var out, i, len, c;
                        out = "";
                        len = str.length;
                        for (i = 0; i < len; i++) {
                            c = str.charCodeAt(i);
                            if ((c >= 0x0001) && (c <= 0x007F)) {
                                out += str.charAt(i);
                            } else if (c > 0x07FF) {
                                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
                            } else {
                                out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
                                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
                            }
                        }
                        return out;
                    }

                    var qrcode_str = toUtf8(str);


                    require(["qrcode"], function (Qrcode){
                        $("#code").qrcode({
                            render: "canvas",
                            width: 300,
                            height: 300,
                            text: tchost +'?deviceId=' + $("#qrcode2").val() +'&name=' + qrcode_str,
                        });
                    });

                })

            })



    }
    };
    return Controller;
});