define(['layui'], function (undefined) {
    var Controller = {
        index: function () {
            layui.use(['table', 'layer'], function () {
                var table = layui.table;
                var layer = layui.layer;
                var $ = layui.$;
                var form = layui.form;
                var total_count; //定义数据总数

                //获取模板列表
                table.render({
                    id: 'testReload'
                    , elem: '#demo'
                    , url: tchost + '/tcstore/tcGoods/getList' //数据接口
                    , method: "get"
                    ,limits:[10,20,50,100,200,500,1000,5000]//每页条数的选择项
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
                          {field: 'pic', title: '商品图片', width: '100', templet: '#id_img',align:'center'}
                        , {field: 'name', title: '商品名称', width: '400' ,align:'center'}
                        , {field: 'goodsId', title: '商品编号', width: '200',align:'center'}
                        , {field: 'salePrice', title: '售价', width: '150',edit:'text',templet:'#id_salePrice' ,align:'center'}
                        , {field: 'costPrice', title: '成本', width: '150',edit:'text',templet:'#id_costPrice',align:'center'}
                        , {field: 'suitType', title: '适用设备', width: '100', templet: '#id_suitType',align:'center'}
                        , {field: 'option', title: '操作', width: '250', templet: '#id_option',align:'center',fixed:'right'}
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
                    reload: function () {
                        var nameLike = $('#name').val();
                        var goodsId = $('#goodsId').val();
                        var suitType = $('#suitType').val();

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
                                nameLike: nameLike,
                                goodsId: goodsId,
                                suitType:suitType,

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

                            var nameLike = $('#name').val();
                            var goodsId = $('#goodsId').val();
                            var suitType = $('#suitType').val();

                            var now = new Date();
                            var date = now.toLocaleDateString();
                            var xhr = new XMLHttpRequest();

                            layer.confirm('选择导出数据',{icon:3,title:"导出确认",
                                btn:['导出本页','导出全部'],
                                btn1:function (index) {
                                    var loading = layer.msg('正在导出', {icon: 16, shade: 0.3, time:0});
                                    url = tchost+"/tcstore/tcGoods/excelExportList?nickName="+nameLike +
                                        '&goodsId'+goodsId+'&suitType'+suitType+
                                        '&pageNo='+recodePage + '&pageSize='+recodeLimit;
                                    xhr.open("get", url, true);
                                    xhr.setRequestHeader("uid", Config.tcUid);
                                    xhr.setRequestHeader('Content-Type', 'application/json');
                                    xhr.responseType = "blob";
                                    xhr.onload = function () {
                                        if (this.status == 200) {
                                            blob = new Blob([this.response], {type: 'application/vnd.ms-excel;charset=utf-8'});
                                            fileName = '商品导出'+date+'.xls';
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
                                    url = tchost+"/tcstore/tcGoods/excelExportList?nickName="+nameLike +
                                        '&goodsId'+goodsId+'&suitType'+suitType+
                                        '&pageNo=1&pageSize='+total_count;
                                    xhr.open("get", url, true);
                                    xhr.setRequestHeader("uid", Config.tcUid);
                                    xhr.setRequestHeader('Content-Type', 'application/json');
                                    xhr.responseType = "blob";
                                    xhr.onload = function () {
                                        if (this.status == 200) {
                                            blob = new Blob([this.response], {type: 'application/vnd.ms-excel;charset=utf-8'});
                                            fileName = '商品导出'+date+'.xls';
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
                    var modId = res.data.id;
                    switch (res.event) {
                        case 'edit':
                            layer.open({
                                type: 2
                                , title: '模板编辑'
                                , area: ['100%', '100%']
                                , content: ''+modId
                                , success: function () {
                                }
                            });
                            break;
                    }
                });

                //单元格编辑事件(商品价格信息编辑)
                table.on('edit(myfilter_test)', function(obj){ //注：edit是固定事件名，test是table原始容器的属性 lay-filter="对应的值"
                    var replace_data = obj.data;
                    //验证数量只能输入数字
                    var selector = obj.tr.find('[data-field=' + obj.field + ']');
                    var reg = /^(\d{1,7}\.\d{1,2})$|^(\d{1,7})$/g;
                    var oldtext = $(selector).text();
                    if (obj.field == 'salePrice') {
                        if (!reg.test(obj.value)) {
                            layer.msg('只能输入7位数字!且只能保留小数点后俩位!');
                            obj.tr.find('td[data-field=salePrice] input').val(oldtext);
                            obj.update({salePrice: oldtext});
                        }
                    }
                    if (obj.field == 'costPrice') {
                        if (!reg.test(obj.value)) {
                            layer.msg('只能输入7位数字!且只能保留小数点后俩位!');
                            obj.tr.find('td[data-field=costPrice] input').val(oldtext);
                            obj.update({costPrice: oldtext});
                        }
                    }

                    $.ajax({
                        type: 'get',
                        url: tchost+"/tcstore/tcGoods/editPriceByUser", // ajax请求路径
                        headers: {'uid':Config.tcUid},
                        data: {
                            costPrice:obj.data.costPrice,
                            salePrice:obj.data.salePrice,
                            goodsId:obj.data.goodsId,
                        },
                        success: function(data){
                            if(data. code ==200){
                                layer.msg('修改成功');
                            }
                            else{
                                layer.msg('修改失败:'+'只能输入7位数字!且只能保留小数点后俩位!'+data.message);
                            }

                        }
                    });
                });

            });
        },
    };
    return Controller;
});
