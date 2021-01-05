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
                    , url: tchost + '/tcstore/tcStatistics/selectActivitySaleData' //数据接口
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
                        {field: 'activityName', title: '活动名', width: '250',align:'center'}
                        , {field: 'activityType', title: '活动类型', width: '200',align:'center'}
                        , {field: 'activityStatus', title: '活动状态', width: '200',align:'center'}
                        , {field: 'orderCount', title: '活动订单', width: '200',sort: true,align:'center'}
                        , {field: 'sumDiscount', title: '优惠金额', width: '200',sort: true,align:'center'}
                        , {field: 'sumSalePrice', title: '销售金额', width: '200',sort: true,align:'center'}
                    ]]
                });

                active = {
                    reload: function () {
                        var activityName = $('#activityName').val();
                        var activityType = $('#activityType').val();
                        var activityStatus = $('#activityStatus').val();
                        var timeStart = $('#start_time').val();
                        var timeEnd = $('#end_time').val();
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
                                activityName: activityName,
                                activityType: activityType,
                                activityStatus: activityStatus,
                                timeStart: timeStart,
                                timeEnd: timeEnd,
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
                        case 'out':
                            //获取当前页
                            var recodePage = $(".layui-laypage-skip .layui-input").val();
                            //获取当前页条数
                            var recodeLimit = $(".layui-laypage-limits").find("option:selected").val();

                            var activityName = $('#activityName').val();
                            var activityType = $('#activityType').val();
                            var activityStatus = $('#activityStatus').val();
                            var timeStart = $('#start_time').val();
                            var timeEnd = $('#end_time').val();

                            var now = new Date();
                            var date = now.toLocaleDateString();
                            var xhr = new XMLHttpRequest();

                            layer.confirm('选择导出数据', {
                                icon: 3, title: "导出确认",
                                btn: ['导出本页', '导出全部'],
                                btn1: function (index) {
                                    var loading = layer.msg('正在导出', {icon: 16, shade: 0.3, time: 0});
                                    url = tchost + "/tcstore/tcStatistics/activitySaleDataExcelExportList?activityName=" + activityName +
                                        '&activityType=' + activityType + '&activityStatus=' + activityStatus +
                                        '&timeStart=' + timeStart + '&timeEnd=' + timeEnd +
                                        '&pageNo=' + recodePage + '&pageSize=' + recodeLimit;
                                    xhr.open("get", url, true);
                                    xhr.setRequestHeader("uid", Config.tcUid);
                                    xhr.setRequestHeader('Content-Type', 'application/json');
                                    xhr.responseType = "blob";
                                    xhr.onload = function () {
                                        if (this.status == 200) {
                                            blob = new Blob([this.response], {type: 'application/vnd.ms-excel;charset=utf-8'});
                                            fileName = '营销数据导出' + date + '.xls';
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
                                    url = tchost + "/tcstore/tcStatistics/activitySaleDataExcelExportList?activityName=" + activityName +
                                        '&activityType=' + activityType + '&activityStatus=' + activityStatus +
                                        '&timeStart=' + timeStart + '&timeEnd=' + timeEnd +
                                        '&pageNo=1&pageSize=' + total_count;
                                    xhr.open("get", url, true);
                                    xhr.setRequestHeader("uid", Config.tcUid);
                                    xhr.setRequestHeader('Content-Type', 'application/json');
                                    xhr.responseType = "blob";
                                    xhr.onload = function () {
                                        if (this.status == 200) {
                                            blob = new Blob([this.response], {type: 'application/vnd.ms-excel;charset=utf-8'});
                                            fileName = '营销数据导出' + date + '.xls';
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
    };
    return Controller;
});
