define(['layui'], function (undefined) {
    var Controller = {
        index: function () {
            layui.use(['table','layer','form'], function () {
                var table = layui.table;
                var layer = layui.layer;
                var form = layui.form;
                var $=layui.$;

                //获取模板列表
                table.render({
                    id:'testReload'
                    ,elem: '#demo'
                    , url: tchost +'/tcstore/tcDeviceInfo/getList' //数据接口
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
                          {field: 'deviceId', title: '设备编号', width: '100',align:'center'}
                        , {field:'name' ,title: '设备名称',width:'150',align:'center'}
                        , {field:'address' ,title: '投放地址',width:'300',align:'center'}
                        , {field:'isOnline' ,title: '在线状态',width:'100',templet:'#id_isOnline',align:'center'}
                        , {field:'status' ,title: '运行状态',width:'100',templet:'#id_status',align:'center'}
                        , {field:'' ,title: '信号强度',width:'100',align:'center'}
                        , {field:'administratorName' ,title: '所属商户',width:'150',align:'center'}
                        , {field:'deviceType' ,title: '设备类型',width:'200',templet:'#id_deviceType',align:'center'}
                        , {field:'modName' ,title: '绑定模板',width:'200',align:'center'}
                        , {field:'option' ,title: '操作',width:'500',templet:'#id_option',align:'center',fixed:'right'}
                    ]]
                });

                active = {
                    reload:function () {
                        var deviceId =$('#deviceId').val();
                        var deviceName =$('#deviceName').val();
                        var addressLike =$('#addressLike').val();
                        var administratorNameLike =$('#administratorNameLike').val();
                        var deviceType =$('#deviceType').val();
                        var isOnline =$('#isOnline').val();
                        var nameLike = $('#nameLike').val();
                        var status = $('#status').val();

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
                                deviceName:deviceName,
                                addressLike:addressLike,
                                administratorNameLike:administratorNameLike,
                                status:status,
                                deviceType:deviceType,
                                isOnline:isOnline,
                                nameLike:nameLike,
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
                                ,area: ['50%','80%']
                                ,title:'设备新添'
                                ,content: ""
                                ,end:function () {
                                    table.reload('demo');
                                }
                            });
                            break;
                        case 'out':
                            //获取当前页
                            var recodePage = $(".layui-laypage-skip .layui-input").val();
                            //获取当前页条数
                            var recodeLimit = $(".layui-laypage-limits").find("option:selected").val();

                            var deviceId =$('#deviceId').val();
                            var addressLike =$('#addressLike').val();
                            var administratorNameLike =$('#administratorNameLike').val();
                            var deviceType =$('#deviceType').val();
                            var isOnline =$('#isOnline').val();
                            var nameLike = $('#nameLike').val();
                            var status = $('#status').val();

                            var now = new Date();
                            var date = now.toLocaleDateString();
                            var xhr = new XMLHttpRequest();

                            layer.confirm('选择导出数据', {
                                icon: 3, title: "导出确认",
                                btn: ['导出本页', '导出全部'],
                                btn1: function (index) {
                                    var loading = layer.msg('正在导出', {icon: 16, shade: 0.3, time: 0});
                                    url = tchost+"/tcstore/tcDeviceInfo/excelExportList?addressLike="+addressLike+
                                        '&deviceId='+deviceId +'&administratorNameLike='+administratorNameLike+'&deviceType='+deviceType+
                                        '&isOnline='+isOnline+'&nameLike='+nameLike+
                                        '&pageNo=' + recodePage + '&pageSize=' + recodeLimit;
                                    xhr.open("get", url, true);
                                    xhr.setRequestHeader("uid", Config.tcUid);
                                    xhr.setRequestHeader('Content-Type', 'application/json');
                                    xhr.responseType = "blob";
                                    xhr.onload = function () {
                                        if (this.status == 200) {
                                            blob = new Blob([this.response], {type: 'application/vnd.ms-excel;charset=utf-8'});
                                            fileName = '设备信息导出' + date + '.xls';
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
                                    url = tchost+"/tcstore/tcDeviceInfo/excelExportList?addressLike="+addressLike+
                                        '&deviceId='+deviceId+'&deviceName='+ deviceName +'&administratorNameLike='+administratorNameLike+'&deviceType='+deviceType+
                                        '&isOnline='+isOnline+'&nameLike='+nameLike+
                                        '&pageNo=' + recodePage + '&pageSize=' + recodeLimit;
                                    xhr.open("get", url, true);
                                    xhr.setRequestHeader("uid", Config.tcUid);
                                    xhr.setRequestHeader('Content-Type', 'application/json');
                                    xhr.responseType = "blob";
                                    xhr.onload = function () {
                                        if (this.status == 200) {
                                            blob = new Blob([this.response], {type: 'application/vnd.ms-excel;charset=utf-8'});
                                            fileName = '设备信息导出' + date + '.xls';
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
                    var id =res.data.id;
                    switch (res.event) {
                        case 'detail':
                            layer.open({
                                type:2
                                ,title: '订单详情'
                                ,area: ['100%','100%']
                                ,content: 'tc_order_info/detail?id='+id
                                ,success: function () {
                                }

                            });
                            break;
                    }
                });

            });

        },
        edit: function () {
            layui.use(['form','laytpl'],function () {
                var form = layui.form;
                var $=layui.$;
                var laytpl = layui.laytpl;

                $.ajax({
                    url: tchost+'/tcstore/tcOrderInfo/getOne',
                    type: 'get',
                    contentType: 'application/json',
                    headers: {'uid':Config.tcUid},
                    data: {"id":id},
                    async:false,
                    success: function(data){
                        if (data.code ==200){
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
                            laytpl(getTpl1).render(result, function(html){
                                view1.innerHTML = html;
                            });
                            laytpl(getTpl2).render(orderDetailList, function(html){
                                view2.innerHTML = html;
                            });
                            laytpl(getTpl3).render(result, function(html){
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
