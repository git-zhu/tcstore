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

                //获取模板列表
                table.render({
                    id:'testReload'
                    ,elem: '#demo'
                    , url: tchost +'/tcstore/tcOrderRefund/getList' //数据接口
                    , method: "get"
                    ,limits:[10,20,50,100,200,500,1000,5000]//每页条数的选择项
                    ,page:true
                    ,toolbar: '#toolbarDemo' //开启头部工具栏，并为其绑定左侧模板
                    ,headers: {'uid':Config.tcUid}
                    ,request:{
                        pageName:'pageNo' //页码的参数名称，默认：page
                        ,limitName:'pageSize' //每页数据量的参数名，默认：limit
                    }
                    ,response:{
                        statusName:'code' //数据状态的字段名称
                        ,statusCode:200 //成功的状态码
                    }
                    ,parseData:function (res) {
                        total_count =res.result.total;
                        return{
                            "code": res.code, //解析接口状态
                            "msg": res.message, //解析提示文本
                            "count": res.result.total, //解析数据长度
                            "data": res.result.records //解析数据列表
                        }

                    }
                    ,even:true
                    ,defaultToolbar: []
                    , cols: [[ //表头
                          {field: 'id', title: '售后编号', width: '200',align:'center'}
                        , {field: 'orderId', title: '订单编号', width: '200',align:'center'}
                        , {field:'deviceId' ,title: '设备编号',width:'100',align:'center'}
                        , {field:'refundRemark' ,title: '申退原因',width:'250',align:'center'}
                        , {field:'goodsList' ,title: '申退商品',width:'250',templet: '#id_goodsList' ,align:'center'}
                        , {field:'priceApply' ,title: '申退金额',width:'100',align:'center'}
                        , {field:'phone' ,title: '手机号码',width:'150',templet: '#id_deviceList',align:'center'}
                        , {field:'userApplyTime' ,title: '申退时间',width:'200',align:'center'}
                        , {field:'dealStatus' ,title: '售后状态',width:'100',templet: '#id_dealStatus',align:'center'}
                        , {field:'priceRefund' ,title: '实际退款金额',width:'150',align:'center'}
                        , {field:'auditRemark' ,title: '审核备注',width:'150',align:'center'}
                        , {field:'option' ,title: '操作',width:'100',templet:'#id_option',align:'center',fixed:'right'}
                    ]]
                });

                active = {
                    reload:function () {
                        var id =$('#id').val();
                        var deviceId =$('#deviceId').val();
                        var orderId =$('#orderId').val();
                        var userApplyTimeStart =$('#start_time').val();
                        var dealStatus =$('#dealStatus').val();

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
                                id:id,
                                deviceId:deviceId,
                                orderId:orderId,
                                userApplyTimeStart:userApplyTimeStart,
                                dealStatus:dealStatus,
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
                    var myDate = new Date();
                    var nowTime= myDate.toLocaleDateString(); //获取当前日期
                    switch(obj.event){
                        case 'out':
                            //获取当前页
                            var recodePage = $(".layui-laypage-skip .layui-input").val();
                            //获取当前页条数
                            var recodeLimit = $(".layui-laypage-limits").find("option:selected").val();

                            var id =$('#id').val();
                            var deviceId =$('#deviceId').val();
                            var orderId =$('#orderId').val();
                            var userApplyTimeStart =$('#start_time').val();
                            var dealStatus =$('#dealStatus').val();

                            var now = new Date();
                            var date = now.toLocaleDateString();
                            var xhr = new XMLHttpRequest();

                            layer.confirm('选择导出数据',{icon:3,title:"导出确认",
                                btn:['导出本页','导出全部'],
                                btn1:function (index) {
                                    var loading = layer.msg('正在导出', {icon: 16, shade: 0.3, time:0});
                                    url = tchost+"/tcstore/tcOrderRefund/excelExportList?id="+id+'&deviceId='+deviceId+
                                        '&userApplyTimeStart='+userApplyTimeStart+'&dealStatus='+dealStatus+
                                        '&orderId='+orderId+
                                        '&pageNo='+recodePage + '&pageSize='+recodeLimit;
                                    xhr.open("get", url, true);
                                    xhr.setRequestHeader("uid", Config.tcUid);
                                    xhr.setRequestHeader('Content-Type', 'application/json');
                                    xhr.responseType = "blob";
                                    xhr.onload = function () {
                                        if (this.status == 200) {
                                            blob = new Blob([this.response], {type: 'application/vnd.ms-excel;charset=utf-8'});
                                            fileName = '退款订单导出'+date+'.xls';
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
                                    url = tchost+"/tcstore/tcOrderRefund/excelExportList?id="+id+'&deviceId='+deviceId+
                                        '&userApplyTimeStart='+userApplyTimeStart+'&dealStatus='+dealStatus+
                                        '&orderId='+orderId+
                                        '&pageNo=1&pageSize='+total_count;
                                    xhr.open("get", url, true);
                                    xhr.setRequestHeader("uid", Config.tcUid);
                                    xhr.setRequestHeader('Content-Type', 'application/json');
                                    xhr.responseType = "blob";
                                    xhr.onload = function () {
                                        if (this.status == 200) {
                                            blob = new Blob([this.response], {type: 'application/vnd.ms-excel;charset=utf-8'});
                                            fileName = '退款订单导出'+date+'.xls';
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
                        case 'audit':
                            var index = layer.open({
                                type:2
                                ,title: '审核页面'
                                ,area: ['80%','80%']
                                ,content: 'order_refund/audit?id='+id
                                ,success: function () {
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
        audit:function () {
            layui.use(['form','layer'], function () {
                var layer = layui.layer;
                var form = layui.form;

                //可输入的下拉框
                form.on('select(auditRemark)', function (data) {   //选择移交单位 赋值给input框
                    var select_text = data.elem[data.elem.selectedIndex].text;
                    $("#auditRemarkInput").val(select_text );
                    $("#auditRemark").next().find("dl").css({ "display": "none" });
                    form.render();
                });
                $('#auditRemarkInput').bind('input propertychange', function () {
                    var value = $("#auditRemarkInput").val();
                    $("#auditRemark").val(value);
                    form.render();
                    $("#auditRemark").next().find("dl").css({"display": "block"});
                    var dl = $("#auditRemark").next().find("dl").children();
                    var j = -1;
                    for (var i = 0; i < dl.length; i++) {
                        if (dl[i].innerHTML.indexOf(value) <= -1) {
                            dl[i].style.display = "none";
                            j++;
                        }
                        if (j == dl.length - 1) {
                            $("#auditRemark").next().find("dl").css({"display": "none"});
                        }
                    }

                });

                //获取单个审核详情
                $.ajax({
                    url: tchost+'/tcstore/tcOrderRefund/getOne',
                    type: 'get',
                    contentType: 'application/json',
                    headers: {'uid':Config.tcUid},
                    data: {'id':id},
                    success: function(data){
                        var goodsList =[];
                        $.each(data.result.goodsList,function (key,val) {
                            goodsList.push(val['name']);
                        });
                        goodsList = goodsList.toString();
                        $("#id").html( '售后编号：'+data.result.id);
                        $("#userApplyTime").html( '申退时间：'+data.result.userApplyTime);
                        $("#orderId").html('订单编号：'+data.result.orderId);
                        $("#refundRemark").html('申退原因：'+data.result.refundRemark);
                        $("#phone").html('手机号码：'+data.result.phone);
                        $("#goodsList").html('申退商品：'+goodsList);
                        $("#deviceId").html('设备编号：'+data.result.deviceId);
                        $("#priceApply").html('申退金额：'+data.result.priceApply+'元');
                        $("#priceOrder").html('订单金额金额：'+data.result.priceOrder+'元');
                    },

                });

                //通过按钮
                $('#tongguo').click(function () {
                    //禁用按钮
                    $('#jujue').addClass("layui-btn-disabled").attr('disabled',true);
                    $('#tongguo').addClass("layui-btn-disabled").attr('disabled',true);
                    $.ajax({
                        url: tchost+'/tcstore/tcOrderRefund/applyRefund',
                        type: 'get',
                        contentType: 'application/json',
                        headers: {'uid':Config.tcUid},
                        data: {
                            'id':id,
                            'isPass':1,
                            'priceRefund':$('#priceRefund').val(),
                            'auditRemark':$('#auditRemarkInput').val(),
                        },
                        success:function (data) {
                            if(data.code==200){
                                layer.msg('通过成功!',{icon:1,time:3000},function () {
                                    Fast.api.close();//在这里关闭当前弹窗
                                    parent.location.reload();//这里刷新父页面，可以换其他代码
                                });

                            }else{
                                layer.msg(data.message,{icon:2,time:5000});
                                $("#jujue").removeClass("layui-btn-disabled").attr("disabled",false);  //启用按钮
                                $("#tongguo").removeClass("layui-btn-disabled").attr("disabled",false); //启用按钮
                            }
                        }

                    })
                });

                //拒绝按钮
                $('#jujue').click(function () {
                    //禁用按钮
                    $('#jujue').addClass("layui-btn-disabled").attr('disabled',true);
                    $('#tongguo').addClass("layui-btn-disabled").attr('disabled',true);
                    $.ajax({
                        url: tchost+'/tcstore/tcOrderRefund/applyRefund',
                        type: 'get',
                        contentType: 'application/json',
                        headers: {'uid':Config.tcUid},
                        data: {
                            'id':id,
                            'isPass':0,
                            'auditRemark':$('#auditRemarkInput').val(),
                        },
                        success:function (data) {
                            if(data.code==200){
                                layer.msg('拒绝成功!',{icon:1,time:3000},function () {
                                    Fast.api.close();//在这里关闭当前弹窗
                                    parent.location.reload();//这里刷新父页面，可以换其他代码
                                });
                            }else{
                                layer.msg(data.message,{icon:2,time:5000});
                                $("#jujue").removeClass("layui-btn-disabled").attr("disabled",false);  //启用按钮
                                $("#tongguo").removeClass("layui-btn-disabled").attr("disabled",false); //启用按钮
                            }
                        }

                    })
                })

            })
            },
    };
    return Controller;
});
