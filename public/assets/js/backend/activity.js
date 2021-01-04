define(['layui'], function (undefined) {
    var Controller = {
        index: function () {
            layui.use(['table','layer','laydate','form'], function () {
                var laydate = layui.laydate;
                 var table = layui.table;
                 var layer = layui.layer;
                 var $=layui.$;
                 var form = layui.form;
                var sid ;//设置全局变量
                var total_count; //定义数据总数

                //获取模板列表
                table.render({
                    id:'testReload'
                    ,elem: '#demo'
                    , url: tchost +'/tcstore/tcActivity/getActivityList' //数据接口
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
                        total_count = res.result.total;
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
                          {field: 'activityName', title: '活动名称', width: 200,align:'center'}
                        , {field: 'activityTypeName', title: '活动类型', width: '100',align:'center'}
                        , {field:'createTime' ,title: '创建时间',width:'200',align:'center'}
                        , {field:'startTime' ,title: '开始时间',width:'200',align:'center'}
                        , {field:'endTime' ,title: '结束时间',width:'200',align:'center'}
                        , {field:'statusName' ,title: '活动状态',width:'100',align:'center'}
                        , {field:'deviceList' ,title: '参与设备',width:'200',templet: '#id_deviceList',align:'center'}
                        , {field:'adminName' ,title: '创建人',width:'100',align:'center'}
                        , {field:'mark' ,title: '备注',width:'100',align:'center'}
                        , {field:'option' ,title: '操作',width:'150',templet:'#id_option',align:'center',fixed:'right'}
                    ]]
                });

                active = {
                    reload:function () {
                        var name =$('#name');
                        var type =$('#type');
                        var device =$('#device');
                        var start_time = $('#start_time');
                        var end_time = $('#end_time');

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
                                activityNameLike:name.val(),
                                    activityType:type.val(),
                                    deviceIdLike:device.val(),
                                    createTimeStart:start_time.val(),
                                    createTimeEnd:end_time.val(),
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
                        case 'create':
                            var index = layer.open({
                                type:2
                                ,area: ['50%','75%']
                                ,title:'活动新增'
                                ,content: "activity/add"

                            });
                            break;
                        case 'out':
                            //获取当前页
                            var recodePage = $(".layui-laypage-skip .layui-input").val();
                            //获取当前页条数
                            var recodeLimit = $(".layui-laypage-limits").find("option:selected").val();

                            var activityNameLike =$('#name').val();
                            var activityType =$('#type').val();
                            var deviceIdLike =$('#device').val();
                            var createTimeStart = $('#start_time').val();
                            var createTimeEnd = $('#end_time').val();

                            var now = new Date();
                            var date = now.toLocaleDateString();
                            var xhr = new XMLHttpRequest();

                            layer.confirm('选择导出数据',{icon:3,title:"导出确认",
                                btn:['导出本页','导出全部'],
                                btn1:function (index) {
                                    var loading = layer.msg('正在导出', {icon: 16, shade: 0.3, time:0});
                                    url = tchost+"/tcstore/tcActivity/excelExportList?activityNameLike="+activityNameLike+
                                        '&activityType='+activityType+'&deviceIdLike='+ deviceIdLike +'&createTimeStart='+createTimeStart+'&createTimeEnd='+createTimeEnd+
                                        '&pageNo='+recodePage + '&pageSize='+recodeLimit;
                                    xhr.open("get", url, true);
                                    xhr.setRequestHeader("uid", Config.tcUid);
                                    xhr.setRequestHeader('Content-Type', 'application/json');
                                    xhr.responseType = "blob";
                                    xhr.onload = function () {
                                        if (this.status == 200) {
                                            blob = new Blob([this.response], {type: 'application/vnd.ms-excel;charset=utf-8'});
                                            fileName = '活动导出'+date+'.xls';
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
                                    url = tchost+"/tcstore/tcActivity/excelExportList?activityNameLike="+activityNameLike+
                                        '&activityType='+activityType+'&deviceIdLike='+ deviceIdLike +'&createTimeStart='+createTimeStart+'&createTimeEnd='+createTimeEnd+
                                        '&pageNo=1&pageSize='+total_count;
                                    xhr.open("get", url, true);
                                    xhr.setRequestHeader("uid", Config.tcUid);
                                    xhr.setRequestHeader('Content-Type', 'application/json');
                                    xhr.responseType = "blob";
                                    xhr.onload = function () {
                                        if (this.status == 200) {
                                            blob = new Blob([this.response], {type: 'application/vnd.ms-excel;charset=utf-8'});
                                            fileName = '活动导出'+date+'.xls';
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
                })

                //表格行按钮监听事件
                table.on('tool(myfilter_test)', function(res){
                    var rowData = res.data;
                    var deviceList = res.data.deviceList;
                    var activityId = res.data.id;
                    switch (res.event) {
                        case 'detail':
                            layer.open({
                                type:2
                                ,title: '活动详情'
                                ,area: ['50%','75%']
                                ,content: 'activity/detail?activityId='+activityId
                                ,success: function () {
                                }
                            });
                            break;
                        case 'close':
                            layer.confirm('确认关闭该活动吗？',{icon:3,title:'保存提醒',yes:function () {

                                $.ajax({
                                    url:    tchost+'/tcstore/tcActivity/closeActivity',
                                    type:   'POST',
                                    headers:{"uid":Config.tcUid},
                                    //contentType: "application/json; charset=utf-8",
                                    data: {"activityId":activityId},
                                    success:function (data) {
                                        if (data.code ==200){
                                            layer.alert('关闭活动成功!',{icon:6});
                                            table.reload('testReload');
                                        }else {
                                            layer.alert("关闭活动失败:"+data.message,{icon:5});
                                        }

                                    },
                                    error:function () {
                                        layer.alert('关闭活动失败！',{icon:5});
                                    },
                                })

                                }})
                            break;
                        case 'device':
                            layer.open({
                                type:1
                                ,offeset: '10%'
                                ,title: '设备列表'
                                ,area: ['100%','25%']
                                ,content: layui.$("#list")
                                ,success: function () {
                                    table.render({
                                        elem: '#list'
                                        , url: '' //数据接口
                                        , cols: [[ //表头
                                            {field: 'deviceId', title: '设备编号', width: '50%'}
                                            ,{field: 'deviceName', title: '设备名称', width: '50%'}
                                        ]]
                                        ,data: deviceList

                                    });

                                }
                                ,end: function () {
                                    $("#list+div").remove();
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



            });

        },
        add: function () {
            layui.use(['form','laydate','upload','laytpl'],function () {
                var form = layui.form;
                var laydate = layui.laydate;
                var layer = layui.layer;
                var $=layui.$;
                var upload = layui.upload;
                var laytpl = layui.laytpl;
                
                var pageSizeMax = "1000";//定义查询得到的最大设备数

                //查询拥有的设备
                $.ajax({
                    url: tchost+'/tcstore/tcDeviceInfo/getList',
                    type: 'get',
                    contentType: 'application/json',
                    headers: {'uid':Config.tcUid},
                    data:{'pageSize':pageSizeMax},
                    success: function(data){
                        if(data.success ==true){
                            var getTpl = device_checkbox.innerHTML;
                            var view = document.getElementById('appendDevice');
                            laytpl(getTpl).render(data.result.records, function (html) {
                                view.innerHTML = html;
                            });
                            form.render('checkbox');
                        }

                    }

                });

                //动态添加输入框
                var maxAddInput = 1;
                $("#addInput").click(function () {
                    if(maxAddInput>10){
                        layer.alert("最多添加10条！");
                    }else {
                        var html = "<div class=\"layui-inline\">\n" +
                            "     <label class=\"layui-form-label\">\n" +
                            "     满</label>\n" +
                            "     <div class=\"layui-input-inline\">\n" +
                            "       <input type=\"test\" name=\"fullCutCill\" id=\"fullCutCill"+maxAddInput+"\" class=\"layui-input\">\n" +
                            "    </div>\n" +
                            "    </div>\n" +
                            "    <div class=\"layui-inline\">\n" +
                            "    <label class=\"layui-form-label\">\n" +
                            "    减</label>\n" +
                            "    <div class=\"layui-input-inline\">\n" +
                            "    <input type=\"test\" name=\"fullCutMoney\" id=\"fullCutCill"+maxAddInput+"\" class=\"layui-input\">\n" +
                            "    </div>\n" +
                            "</div><br>";
                        $("#appendInput").append(html);
                        maxAddInput++;

                    }

                });

                //提交数据
                form.on('submit(sub)',function (data) {
                    if(data.field.banner == ''){
                        layer.msg('上传图片不能为空!',{icon:2,time:2000});
                        return false;
                    }
                    //禁用按钮
                    $('#btnSub').addClass("layui-btn-disabled").attr('disabled',true);
                    var loading = layer.msg('保存中...', {icon: 16, shade: 0.3, time:0});
                    var ruleList =[];
                    var deviceIdList = [];
                    var type =data.field.activityType;
                    if (type ==1){
                        ruleList.push({"newCustCutMoney":data.field.newCustCutMoney,"newCustCutCill":data.field.newCustCutCill});
                    }
                    if (type ==2){
                        ruleList.push({"randomCutMax":data.field.randomCutMax,"randomCutMin":data.field.randomCutMin,"randomCutAverage":data.field.randomCutAverage});
                    }
                    if (type ==3){
                        $('input[name="fullCutCill"]').each(function (i) {
                            var fullCutMoney =$('input[name="fullCutMoney"]').eq(i);
                            ruleList.push({"fullCutCill":$(this).val(),"fullCutMoney":fullCutMoney.val()});
                        });
                    }
                    if (type ==4){
                        ruleList.push({"redPackSendCill":data.field.redPackSendCill,"redPackUseCill":data.field.redPackUseCill,"redPackMoney":data.field.redPackMoney,"redPackTimeLimit":data.field.redPackTimeLimit*24});
                    }
                    var deviceList =[];
                    $('input[type=checkbox]:checked').each(function () {
                        deviceList.push($(this).val());
                    });
                    data.field.ruleList = ruleList;   //活动规则
                    data.field.deviceIdList = deviceList;       //参与的设备
                    data.field.adminId = Config.tcUid;

                    $.ajax({
                        url: tchost+'/tcstore/tcActivity/saveActivity',
                        type: 'post',
                        contentType: 'application/json',
                        headers:{"uid":Config.tcUid},
                        data:JSON.stringify(data.field),
                        success: function(data){
                            if(data.code==200){
                                layer.msg('创建活动成功!',{icon:1,time:4000},function () {
                                    layer.close(loading);
                                    $("#btnSub").removeClass("layui-btn-disabled").attr("disabled",false); //启用按钮
                                    Fast.api.close();//在这里关闭当前弹窗
                                    parent.location.reload();//这里刷新父页面，可以换其他代码
                                });
                            }else{
                                layer.msg(data.message,{icon:2,time:5000});
                                layer.close(loading);
                                $("#btnSub").removeClass("layui-btn-disabled").attr("disabled",false); //启用按钮
                            }
                        }

                    });
                    return false;
                });

                //单选框控制显示内容
                form.on('radio(t)',function (data) {
                    if ($('#r input[name="activityType"]:checked ').val() == "1"){
                        $('#newjian').css("display","block");
                        $('#mansong').css("display","none");
                        $('#suiji').css("display","none");
                        $('#manjian2').css("display","none");
                    }
                    if ($('#r input[name="activityType"]:checked ').val() == "4"){
                        $('#newjian').css("display","none");
                        $('#mansong').css("display","block");
                        $('#suiji').css("display","none");
                        $('#manjian2').css("display","none");
                    }
                    if ($('#r input[name="activityType"]:checked ').val() == "2"){
                        $('#newjian').css("display","none");
                        $('#mansong').css("display","none");
                        $('#suiji').css("display","block");
                        $('#manjian2').css("display","none");
                    }
                    if ($('#r input[name="activityType"]:checked ').val() == "3"){
                        $('#newjian').css("display","none");
                        $('#mansong').css("display","none");
                        $('#suiji').css("display","none");
                        $('#manjian2').css("display","block");
                    }

                });

                //普通图片上传
                var flag = true;
                var uploadInst = upload.render({
                    elem: '#test1'
                    ,url: uploadUrl //改成您自己的上传接口
                    ,accept:'images'
                    ,acceptMime: 'image/*' //只筛选图片
                    ,field:'files'
                    //,auto: false
                    /*,before: function(obj){
                        //预读本地文件示例，不支持ie8
                        obj.preview(function(index, file, result){
                            $('#demo1').attr('src', result); //图片链接（base64）
                        });
                    }*/
                    /*,choose: function(obj){
                            var files = obj.pushFile(); //将每次选择的文件追加到文件队列
                            //图像预览，如果是多文件，会逐个添加。(不支持ie8/9)
                            obj.preview(function(index, file, result){
                                var imgobj = new Image(); //创建新img对象
                                imgobj.src = result; //指定数据源
                                imgobj.className = 'thumb';
                                imgobj.onclick = function(result) {
                                    //单击预览
                                    img_prev.src = this.src;
                                    var w = $(window).width() - 42, h = $(window).height() - 42;
                                    layer.open({
                                        title: '预览',
                                        type: 1,
                                        area: [w, h], //宽高
                                        content: $('#prevModal')
                                    });
                                };
                                document.getElementById("div_prev").appendChild(imgobj); //添加到预览区域
                            });
                        }*/
                    ,choose: function(obj){
                        console.log("iiiiii")
                         flag = true;
                        var files = obj.pushFile();
                        obj.preview(function(index, file, result){
                            console.log(file) //file表示文件信息，result表示文件src地址
                            var img = new Image();
                            img.src = result;
                            img.onload = function () { //初始化夹在完成后获取上传图片宽高，判断限制上传图片的大小。
                                if((img.width == 750)&&(img.height==300)){
                                    //预读本地文件示例，不支持ie8
                                    obj.preview(function(index, file, result){
                                        $('#demo1').attr('src', result); //图片链接（base64）
                                    });
                                }else{
                                    flag =false;
                                    console.log('pppp');
                                    layer.alert("仅可上传尺寸为：750*300px的图片", { icon: 5, title: "上传提醒", offset: "auto", skin: 'layui-layer-molv' });
                                    return false;
                                }
                            };
                            if (!flag) {
                                return false;
                            }
                        });
                    }
                    ,done: function(res){
                        //如果上传失败
                        if(res.code !==200){
                            return layer.msg('上传失败');
                        }
                        //上传成功,获得图片地址
                        var pic =res.result[0];
                        $('#banner').val(pic);
                    }
                    ,error: function(){
                        //演示失败状态，并实现重传
                        var demoText = $('#demoText');
                        demoText.html('<span style="color: #FF5722;">上传失败</span> <a class="layui-btn layui-btn-xs demo-reload">重试</a>');
                        demoText.find('.demo-reload').on('click', function(){
                            uploadInst.upload();
                        });
                    }
                });

                //时间控件
                var endDate= laydate.render({
                    elem: '#end_time',//选择器结束时间
                    type: 'datetime',
                    trigger: 'click',
                    done: function(value,date){
                        startDate.config.max={
                            year:date.year,
                            month:date.month-1,//关键
                            date: date.date,
                        }
                    },
                });
                var startDate=laydate.render({
                    elem: '#start_time', //选择器开始时间
                    type: 'datetime',
                    trigger: 'click',
                    max:"2099-12-31",//设置一个默认最大值
                    min: 0,
                    done: function(value, date){
                        endDate.config.min ={
                            year:date.year,
                            month:date.month-1, //关键
                            date: date.date,
                            hours:23,
                            minutes:59,
                            seconds:59

                        };
                    }
                });

            })

        },
        detail: function () {
            layui.use(['form','laydate','upload','laytpl'],function () {
                var form = layui.form;
                var laydate = layui.laydate;
                var layer = layui.layer;
                var $=layui.$;
                var upload = layui.upload;
                var laytpl = layui.laytpl;

                var pageSizeMax = "1000";//定义查询得到的最大设备数
                var bindDeviceList =[];////定义设备已勾选标记的外部变量

                //查询拥有的全部设备
                $.ajax({
                    url: tchost + '/tcstore/tcDeviceInfo/getList',
                    type: 'get',
                    contentType: 'application/json',
                    headers: {'uid': Config.tcUid},
                    data:{'pageSize':pageSizeMax},
                    async:false,
                    success: function (data) {
                        if (data.success == true) {
                            var getTpl = device_checkbox.innerHTML;
                            var view = document.getElementById('appendDevice');
                            laytpl(getTpl).render(data.result.records, function(html){
                                view.innerHTML = html;
                            });
                            form.render('checkbox'); //赋值后重新渲染
                        }

                    }

                });
                //获取当前活动详情
                $.ajax({
                    url:    tchost+'/tcstore/tcActivity/loadActivityByPrimKey',
                    type: 'get',
                    data:{"activityId":activityId},
                    headers:{"uid":Config.tcUid},
                    async:false,
                    success: function (res) {
                        var ruleList = res.result.ruleList;
                        var img =uploadView+res.result.banner;
                        var r_type = res.result.activityType;
                        $('#demo1').attr('src',img);
                        switch (r_type) {
                            case 1:
                                $('#newjian').css("display","block");
                                break;
                            case 2:
                                $('#suiji').css("display","block");
                                break;
                            case 3:
                                $('#manjian2').css("display","block");
                                break;
                            case 4:
                                $('#mansong').css("display","block");
                                break;
                        }

                        var fc_list =[];
                        $.each(ruleList,function (key,val) {
                            if(r_type ==1){
                                res.result.newCustCutCill = JSON.stringify(val['newCustCutCill']);
                                res.result.newCustCutMoney = JSON.stringify(val['newCustCutMoney']);
                            }
                            if(r_type ==2){
                                res.result.randomCutAverage = JSON.stringify(val['randomCutAverage']);
                                res.result.randomCutMax = JSON.stringify(val['randomCutMax']);
                                res.result.randomCutMin = JSON.stringify(val['randomCutMin']);
                            }
                            if(r_type ==3){
                                fullCutCill = JSON.stringify(val['fullCutCill']);
                                fullCutMoney = JSON.stringify(val['fullCutMoney']);
                                fc_list.push({"fullCutCill":fullCutCill,"fullCutMoney":fullCutMoney});
                            }
                            if(r_type ==4){
                                res.result.redPackMoney = JSON.stringify(val['redPackMoney']);
                                res.result.redPackSendCill = JSON.stringify(val['redPackSendCill']);
                                res.result.redPackTimeLimit = JSON.stringify((val['redPackTimeLimit'])/24);
                                res.result.redPackUseCill = JSON.stringify(val['redPackUseCill']);
                            }

                        });
                        //执行TPL
                        var getTpl = manjian.innerHTML;
                        var view = document.getElementById('appendInput');
                        laytpl(getTpl).render(fc_list, function (html) {
                            view.innerHTML = html;
                        });

                        bindDeviceList = res.result.deviceList;

                        var temp=[];
                        $.each(bindDeviceList,function (key,val) {
                            temp.push(val['id']);

                        });

                        $.each(temp,function (key,val) {
                            let node= $('input[type="checkbox"][name="deviceId"][value="'+val+'"]');
                            if (node && node.length) {
                                // 如果元素存在，使其选中
                                node[0].checked = true;
                            }
                        });

                        form.val("formTest", res.result);
                        form.render();
                        form.render('checkbox')


                    }
                });

                //动态添加输入框
                var maxAddInput = 1;
                $("#addInput").click(function () {
                    if(maxAddInput>5){
                        layer.alert("最多添加5条！");
                    }else {
                        var html = "<div class=\"layui-inline\">\n" +
                            "     <label class=\"layui-form-label\">\n" +
                            "     满</label>\n" +
                            "     <div class=\"layui-input-inline\">\n" +
                            "       <input type=\"test\" name=\"fullCutCill\" id=\"fullCutCill"+maxAddInput+"\" class=\"layui-input\">\n" +
                            "    </div>\n" +
                            "    </div>\n" +
                            "    <div class=\"layui-inline\">\n" +
                            "    <label class=\"layui-form-label\">\n" +
                            "    减</label>\n" +
                            "    <div class=\"layui-input-inline\">\n" +
                            "    <input type=\"test\" name=\"fullCutMoney\" id=\"fullCutCill"+maxAddInput+"\" class=\"layui-input\">\n" +
                            "    </div>\n" +
                            "</div><br>";
                        $("#appendInput").append(html);
                        maxAddInput++;

                    }

                })

                //提交数据
                form.on('submit(sub)',function (data) {
                    if(data.field.banner == ''){
                        layer.msg('上传图片不能为空!',{icon:2,time:2000});
                        return false;
                    }
                    //禁用按钮
                    $('#btn').addClass("layui-btn-disabled").attr('disabled',true);
                    var loading = layer.msg('保存中...', {icon: 16, shade: 0.3, time:0});
                    var ruleList =[];
                    var deviceIdList = [];
                    var type =data.field.activityType;
                    if (type ==1){
                        ruleList.push({"newCustCutMoney":data.field.newCustCutMoney,"newCustCutCill":data.field.newCustCutCill});
                    }
                    if (type ==2){
                        ruleList.push({"randomCutMax":data.field.randomCutMax,"randomCutMin":data.field.randomCutMin,"randomCutAverage":data.field.randomCutAverage});
                    }
                    if (type ==3){
                        $('input[name="fullCutCill"]').each(function (i) {
                            var fullCutMoney =$('input[name="fullCutMoney"]').eq(i);
                            ruleList.push({"fullCutCill":$(this).val(),"fullCutMoney":fullCutMoney.val()});
                        });
                    }
                    if (type ==4){
                        ruleList.push({"redPackSendCill":data.field.redPackSendCill,"redPackUseCill":data.field.redPackUseCill,"redPackMoney":data.field.redPackMoney,"redPackTimeLimit":data.field.redPackTimeLimit*24});
                    }
                    var deviceList =[];
                    $('input[type=checkbox]:checked').each(function () {
                        deviceList.push($(this).val());
                    });
                    data.field.ruleList = ruleList;   //活动规则
                    data.field.deviceIdList = deviceList;       //参与的设备
                    data.field.adminId = Config.tcUid;
                    data.field.id = activityId;

                    $.ajax({
                        url: tchost+'/tcstore/tcActivity/saveActivity',
                        type: 'post',
                        contentType: 'application/json',
                        headers:{"uid":Config.tcUid},
                        data:JSON.stringify(data.field),
                        success: function(data){
                            if(data.code==200){
                                layer.msg('修改活动成功!',{icon:1,time:4000},function () {
                                    layer.close(loading);
                                    $("#btn").removeClass("layui-btn-disabled").attr("disabled",false); //启用按钮
                                    Fast.api.close();//在这里关闭当前弹窗
                                    parent.location.reload();//这里刷新父页面，可以换其他代码
                                });
                            }else{
                                layer.msg(data.message,{icon:2,time:5000});
                                layer.close(loading);
                                $("#btn").removeClass("layui-btn-disabled").attr("disabled",false); //启用按钮
                            }
                        }

                    });
                    return false;
                });

                //单选框控制显示内容
                form.on('radio(t)',function (data) {
                    if ($('#r input[name="activityType"]:checked ').val() == "1"){
                        $('#newjian').css("display","block");
                        $('#mansong').css("display","none");
                        $('#suiji').css("display","none");
                        $('#manjian2').css("display","none");
                    }
                    if ($('#r input[name="activityType"]:checked ').val() == "4"){
                        $('#newjian').css("display","none");
                        $('#mansong').css("display","block");
                        $('#suiji').css("display","none");
                        $('#manjian2').css("display","none");
                    }
                    if ($('#r input[name="activityType"]:checked ').val() == "2"){
                        $('#newjian').css("display","none");
                        $('#mansong').css("display","none");
                        $('#suiji').css("display","block");
                        $('#manjian2').css("display","none");
                    }
                    if ($('#r input[name="activityType"]:checked ').val() == "3"){
                        $('#newjian').css("display","none");
                        $('#mansong').css("display","none");
                        $('#suiji').css("display","none");
                        $('#manjian2').css("display","block");
                    }
                });

                //普通图片上传
                var uploadInst = upload.render({
                    elem: '#test1'
                    ,url: uploadUrl //改成您自己的上传接口
                    ,accept:'images'
                    ,field:'files'
                    /*,before: function(obj){
                        //预读本地文件示例，不支持ie8
                        obj.preview(function(index, file, result){
                            $('#demo1').attr('src', result); //图片链接（base64）
                        });
                    }*/
                    /*,choose: function(obj){
                        console.log("iiiiii")
                        flag = true;
                        var files = obj.pushFile();
                        obj.preview(function(index, file, result){
                            console.log(file) //file表示文件信息，result表示文件src地址
                            var img = new Image();
                            img.src = result;
                            img.onload = function () { //初始化夹在完成后获取上传图片宽高，判断限制上传图片的大小。
                                if((img.width == 750)&&(img.height==300)){
                                    //预读本地文件示例，不支持ie8
                                    obj.preview(function(index, file, result){
                                        $('#demo1').attr('src', result); //图片链接（base64）
                                    });
                                }else{
                                    flag =false;
                                    console.log('pppp');
                                    layer.alert("仅可上传尺寸为：750*300px的图片", { icon: 5, title: "上传提醒", offset: "auto", skin: 'layui-layer-molv' });
                                    return false;
                                }
                            };
                            if (!flag) {
                                return false;
                            }
                        });
                    }*/
                    ,choose: function(obj){
                        console.log("iiiiii")
                        flag = true;
                        var files = obj.pushFile();
                        obj.preview(function(index, file, result){
                            console.log(file) //file表示文件信息，result表示文件src地址
                            var img = new Image();
                            img.src = result;
                            img.onload = function () { //初始化夹在完成后获取上传图片宽高，判断限制上传图片的大小。
                                if((img.width == 750)&&(img.height==300)){
                                    //预读本地文件示例，不支持ie8
                                    obj.preview(function(index, file, result){
                                        $('#demo1').attr('src', result); //图片链接（base64）
                                    });
                                }else{
                                    flag =false;
                                    console.log('pppp');
                                    layer.alert("仅可上传尺寸为：750*300px的图片", { icon: 5, title: "上传提醒", offset: "auto", skin: 'layui-layer-molv' });
                                    return false;
                                }
                            };
                            if (!flag) {
                                return false;
                            }
                        });
                    }
                    ,done: function(res){
                        //如果上传失败
                        if(res.code !==200){
                            return layer.msg('上传失败');
                        }
                        //上传成功,获得图片地址
                        var pic =res.result[0];
                        $('#banner').val(pic);
                    }
                    ,error: function(){
                        //演示失败状态，并实现重传
                        var demoText = $('#demoText');
                        demoText.html('<span style="color: #FF5722;">上传失败</span> <a class="layui-btn layui-btn-xs demo-reload">重试</a>');
                        demoText.find('.demo-reload').on('click', function(){
                            uploadInst.upload();
                        });
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

            })


        },
    };
    return Controller;
});
