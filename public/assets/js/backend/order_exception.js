define(['layui'], function (undefined) {
    var Controller = {
        index: function () {
            layui.use(['table','layer','laydate','form'], function () {
                var laydate = layui.laydate;
                var table = layui.table;
                var layer = layui.layer;
                var form = layui.form;
                var $=layui.$;
                var total_count; //定义数据总数

                var ExId;
                //获取异常配置信息
                $.ajax({
                    url: tchost+'/tcstore/tcOrderException/getAdminExceptionConfig',
                    type: 'get',
                    contentType: 'application/json',
                    headers:{"uid":Config.tcUid},
                    success: function(data){
                        ExId =data.result.id;
                        var waitTime = data.result.waitDealTime;
                        waitTime =waitTime/3600;
                        waitTime = Math.round(waitTime * 100) / 100;
                        waitTime.toFixed(waitTime);
                        console.log(waitTime);
                        form.val("exForm",{
                            'waitDealTime':waitTime,
                            'unknowPrice':data.result.unknowPrice,
                            'unlawPrice':data.result.unlawPrice,
                        });
                    }

                });

                //提交数据
                $("#sub").click(function () {
                    var id=ExId;
                    var waitDealTime = $('#waitDealTime').val();
                        Number.valueOf(waitDealTime);
                    if(waitDealTime<0.01){
                        layer.msg("最小值为0.01");
                        return;
                    }else if(waitDealTime>72){
                        layer.msg("最小值为72");
                        return;
                    }
                    var unknowPrice = $('#unknowPrice').val();
                    var unlawPrice = $('#unlawPrice').val();
                    waitDealTime = waitDealTime*3600;
                    waitDealTime = Math.round(waitDealTime * 100) / 100;

                    var target={
                        'id':id,
                        'waitDealTime':waitDealTime,
                        'unknowPrice':unknowPrice,
                        'unlawPrice':unlawPrice
                    };


                    $.ajax({
                        url: tchost+'/tcstore/tcOrderException/updateOrEditConfig',
                        type: 'post',
                        contentType: 'application/json',
                        headers:{"uid":Config.tcUid},
                        data:JSON.stringify(target),
                        success: function(data){
                            if(data.code==200){
                                layer.msg('配置成功!',{icon:1,time:2000},function () {
                                    Fast.api.close(data);//在这里关闭当前弹窗
                                    parent.location.reload();//这里刷新父页面，可以换其他代码
                                });
                            }else{
                                layer.msg(data.message,{icon:2,time:5000});
                            }
                        }

                    });
                    return false;
                });

                //获取模板列表
                table.render({
                    id:'testReload'
                    ,elem: '#demo'
                    , url: tchost +'/tcstore/tcOrderException/getList' //数据接口
                    , method: "get"
                    ,limits:[10,20,50,100,200,500,1000,5000]//每页条数的选择项
                    ,page:true
                    ,toolbar: '#toolbarDemo' //开启头部工具栏，并为其绑定左侧模板
                    ,headers: {'uid':Config.tcUid}
                    ,where:{'dealStatus':'210'}
                    ,request:{
                        pageName:'pageNo' //页码的参数名称，默认：page
                        ,limitName:'pageSize' //每页数据量的参数名，默认：limit
                    }
                    ,response:{
                        statusName:'code' //数据状态的字段名称
                        ,statusCode:200 //成功的状态码
                    }
                    ,parseData:function (res) {
                        total_count = res.result.total;
                        return{
                            "code": res.code, //解析接口状态
                            "msg": res.message, //解析提示文本
                            "count": res.result.total, //解析数据长度
                            "data": res.result.records //解析数据列表
                        }

                    }
                    ,even: true
                    ,defaultToolbar: []
                    , cols: [[ //表头
                          {field: 'orderId', title: '订单编号', width: '200',align:"center"}
                        , {field: 'deviceId', title: '设备编号', width: '100',align:"center"}
                        , {field:'deviceName' ,title: '设备名称',width:'150',align:"center"}
                        , {field:'excDetailList' ,title: '订单明细',width:'250',templet: '#excDetailList',align:"center"}
                        , {field:'createTime' ,title: '创建时间',width:'200',align:"center"}
                        , {field:'dealStatus' ,title: '订单状态',width:'150',templet: '#dealStatus',align:"center"}
                        , {field:'phone' ,title: '手机号码',width:'150',align:"center"}
                        , {field:'option' ,title: '操作',width:'100',templet:'#id_option',align:"center",fixed:'right'}
                    ]]
                });

                active = {
                    reload:function () {
                        var orderId =$('#orderId').val();
                        var deviceId =$('#deviceId').val();
                        var deviceNameLike =$('#deviceNameLike').val();
                        var phone =$('#phone').val();
                        var applyDeductTimeStart =$('#start_time').val();
                        var applyDeductTimeEnd =$('#end_time').val();

                        //执行重载
                        table.reload('testReload',{
                            method: "get"
                            ,page: {
                                curr: 1 //重新从第一页开始
                            }
                            ,request:{
                                pageName:'pageNo' //页码的参数名称，默认：page
                                ,limitName:'pageSize' //每页数据量的参数名，默认：limit
                            }
                            ,response:{
                                statusName:'code' //数据状态的字段名称
                                ,statusCode:200 //成功的状态码
                            }
                            ,where:{
                                orderId:orderId,
                                deviceId:deviceId,
                                deviceNameLike:deviceNameLike,
                                phone:phone,
                                applyDeductTimeStart:applyDeductTimeStart,
                                applyDeductTimeEnd:applyDeductTimeEnd,
                                userApplyTimeSort:0
                            }
                        },'data');

                    }
                };

                $('.demoTable .layui-btn').on('click', function(){
                    var type = $(this).data('type');
                    active[type] ? active[type].call(this) : '';
                });
                //头工具栏事件
                table.on('toolbar(myfilter_test)', function(obj){
                    switch(obj.event){
                        case 'out':
                            //获取当前页
                            var recodePage = $(".layui-laypage-skip .layui-input").val();
                            //获取当前页条数
                            var recodeLimit = $(".layui-laypage-limits").find("option:selected").val();

                            var orderId =$('#orderId').val();
                            var deviceId =$('#deviceId').val();
                            var deviceNameLike =$('#deviceNameLike').val();
                            var phone =$('#phone').val();
                            var applyDeductTimeStart =$('#start_time').val();
                            var applyDeductTimeEnd =$('#end_time').val();

                            var now = new Date();
                            var date = now.toLocaleDateString();
                            var xhr = new XMLHttpRequest();

                            layer.confirm('选择导出数据',{icon:3,title:"导出确认",
                                btn:['导出本页','导出全部'],
                                btn1:function (index) {
                                    var loading = layer.msg('正在导出', {icon: 16, shade: 0.3, time:0});
                                    url = tchost+"/tcstore/tcOrderException/excelExportList?orderId="+orderId+
                                        '&deviceId='+deviceId+'&deviceNameLike='+ deviceNameLike +'&phone='+phone+
                                        '&applyDeductTimeStart='+applyDeductTimeStart+ '&applyDeductTimeEnd='+applyDeductTimeEnd+
                                        '&dealStatus='+210+
                                        '&pageNo='+recodePage + '&pageSize='+recodeLimit;
                                    xhr.open("get", url, true);
                                    xhr.setRequestHeader("uid", Config.tcUid);
                                    xhr.setRequestHeader('Content-Type', 'application/json');
                                    xhr.responseType = "blob";
                                    xhr.onload = function () {
                                        if (this.status == 200) {
                                            blob = new Blob([this.response], {type: 'application/vnd.ms-excel;charset=utf-8'});
                                            fileName = '异常订单导出'+date+'.xls';
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
                                btn2:function (index) {
                                    var loading = layer.msg('正在导出', {icon: 16, shade: 0.3, time:0});
                                    url = tchost+"/tcstore/tcOrderException/excelExportList?orderId="+orderId+
                                        '&deviceId='+deviceId+'&deviceNameLike='+ deviceNameLike +'&phone='+phone+
                                        '&applyDeductTimeStart='+applyDeductTimeStart+ '&applyDeductTimeEnd='+applyDeductTimeEnd+
                                        '&dealStatus='+210+
                                        '&pageNo=1&pageSize='+total_count;
                                    xhr.open("get", url, true);
                                    xhr.setRequestHeader("uid", Config.tcUid);
                                    xhr.setRequestHeader('Content-Type', 'application/json');
                                    xhr.responseType = "blob";
                                    xhr.onload = function () {
                                        if (this.status == 200) {
                                            blob = new Blob([this.response], {type: 'application/vnd.ms-excel;charset=utf-8'});
                                            fileName = '异常订单导出'+date+'.xls';
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

                table.on('tool(myfilter_test)', function(res){
                    var id = res.data.id;
                    switch (res.event) {
                        case 'set':
                            layer.open({
                                type:2
                                ,title: '配置页面'
                                ,area: ['80%','75%']
                                ,content: 'order_exception/set?id='+id
                                ,success: function (data) {
                                }
                            });
                            break;
                    }
                });

                //时间控件
                var endDate= laydate.render({
                    elem: '#end_time',//选择器结束时间
                    type: 'datetime',
                    trigger: 'click',
                    min:"1970-1-1",//设置min默认最小值
                    done: function(value,date){
                        startDate.config.max={
                            year:date.year,
                            month:date.month-1,//关键
                            date: date.date,
                            hours: 0,
                            minutes: 0,
                            seconds : 0
                        }
                    }
                });
                var startDate=laydate.render({
                    elem: '#start_time', //选择器开始时间
                    type: 'datetime',
                    trigger: 'click',
                    max:"2099-12-31",//设置一个默认最大值
                    done: function(value, date){
                        endDate.config.min ={
                            year:date.year,
                            month:date.month-1, //关键
                            date: date.date,
                            hours: 0,
                            minutes: 0,
                            seconds : 0
                        };
                    }
                });



            });

        },
        set: function () {
            layui.use(['form','laytpl'],function () {
                var form = layui.form;
                var layer = layui.layer;
                var $=layui.$;
                var laytpl = layui.laytpl;
                var orderId =''; //定义视频外部变量
                var ExId;

                //获取单个详情
                $.ajax({
                    url: tchost+'/tcstore/tcOrderException/getOne',
                    type: 'get',
                    contentType: 'application/json',
                    headers: {'uid':Config.tcUid},
                    data: {'id':id},
                    async:false,
                    success: function(data){
                        var goodsList =[];
                        orderId = data.result.orderPrimaryId;
                        $.each(data.result.excDetailList,function (key,val) {
                            goodsList.push(val['goodsName']+'*'+val['buyCount']+'=' +val['buyPayPrice']+'元');
                            html = "<div class=\"layui-form-item\">\n" +
                                "            <div class=\"layui-inline\">\n" +
                                "                <label class=\"layui-form-label\">\n" +
                                "                 "+val['goodsName']+'*'+val['buyCount']+'=' +val['buyPayPrice']+'元'+" 修改后价格：\n" +
                                "                </label>\n" +
                                "                <div class=\"layui-input-inline\">\n" +
                                "                    <input type=\"text\" name=\"priceRefund\" id=\"priceRefund"+val['id']+"\"  value=\""+val['buyPayPrice']+"\" placeholder=\"请输入实际退款金额\" class=\"layui-input\">\n" +
                                "                    <input type=\"hidden\" name=\"buyCount\" id=\"buyCount"+val['id']+"\" value=\""+val['buyCount']+"\" placeholder=\"请输入实际数量\" class=\"layui-input\">\n" +
                                "                    <input type=\"hidden\" name=\"id\" id=\"id"+val['id']+"\" class=\"layui-input\" value=\""+val['id']+"\" >\n" +
                                "                    <input type=\"hidden\" name=\"goodsId\" id=\"goodsId"+val['id']+"\" value=\""+val['goodsId']+"\" class=\"layui-input\" >\n" +
                                "                    <input type=\"hidden\" name=\"orderId\" id=\"orderId\" class=\"layui-input\" value=\""+val['orderId']+"\" >\n" +
                                "                </div>\n" +
                                "            </div>\n" +
                                "        </div>";

                            $("#appendInput").append(html);


                        });
                        $.each(goodsList,function (key,val) {
                        });
                        $("#orderId").html( '订单编号：'+data.result.orderId);
                        $("#phone").html( '手机号码：'+data.result.phone);
                        $("#creatTime").html('创建时间：'+data.result.createTime);
                        $("#deviceId").html('设备编号：'+data.result.deviceId);
                        $("#goodsList").html('异常商品：'+goodsList);


                    },

                });

                //获取视频详情
                $.ajax({
                    url: tchost+'/tcstore/tcOrderInfo/getOne',
                    type: 'get',
                    contentType: 'application/json',
                    headers: {'uid':Config.tcUid},
                    data: {"id":orderId},
                    async:false,
                    success: function(data){
                        if (data.code ==200){
                            var videoUrl = data.result.selfVideo1;

                            var getTpl = id_video.innerHTML;
                            var view = document.getElementById('video');
                            laytpl(getTpl).render(videoUrl, function(html){
                                view.innerHTML = html;
                            });
                        }
                    },

                });

                //发起扣款按钮
                $('#koukuan').click(function () {
                    $('#koukuan').addClass("layui-btn-disabled").attr('disabled',true);
                    var orderId=$('input[name="orderId"]').val();
                    var orderFixList =[];
                    $('input[name="priceRefund"]').each(function (i) {
                        var buyCount =$('input[name="buyCount"]').eq(i);
                        var goodsId =$('input[name="goodsId"]').eq(i);
                        var id =$('input[name="id"]').eq(i);
                        orderFixList.push({"fixPayPrice":$(this).val(),"fixCount":buyCount.val(),"goodsId":goodsId.val(),"id":id.val()});
                    });
                    $.ajax({
                        url: tchost+'/tcstore/tcOrderException/auditExceptionOrder',
                        type: "POST",
                        contentType:"application/json",
                        dataType:"json",
                        headers: {"uid":Config.tcUid},
                        data:JSON.stringify({"auditRemark":"","id":id,"orderFixList":orderFixList,"orderId":orderId}),
                        success:function (data) {
                            if(data.code==200){
                                layer.msg('发起扣款成功!',{icon:1,time:2000},function () {
                                    Fast.api.close();//在这里关闭当前弹窗
                                    parent.location.reload();//这里刷新父页面，可以换其他代码
                                });
                            }else{
                                layer.msg(data.message,{icon:2,time:5000});
                                $("#koukuan").removeClass("layui-btn-disabled").attr("disabled",false);  //启用按钮
                            }
                        }

                    })

                });


            })


        },
    };
    return Controller;
});
