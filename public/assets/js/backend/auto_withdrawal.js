define(['jquery', 'bootstrap', 'backend', 'table', 'form','layui'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            //layui引入
            layui.use('element', function(){
                var element = layui.element;

                //微信结算
                $('#wx_count').on("click",function () {
                    layer.confirm('确认结算微信金额吗？',{
                        icon:3,
                        title:'结算提醒',
                        yes:function(){
                            $.ajax({
                                url:'auto_withdrawal/count?pay_way=0',
                                type:'post',
                                success:function(data){
                                    if(data.code ==1){
                                        layer.msg(data.msg,{icon:6}
                                            ,function(){
                                                location.reload();
                                            });
                                    }else{
                                        layer.msg(data.msg,{icon:5})
                                        return false;
                                    }
                                }
                            })
                        }

                    })
                })
                //支付宝结算
                $('#ali_count').on("click",function () {
                    layer.confirm('确认结算支付宝金额吗？',{
                        icon:3,
                        title:'结算提醒',
                        yes:function(){
                            $.ajax({
                                url:'auto_withdrawal/count?pay_way=1',
                                type:'post',
                                success:function(data){
                                    if(data.code ==1){
                                        layer.msg(data.msg,{icon:6}
                                            ,function(){
                                                location.reload();
                                            });
                                    }else{
                                        layer.msg(data.msg,{icon:5})
                                        return false;
                                    }
                                }
                            })
                        }

                    })
                })

                //跳转到微信提现页面
                $('#wx_withdrawal').on('click',function () {
                    layer.open({
                        type:2,
                        title:'申请提现',
                        area: ['100%', '75%'],
                        content:'auto_withdrawal/get_wx_money',
                        end:function () {
                            location.reload();
                        }

                    })

                })
                $('#ali_withdrawal').on('click',function () {
                    layer.open({
                        type:2,
                        title:'申请提现',
                        area: ['100%', '75%'],
                        content:'auto_withdrawal/get_ali_money',
                        end:function () {
                            location.reload();

                        }

                    })

                })

            })
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'auto_withdrawal/index' + location.search,
                    add_url: 'auto_withdrawal/add',
                    edit_url: '',
                    del_url: '',
                    multi_url: 'auto_withdrawal/multi',
                    table: 'auto_withdrawal',
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
                        {field: 'id',title: __('ID'),visible:false},
                        {field: 'wo_id', title: __('工单号')},
                        {field: 'administrator.name', title: __('商户姓名')},
                        {field: 'name', title: __('收款人')},
                        {field: 'type', title: __('工单类型'), formatter: Table.api.formatter.status,
                            custom: {0: 'success',1: 'info',},
                            searchList: {0:"微信",1: '支付宝'}},
                        {field: 'status', title: __('状态'), formatter: Table.api.formatter.status,
                            custom: {1: 'success',0: 'info',2:'danger'},
                            searchList: {1:"已到账",0: '未到账',2:'提现失败'}},
                        {field: 'money', title: __('申请金额'), operate:'BETWEEN'},
                        {field: 'amount', title: __('到账金额'), operate:'BETWEEN'},
                        {field: 'fee', title: __('手续费'), operate:'BETWEEN'},
                        {field: 'create_time', title: __('提现时间'), operate:'RANGE', addclass:'datetimerange'},
                        {field: 'update_time', title: __('到账时间'), operate:'RANGE', addclass:'datetimerange'},
                        /*{field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}*/
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
        get_wx_money: function () {
            layui.use('form',function () {
                var form =layui.form;
                $ = layui.$;

                //微信提现页面提交数据
                form.on('submit(sub)',function (data) {
                    //禁用按钮
                    $('#btn').addClass("layui-btn-disabled").attr('disabled',true);
                    $.ajax({
                        url: 'auto_withdrawal/do_get_wx_money',
                        type: 'post',
                        data:data.field,
                        success: function(data){


                            if(data.code==1){
                                layer.msg('发起提现成功!',{icon:1,time:6000},function () {
                                    location.reload();
                                });
                            }else{
                                layer.msg(data.msg,{icon:2,time:5000});
                            }
                        }

                    });
                    return false;

                })




            })
        },
        get_ali_money: function () {
            layui.use('form',function () {
                var form =layui.form;
                $ = layui.$;

                //支付宝提现页面提交数据
                form.on('submit(sub)',function (data) {
                    //禁用按钮
                    $('#btn').addClass("layui-btn-disabled").attr('disabled',true);
                    $.ajax({
                        url: 'auto_withdrawal/do_get_ali_money',
                        type: 'post',
                        data:data.field,
                        success: function(data){


                            if(data.code==1){
                                layer.msg('发起提现成功!',{icon:1,time:6000},function () {
                                    location.reload();
                                });
                            }else{
                                layer.msg(data.msg,{icon:2,time:5000});
                            }
                        }

                    });
                    return false;

                })






            })
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});