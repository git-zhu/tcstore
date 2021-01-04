define(['layui'], function (undefined) {
    var Controller = {
        index: function () {
            layui.use(['table', 'layer', 'laydate', 'form'], function () {
                var laydate = layui.laydate;
                var table = layui.table;
                var layer = layui.layer;
                var $ = layui.$;
                var form = layui.form;
                var total_count; //定义数据总数

                //获取模板列表
                table.render({
                    id: 'testReload'
                    , elem: '#demo'
                    , url: tchost + '/tcstore/tcOrderInfo/getList' //数据接口
                    , method: "get"
                    , limits: [10, 20, 50, 100, 200, 500, 1000, 5000]//每页条数的选择项
                    , page: true
                    , toolbar: '#toolbarDemo' //开启头部工具栏，并为其绑定左侧模板
                    , headers: {'uid': Config.tcUid}
                    , request: {
                        pageName: 'pageNo' //页码的参数名称，默认：page
                        , limitName: 'pageSize' //每页数据量的参数名，默认：limit
                    }
                    , response: {
                        statusName: 'code' //数据状态的字段名称
                        , statusCode: 200 //成功的状态码
                    }
                    , parseData: function (res) {
                        total_count = res.result.total;
                        return {
                            "code": res.code, //解析接口状态
                            "msg": res.message, //解析提示文本
                            "count": res.result.total, //解析数据长度
                            "data": res.result.records //解析数据列表
                        }

                    }
                    ,even:true
                    , defaultToolbar: []
                    , cols: [[ //表头
                          {field: 'orderId', title: '订单编号', width: '200',align:'center'}
                        , {field: 'deviceId', title: '设备编号', width: '100',align:'center'}
                        , {field: 'deviceName', title: '设备名称', width: '150',align:'center'}
                        , {field: 'orderDetailList', title: '订单明细', width: '300', templet: '#id_orderDetailList',align:'center'}
                        , {field: 'orderMoney', title: '实付金额', width: '100',align:'center'}
                        , {field: 'createTime', title: '创建时间', width: '200',align:'center'}
                        , {field: 'orderStatus', title: '订单状态', width: '150', templet: '#id_orderStatus',align:'center'}
                        , {field: 'refundStatus', title: '售后状态', width: '150', templet: '#id_refundStatus',align:'center'}
                        , {field: 'payWay', title: '支付方式', width: '100', templet: '#id_payWay',align:'center'}
                        , {field: 'payTime', title: '支付时间', width: '200',align:'center',templet:'#tpl_payTime'}
                        , {field: 'priceOriginal', title: '订单金额', width: '100',align:'center'}
                        , {field: 'priceCost', title: '成本', width: '100',align:'center'}
                        , {field: 'priceDiscount', title: '优惠', width: '100',align:'center'}
                        , {field: 'priceProfit', title: '利润', width: '100',align:'center'}
                        , {field: 'isDiscount', title: '参与活动', width: '100', templet: '#id_isDiscount',align:'center'}
                        , {field: 'phone', title: '手机号码', width: '150', templet: '#id_phone',align:'center'}
                        , {field: 'option', title: '操作', width: '100', templet: '#id_option',align:'center',fixed:'right'}
                    ]]
                });

                active = {
                    reload: function () {
                        var orderId = $('#orderId').val();
                        var deviceId = $('#deviceId').val();
                        var deviceNameLike = $('#deviceNameLike').val();
                        var payWay = $('#payWay').val();
                        var orderStatus = $('#orderStatus').val();
                        var createTimeStart = $('#start_time').val();
                        var createTimeEnd = $('#end_time').val();
                        var phone = $('#phone').val();
                        var refundStatus = $('#refundStatus').val();
                        var isDiscount = $('#isDiscount').val();

                        //执行重载
                        table.reload('testReload', {
                            method: "get"
                            , page: {
                                curr: 1 //重新从第一页开始
                            }
                            , request: {
                                pageName: 'pageNo' //页码的参数名称，默认：page
                                , limitName: 'pageSize' //每页数据量的参数名，默认：limit
                            }
                            , response: {
                                statusName: 'code' //数据状态的字段名称
                                , statusCode: 200 //成功的状态码
                            }
                            , where: {
                                orderId: orderId,
                                deviceId: deviceId,
                                deviceNameLike: deviceNameLike,
                                payWay: payWay,
                                orderStatus: orderStatus,
                                phone: phone,
                                refundStatus: refundStatus,
                                isDiscount:isDiscount,
                                createTimeStart: createTimeStart,
                                createTimeEnd: createTimeEnd,
                                createTimeSort: 1
                            }
                        }, 'data');

                    }
                };

                $('.demoTable .layui-btn').on('click', function () {
                    var type = $(this).data('type');
                    active[type] ? active[type].call(this) : '';
                });
                //头工具栏事件
                table.on('toolbar(myfilter_test)', function (obj) {
                    switch (obj.event) {
                        case 'create':
                            var index = layer.open({
                                type: 2
                                , area: ['50%', '80%']
                                , title: '活动新增'
                                , content: "activity/add"
                                , end: function () {
                                    table.reload('demo');
                                }
                            });
                            break;
                        case 'out':
                            //获取当前页
                            var recodePage = $(".layui-laypage-skip .layui-input").val();
                            //获取当前页条数
                            var recodeLimit = $(".layui-laypage-limits").find("option:selected").val();

                            var orderId = $('#orderId').val();
                            var deviceId = $('#deviceId').val();
                            var deviceNameLike = $('#deviceNameLike').val();
                            var payWay = $('#payWay').val();
                            var orderStatus = $('#orderStatus').val();
                            var createTimeStart = $('#start_time').val();
                            var createTimeEnd = $('#end_time').val();
                            var phone = $('#phone').val();
                            var refundStatus = $('#refundStatus').val();
                            var isDiscount = $('#isDiscount').val();

                            var now = new Date();
                            var date = now.toLocaleDateString();
                            var xhr = new XMLHttpRequest();

                            layer.confirm('选择导出数据', {
                                icon: 3, title: "导出确认",
                                btn: ['导出本页', '导出全部'],
                                btn1: function (index) {
                                    var loading = layer.msg('正在导出', {icon: 16, shade: 0.3, time: 0});
                                    url = tchost + "/tcstore/tcOrderInfo/excelExportList?orderId=" + orderId +
                                        '&deviceId=' + deviceId + '&deviceNameLike=' + deviceNameLike + '&payWay=' + payWay + '&orderStatus=' + orderStatus +
                                        '&createTimeStart=' + createTimeStart + '&createTimeEnd=' + createTimeEnd + '&phone=' + phone + '&refundStatus=' + refundStatus +
                                        '&isDiscount='+isDiscount+
                                        '&pageNo=' + recodePage + '&pageSize=' + recodeLimit;
                                    xhr.open("get", url, true);
                                    xhr.setRequestHeader("uid", Config.tcUid);
                                    xhr.setRequestHeader('Content-Type', 'application/json');
                                    xhr.responseType = "blob";
                                    xhr.onload = function () {
                                        if (this.status == 200) {
                                            blob = new Blob([this.response], {type: 'application/vnd.ms-excel;charset=utf-8'});
                                            fileName = '订单信息导出' + date + '.xls';
                                            alink = document.createElement('a');
                                            alink.download = fileName;
                                            alink.style.display = 'none';
                                            alink.href = URL.createObjectURL(blob);   // 这里是将文件流转化为一个文件地址
                                            document.body.appendChild(alink);
                                            alink.click();
                                            URL.revokeObjectURL(alink.href); // 释放URL 对象
                                            document.body.removeChild(alink);
                                            layer.close(loading);
                                        }
                                    };
                                    xhr.send();
                                },
                                btn2: function (index) {
                                    var loading = layer.msg('正在导出', {icon: 16, shade: 0.3, time: 0});
                                    url = tchost + "/tcstore/tcOrderInfo/excelExportList?orderId=" + orderId +
                                        '&deviceId=' + deviceId + '&deviceNameLike=' + deviceNameLike + '&payWay=' + payWay + '&orderStatus=' + orderStatus +
                                        '&createTimeStart=' + createTimeStart + '&createTimeEnd=' + createTimeEnd + '&phone=' + phone + '&refundStatus=' + refundStatus +
                                        '&isDiscount='+isDiscount+
                                        '&pageNo=1&pageSize=' + total_count;
                                    xhr.open("get", url, true);
                                    xhr.setRequestHeader("uid", Config.tcUid);
                                    xhr.setRequestHeader('Content-Type', 'application/json');
                                    xhr.responseType = "blob";
                                    xhr.onload = function () {
                                        if (this.status == 200) {
                                            blob = new Blob([this.response], {type: 'application/vnd.ms-excel;charset=utf-8'});
                                            fileName = '订单信息导出' + date + '.xls';
                                            alink = document.createElement('a');
                                            alink.download = fileName;
                                            alink.style.display = 'none';
                                            alink.href = URL.createObjectURL(blob);   // 这里是将文件流转化为一个文件地址
                                            document.body.appendChild(alink);
                                            alink.click();
                                            URL.revokeObjectURL(alink.href); // 释放URL 对象
                                            document.body.removeChild(alink);
                                            layer.close(loading);
                                        }
                                    };
                                    xhr.send();
                                }
                            });

                            break;
                    }
                });

                //重置事件
                $("#reset").click(function () {
                    $(":input").val("");
                    $("#type").val("");
                    form.render();
                });

                //表格行按钮监听事件
                table.on('tool(myfilter_test)', function (res) {
                    var rowData = res.data;
                    var id = res.data.id;
                    switch (res.event) {
                        case 'detail':
                            layer.open({
                                type: 2
                                , title: '订单详情'
                                , area: ['80%', '75%']
                                , content: 'tc_order_info/detail?id=' + id
                                , success: function () {
                                }
                            });
                            break;
                    }
                });

                //时间控件
                var endDate = laydate.render({
                    elem: '#end_time',//选择器结束时间
                    type: 'datetime',
                    trigger: 'click',
                    min: "1970-1-1",//设置min默认最小值
                    done: function (value, date) {
                        startDate.config.max = {
                            year: date.year,
                            month: date.month - 1,//关键
                            date: date.date,
                            hours: 23,
                            minutes: 59,
                            seconds: 59
                        }
                    }
                });
                var startDate = laydate.render({
                    elem: '#start_time', //选择器开始时间
                    type: 'datetime',
                    trigger: 'click',
                    max: "2099-12-31",//设置一个默认最大值
                    done: function (value, date) {
                        endDate.config.min = {
                            year: date.year,
                            month: date.month - 1, //关键
                            date: date.date,
                            hours: 0,
                            minutes: 0,
                            seconds: 0
                        };
                    }
                });
            });

        },
        detail: function () {
            layui.use(['form', 'laytpl'], function () {
                var form = layui.form;
                var $ = layui.$;
                var laytpl = layui.laytpl;

                $.ajax({
                    url: tchost + '/tcstore/tcOrderInfo/getOne',
                    type: 'get',
                    contentType: 'application/json',
                    headers: {'uid': Config.tcUid},
                    data: {"id": id},
                    async: false,
                    success: function (data) {
                        if (data.code == 200) {
                            var result = data.result;
                            var orderDetailList = data.result.orderDetailList;
                            console.log('---打印返回的result---')
                            console.log(result)
                            var getTpl1 = id_video.innerHTML;
                            var getTpl2 = id_static_form.innerHTML;
                            var getTpl3 = id_text.innerHTML;
                            var view1 = document.getElementById('video');
                            var view2 = document.getElementById('static_form');
                            var view3 = document.getElementById('text');
                            laytpl(getTpl1).render(result, function (html) {
                                view1.innerHTML = html;
                            });
                            laytpl(getTpl2).render(orderDetailList, function (html) {
                                view2.innerHTML = html;
                            });
                            laytpl(getTpl3).render(result, function (html) {
                                view3.innerHTML = html;
                            });
                        }
                    },

                });


            })


        },
    };
    return Controller;
});
