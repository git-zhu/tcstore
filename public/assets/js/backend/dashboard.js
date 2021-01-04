define(['layui'], function (undefined) {
    var Controller = {
        index: function () {
            layui.use(['form','layer','element','laydate','laytpl'], function () {
                var layer = layui.layer;
                var $ = layui.$;
                var element = layui.element;
                var form = layui.form;
                var laydate = layui.laydate;
                var laytpl = layui.laytpl;

                //js格式化时间为yyy-mm-dd HH:MM:SS
                Date.prototype.format = function(fmt) {
                    var o = {
                        "M+" : this.getMonth()+1,                 //月份
                        "d+" : this.getDate(),                    //日
                        "h+" : this.getHours(),                   //小时
                        "m+" : this.getMinutes(),                 //分
                        "s+" : this.getSeconds(),                 //秒
                        "q+" : Math.floor((this.getMonth()+3)/3), //季度
                        "S"  : this.getMilliseconds()             //毫秒
                    };
                    if(/(y+)/.test(fmt)) {
                        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
                    }
                    for(var k in o) {
                        if(new RegExp("("+ k +")").test(fmt)){
                            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
                        }
                    }
                    return fmt;
                };

                var today = new Date(); //定义myDate
                var todayStart = today.format("yyyy-MM-dd 00:00:00");
                var todayEnd = today.format("yyyy-MM-dd 23:59:59"); //今日

                var yestoday =new Date();
                yestoday.setDate(yestoday.getDate() - 1);
                var yestodayStart = yestoday.format("yyyy-MM-dd 00:00:00");
                var yestodayEnd = yestoday.format("yyyy-MM-dd 23:59:59"); //昨日

                var week =new Date();
                week.setDate(week.getDate() - 7);
                var weekStart = week.format("yyyy-MM-dd 00:00:00");
                var weekEnd = today.format("yyyy-MM-dd 23:59:59");  //近7日

                var month =new Date();
                month.setDate(month.getDate() - 30);
                var monthStart = month.format("yyyy-MM-dd 00:00:00");
                var monthEnd = today.format("yyyy-MM-dd 23:59:59");  //近30日

                var customStart;
                var customEnd;
                //日期范围
                laydate.render({
                    elem: '#time'
                    ,range: '~'
                    ,trigger: 'click' //采用click弹出
                    ,done: function (value,endDate) {
                        var str = value;
                        var arry = str.split(' ~ ');
                         customStart = arry[0] + ' '+ '00:00:00';
                         customEnd = arry[1] + ' '+ '23:59:59';
                    }
                });

                //设备在线情况
                $.ajax({
                    url: tchost + '/tcstore/tcStatistics/selectDeviceOnlineData',
                    type: 'post',
                    contentType: 'application/json',
                    headers: {'uid': Config.tcUid},
                    async: false,
                    success: function (data) {
                        if (data.code == 200) {
                            var getTpl = tpl_inline.innerHTML;
                            var view = document.getElementById('appendInline');
                            laytpl(getTpl).render(data.result, function (html) {
                                view.innerHTML = html;
                            });

                        }
                    },

                });
                //总的销售额，订单数，客单价
                $.ajax({
                    url: tchost + '/tcstore/tcStatistics/selectAllHistorySalesData',
                    type: 'post',
                    contentType: 'application/json',
                    headers: {'uid': Config.tcUid},
                    async: false,
                    success: function (data) {
                        if (data.code == 200) {
                            var getTpl = tpl_sales.innerHTML;
                            var view = document.getElementById('appendSales');
                            laytpl(getTpl).render(data.result, function (html) {
                                view.innerHTML = html;
                            });

                        }
                    },

                });
                //今日销量
                $.ajax({
                    url: tchost + '/tcstore/tcStatistics/selectSalesData',
                    type: 'post',
                    dataType:'json',
                    contentType:'application/x-www-form-urlencoded',
                    headers: {'uid': Config.tcUid},
                    data:{startDateTime:todayStart,endDateTime:todayEnd},
                    async: false,
                    success: function (data) {
                        if (data.code == 200) {
                            var getTpl1 = tpl_todaySales.innerHTML;
                            var getTpl2 = tpl_todayOrderCount.innerHTML;
                            var getTpl3 = tpl_todayAveragePrice.innerHTML;
                            var view1 = document.getElementById('appendTodaySales');
                            var view2 = document.getElementById('appendTodayOrderCount');
                            var view3 = document.getElementById('appendTodayAveragePrice');

                            laytpl(getTpl1).render(data.result, function (html) {
                                view1.innerHTML = html;
                            });
                            laytpl(getTpl2).render(data.result, function (html) {
                                view2.innerHTML = html;
                            });
                            laytpl(getTpl3).render(data.result, function (html) {
                                view3.innerHTML = html;
                            });
                        }
                    },
                });

                //销量查询
                //默认显示昨日
                $.ajax({
                    url: tchost + '/tcstore/tcStatistics/selectSalesData',
                    type: 'post',
                    dataType:'json',
                    contentType:'application/x-www-form-urlencoded',
                    headers: {'uid': Config.tcUid},
                    data:{startDateTime:yestodayStart,endDateTime:yestodayEnd},
                    async: false,
                    success: function (data) {
                        if (data.code == 200) {

                            var getTpl1 = tpl_historySales.innerHTML;
                            var getTpl2 = tpl_historyOrderCount.innerHTML;
                            var getTpl3 = tpl_historyAveragePrice.innerHTML;
                            var view1 = document.getElementById('appendHistorySales');
                            var view2 = document.getElementById('appendHistoryOrderCount');
                            var view3 = document.getElementById('appendHistoryAveragePrice');

                            laytpl(getTpl1).render(data.result, function (html) {
                                view1.innerHTML = html;
                            });
                            laytpl(getTpl2).render(data.result, function (html) {
                                view2.innerHTML = html;
                            });
                            laytpl(getTpl3).render(data.result, function (html) {
                                view3.innerHTML = html;
                            });


                        }
                    },

                });

                //昨日
                $('#yestoday').click(function () {
                    $.ajax({
                        url: tchost + '/tcstore/tcStatistics/selectSalesData',
                        type: 'post',
                        dataType:'json',
                        contentType:'application/x-www-form-urlencoded',
                        headers: {'uid': Config.tcUid},
                        data:{startDateTime:yestodayStart,endDateTime:yestodayEnd},
                        async: false,
                        success: function (data) {
                            if (data.code == 200) {

                                var getTpl1 = tpl_historySales.innerHTML;
                                var getTpl2 = tpl_historyOrderCount.innerHTML;
                                var getTpl3 = tpl_historyAveragePrice.innerHTML;
                                var view1 = document.getElementById('appendHistorySales');
                                var view2 = document.getElementById('appendHistoryOrderCount');
                                var view3 = document.getElementById('appendHistoryAveragePrice');

                                laytpl(getTpl1).render(data.result, function (html) {
                                    view1.innerHTML = html;
                                });
                                laytpl(getTpl2).render(data.result, function (html) {
                                    view2.innerHTML = html;
                                });
                                laytpl(getTpl3).render(data.result, function (html) {
                                    view3.innerHTML = html;
                                });


                            }
                        },

                    });
                });

                //近7日
                $('#week').click(function () {
                    $.ajax({
                        url: tchost + '/tcstore/tcStatistics/selectSalesData',
                        type: 'post',
                        dataType:'json',
                        contentType:'application/x-www-form-urlencoded',
                        headers: {'uid': Config.tcUid},
                        data:{startDateTime:weekStart,endDateTime:weekEnd},
                        async: false,
                        success: function (data) {
                            if (data.code == 200) {

                                var getTpl1 = tpl_historySales.innerHTML;
                                var getTpl2 = tpl_historyOrderCount.innerHTML;
                                var getTpl3 = tpl_historyAveragePrice.innerHTML;
                                var view1 = document.getElementById('appendHistorySales');
                                var view2 = document.getElementById('appendHistoryOrderCount');
                                var view3 = document.getElementById('appendHistoryAveragePrice');

                                laytpl(getTpl1).render(data.result, function (html) {
                                    view1.innerHTML = html;
                                });
                                laytpl(getTpl2).render(data.result, function (html) {
                                    view2.innerHTML = html;
                                });
                                laytpl(getTpl3).render(data.result, function (html) {
                                    view3.innerHTML = html;
                                });


                            }
                        },

                    });
                });

                //近30日
                $('#month').click(function () {
                    $.ajax({
                        url: tchost + '/tcstore/tcStatistics/selectSalesData',
                        type: 'post',
                        dataType:'json',
                        contentType:'application/x-www-form-urlencoded',
                        headers: {'uid': Config.tcUid},
                        data:{startDateTime:monthStart,endDateTime:monthEnd},
                        async: false,
                        success: function (data) {
                            if (data.code == 200) {

                                var getTpl1 = tpl_historySales.innerHTML;
                                var getTpl2 = tpl_historyOrderCount.innerHTML;
                                var getTpl3 = tpl_historyAveragePrice.innerHTML;
                                var view1 = document.getElementById('appendHistorySales');
                                var view2 = document.getElementById('appendHistoryOrderCount');
                                var view3 = document.getElementById('appendHistoryAveragePrice');

                                laytpl(getTpl1).render(data.result, function (html) {
                                    view1.innerHTML = html;
                                });
                                laytpl(getTpl2).render(data.result, function (html) {
                                    view2.innerHTML = html;
                                });
                                laytpl(getTpl3).render(data.result, function (html) {
                                    view3.innerHTML = html;
                                });


                            }
                        },

                    });
                });

                //自定义
                $('#custom').click(function () {
                    $.ajax({
                        url: tchost + '/tcstore/tcStatistics/selectSalesData',
                        type: 'post',
                        dataType:'json',
                        contentType:'application/x-www-form-urlencoded',
                        headers: {'uid': Config.tcUid},
                        data:{startDateTime:customStart,endDateTime:customEnd},
                        async: false,
                        success: function (data) {
                            if (data.code == 200) {
                                var getTpl1 = tpl_historySales.innerHTML;
                                var getTpl2 = tpl_historyOrderCount.innerHTML;
                                var getTpl3 = tpl_historyAveragePrice.innerHTML;
                                var view1 = document.getElementById('appendHistorySales');
                                var view2 = document.getElementById('appendHistoryOrderCount');
                                var view3 = document.getElementById('appendHistoryAveragePrice');

                                laytpl(getTpl1).render(data.result, function (html) {
                                    view1.innerHTML = html;
                                });
                                laytpl(getTpl2).render(data.result, function (html) {
                                    view2.innerHTML = html;
                                });
                                laytpl(getTpl3).render(data.result, function (html) {
                                    view3.innerHTML = html;
                                });


                            }
                        },

                    });
                });

            });
        },
    };
    return Controller;
});
