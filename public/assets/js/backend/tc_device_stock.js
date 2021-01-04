define(['layui'], function (undefined) {
    var Controller = {
        index: function () {
            layui.use(['table','layer','laydate','form'], function () {
                var laydate = layui.laydate;
                var table = layui.table;
                var layer = layui.layer;
                var $=layui.$;
                var form = layui.form;
                var total_count; //定义数据总数

                //获取模板列表
                table.render({
                    id:'testReload'
                    ,elem: '#demo'
                    , url: tchost +'/tcstore/tcDeviceStock/getDeviceStockList' //数据接口
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
                          {field: 'deviceId', title: '设备编号',width:'200',align:'center'}
                        , {field:'name' ,title: '设备名称',width:'200',align:'center'}
                        , {field:'address' ,title: '设备地址',width:'350',align:'center'}
                        , {field:'fixStockNum' ,title: '异常库存',width:'150',align:'center'}
                        , {field:'residueNum' ,title: '剩余库存',width:'150',align:'center'}
                        , {field:'stockNum' ,title: '标准库存',width:'150',align:'center'}
                        , {field:'warningNum' ,title: '库存阈值',width:'150',templet:'#warningNum',edit:'text',align:'center'}
                        , {field:'stockStatus' ,title: '缺货状态',width:'150',templet:'#id_stockStatus',align:'center'}
                        , {field:'option' ,title: '操作',width:'150',templet:'#id_option',align:'center',fixed:'right'}
                    ]]
                });

                active = {
                    reload:function () {
                        var deviceId =$('#deviceId').val();
                        var nameLike =$('#nameLike').val();
                        var addressLike =$('#addressLike').val();

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
                                deviceId:deviceId,
                                nameLike:nameLike,
                                addressLike:addressLike,
                                createTimeSort: 1
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

                            var deviceId =$('#deviceId').val();
                            var nameLike =$('#nameLike').val();
                            var addressLike =$('#addressLike').val();

                            var now = new Date();
                            var date = now.toLocaleDateString();
                            var xhr = new XMLHttpRequest();

                            layer.confirm('选择导出数据',{icon:3,title:"导出确认",
                                btn:['导出本页','导出全部'],
                                btn1:function (index) {
                                    var loading = layer.msg('正在导出', {icon: 16, shade: 0.3, time:0});
                                    url = tchost+"/tcstore/tcDeviceStock/excelExportList?nameLike="+nameLike+
                                        '&deviceId='+deviceId+'&addressLike='+ addressLike +
                                        '&pageNo='+recodePage + '&pageSize='+recodeLimit;
                                    xhr.open("get", url, true);
                                    xhr.setRequestHeader("uid", Config.tcUid);
                                    xhr.setRequestHeader('Content-Type', 'application/json');
                                    xhr.responseType = "blob";
                                    xhr.onload = function () {
                                        if (this.status == 200) {
                                            blob = new Blob([this.response], {type: 'application/vnd.ms-excel;charset=utf-8'});
                                            fileName = '库存信息导出'+date+'.xls';
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
                                    url = tchost+"/tcstore/tcDeviceStock/excelExportList?nameLike="+nameLike+
                                        '&deviceId='+deviceId+'&addressLike='+ addressLike +
                                        '&pageNo=1&pageSize='+total_count;
                                    xhr.open("get", url, true);
                                    xhr.setRequestHeader("uid", Config.tcUid);
                                    xhr.setRequestHeader('Content-Type', 'application/json');
                                    xhr.responseType = "blob";
                                    xhr.onload = function () {
                                        if (this.status == 200) {
                                            blob = new Blob([this.response], {type: 'application/vnd.ms-excel;charset=utf-8'});
                                            fileName = '库存信息导出'+date+'.xls';
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
                    var rowData = res.data;
                    var id = res.data.id;
                    var deviceId = res.data.deviceId;
                    console.log(deviceId);
                    switch (res.event) {
                        case 'detail':
                            layer.open({
                                type:2
                                ,title: '库存详情'
                                ,area: ['80%','75%']
                                ,content: 'tc_device_stock/detail?deviceId='+deviceId
                                ,success: function () {
                                }
                            });
                            break;
                    }
                });

                //单元格编辑事件(库存阈值编辑)
                table.on('edit(myfilter_test)', function (obj) { //注：edit是固定事件名，test是table原始容器的属性 lay-filter="对应的值"
                    var replace_data = obj.data;

                    //验证只能输入数字
                    var selector = obj.tr.find('[data-field=' + obj.field + ']');
                    var reg = /^(\d{1,2})$/g;
                    var oldtext = $(selector).text();
                    if (obj.field == 'warningNum') {
                        if (!reg.test(obj.value)) {
                            layer.msg('只能输入2位数字!');
                            obj.tr.find('td[data-field=warningNum] input').val(oldtext);
                            obj.update({warningNum: oldtext});
                        }
                    }


                    $.ajax({
                        url: tchost+'/tcstore/tcDeviceStock/getDeviceStockDetailList',
                        type: 'post',
                        headers: {"uid": Config.tcUid},
                        data:{
                            deviceId: obj.data.deviceId,
                            warningNum: obj.data.warningNum,
                        },
                        success: function(data){
                            layer.msg('修改成功');
                        }
                    })

                });

            });

        },
        detail: function () {
            layui.use(['form','laydate','table'],function () {
                var form = layui.form;
                var laydate = layui.laydate;
                var table = layui.table;
                var $=layui.$;

                table.render({
                    id:'testReload'
                    ,elem: '#demo'
                    , url: tchost +'/tcstore/tcDeviceStock/getDeviceStockDetailList' //数据接口
                    , method: "get"
                    //,limits:[1,2,3,5,10,25,50]//每页条数的选择项
                    //,page:true
                    //,toolbar: '#toolbarDemo' //开启头部工具栏，并为其绑定左侧模板
                    ,headers: {'uid':Config.tcUid}
                    ,where:{'deviceId':deviceId}
                    ,request:{
                        pageName:'pageNo' //页码的参数名称，默认：page
                        ,limitName:'pageSize' //每页数据量的参数名，默认：limit
                    }
                    ,response:{
                        statusName:'code' //数据状态的字段名称
                        ,statusCode:200 //成功的状态码
                    }
                    ,parseData:function (res) {
                        return{
                            "code": res.code, //解析接口状态
                            "msg": res.message, //解析提示文本
                            "count": res.result.total, //解析数据长度
                            "data": res.result.records //解析数据列表
                        }

                    }
                    ,defaultToolbar: []
                    , cols: [[ //表头
                        {field: 'goodsName', title: '商品名称', width: '40%'}
                        ,{field: 'urlPhoto', title: '商品图片', width: '15%',templet:'#id_img'}
                        , {field: 'goodsId', title: '商品编码', width: '15%'}
                        , {field:'residueNum' ,title: '库存',width:'15%',sort: true}
                        , {field:'stockNum' ,title: '标准库存',width:'15%'}
                        //, {field:'option' ,title: '操作',width:'10%',templet:'#id_option'}
                    ]]
                    , done: function (res, curr, count) {
                        hoverOpenImg();//显示大图
                        $('table tr').on('click', function () {
                            $('table tr').css('background', '');
                            $(this).css('background', '<%=PropKit.use("config.properties").get("table_color")%>');
                        });
                    }
                });
                //显示大图片
                function hoverOpenImg() {
                    var img_show = null; // tips提示
                    $('td img').hover(function () {
                        var kd = $(this).width();
                        kd1 = kd * 5;          //图片放大倍数
                        kd2 = kd * 5 + 30;       //图片放大倍数
                        var img = "<img class='img_msg' src='" + $(this).attr('src') + "' style='width:" + kd1 + "px;' />";
                        img_show = layer.tips(img, this, {
                            tips: [2, 'rgba(41,41,41,.5)']
                            , area: [kd2 + 'px']
                        });
                    }, function () {
                        layer.close(img_show);
                    });
                    $('td img').attr('style', 'max-width:70px;display:block!important');
                }

                active = {
                    reload:function () {
                        var start_time =$('#start_time');

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
                                start_time:start_time.val(),
                                createTimeSort: 1
                            }
                        },'data');

                    }
                };

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
                            hours: 23,
                            minutes: 59,
                            seconds : 59
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

            })


        },
    };
    return Controller;
});
