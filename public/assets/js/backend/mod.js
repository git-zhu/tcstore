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
                    , url: tchost + '/tcstore/tcModel/getList' //数据接口
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
                          {field: 'nickName', title: '模板名称',width:'200',align:'center'}
                        , {field: 'suitType', title: '适用设备',width:'200', templet: '#id_suitType',align:'center'}
                        , {field: 'bindDeviceList', title: '绑定设备',width:'300', templet: '#id_bindDeviceList',align:'center'}
                        , {field: 'bindGoodsList', title: '模板商品',width:'100', templet: '#id_bindGoodsList',align:'center'}
                        , {field: 'remark', title: '备注',width:'200',align:'center'}
                        , {field: 'option', title: '操作',width:'250', templet: '#id_option',align:'center',fixed:'right'}
                    ]]
                });

                active = {
                    reload: function () {
                        var nickName = $('#nickName').val();

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
                                nickNameLike: nickName,
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
                            layer.open({
                                type: 2
                                , title: '模板添加'
                                , area: ['100%', '100%']
                                , content: 'mod/add'
                                , success: function () {
                                }
                            });
                            //location.href = 'mod/add';
                            break;
                        case 'out':
                            //获取当前页
                            var recodePage = $(".layui-laypage-skip .layui-input").val();
                            //获取当前页条数
                            var recodeLimit = $(".layui-laypage-limits").find("option:selected").val();

                            var nickName = $('#nickName').val();

                            var now = new Date();
                            var date = now.toLocaleDateString();
                            var xhr = new XMLHttpRequest();

                            layer.confirm('选择导出数据',{icon:3,title:"导出确认",
                                btn:['导出本页','导出全部'],
                                btn1:function (index) {
                                    var loading = layer.msg('正在导出', {icon: 16, shade: 0.3, time:0});
                                    url = tchost+"/tcstore/tcModel/excelExportList?nickName=" + nickName +
                                        '&pageNo='+recodePage + '&pageSize='+recodeLimit;
                                    xhr.open("get", url, true);
                                    xhr.setRequestHeader("uid", Config.tcUid);
                                    xhr.setRequestHeader('Content-Type', 'application/json');
                                    xhr.responseType = "blob";
                                    xhr.onload = function () {
                                        if (this.status == 200) {
                                            blob = new Blob([this.response], {type: 'application/vnd.ms-excel;charset=utf-8'});
                                            fileName = '模板导出'+date+'.xls';
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
                                    url = tchost+"/tcstore/tcModel/excelExportList?nickName=" + nickName +
                                        '&pageNo=1&pageSize='+total_count;
                                    xhr.open("get", url, true);
                                    xhr.setRequestHeader("uid", Config.tcUid);
                                    xhr.setRequestHeader('Content-Type', 'application/json');
                                    xhr.responseType = "blob";
                                    xhr.onload = function () {
                                        if (this.status == 200) {
                                            blob = new Blob([this.response], {type: 'application/vnd.ms-excel;charset=utf-8'});
                                            fileName = '模板导出'+date+'.xls';
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
                                , content: 'mod/edit?modId=' + modId
                                , success: function () {
                                }
                            });
                            break;
                        case 'copy':
                            $('#copy').addClass("layui-btn-disabled").attr('disabled',true);
                            var loading = layer.msg('复制中...', {icon: 16, shade: 0.3, time:0});
                            $.ajax({
                                url: tchost + '/tcstore/tcModel/copyById',
                                type: 'get',
                                headers: {"uid": Config.tcUid},
                                data: {"modId": modId},
                                success: function (data) {
                                    if (data.code == 200) {
                                        layer.alert('复制成功!', {icon: 6});
                                        $("#copy").removeClass("layui-btn-disabled").attr("disabled",false);  //启用按钮
                                        layer.close(loading);
                                        table.reload('testReload');
                                    } else {
                                        layer.alert("复制失败:" + data.message, {icon: 5});
                                        $("#copy").removeClass("layui-btn-disabled").attr("disabled",false);  //启用按钮
                                        layer.close(loading);
                                    }
                                },
                                error: function () {
                                    layer.alert('复制失败', {icon: 5});
                                    $("#copy").removeClass("layui-btn-disabled").attr("disabled",false);  //启用按钮
                                    layer.close(loading);

                                },
                            });


                            break;
                        case 'del':
                            $('#del').addClass("layui-btn-disabled").attr('disabled',true);
                            var loading = layer.msg('删除中...', {icon: 16, shade: 0.3, time:0});
                            $.ajax({
                                url: tchost + '/tcstore/tcModel/delOneById',
                                type: 'get',
                                headers: {"uid": Config.tcUid},
                                data: {"id": modId},
                                success: function (data) {
                                    if (data.code == 200) {
                                        layer.alert('删除成功!', {icon: 6});
                                        $("#del").removeClass("layui-btn-disabled").attr("disabled",false);  //启用按钮
                                        layer.close(loading);
                                        table.reload('testReload');
                                    } else {
                                        layer.alert("删除失败:" + data.message, {icon: 5});
                                        $("#del").removeClass("layui-btn-disabled").attr("disabled",false);  //启用按钮
                                        layer.close(loading);
                                    }
                                },
                                error: function () {
                                    layer.alert('删除失败!', {icon: 5});
                                    $("#del").removeClass("layui-btn-disabled").attr("disabled",false);  //启用按钮
                                    layer.close(loading);
                                },
                            });

                            break;
                        case 'goodsList':
                            layer.open({
                                type: 2
                                , title: '模板商品详情'
                                , area: ['80%', '70%']
                                , content: 'mod/goods_list?modId=' + modId
                                , success: function () {
                                }
                            });
                            break;
                    }
                });

            });
        },
        add: function () {
            layui.use(['table', 'layer', 'element', 'laytpl'], function () {
                var table = layui.table;
                var layer = layui.layer;
                var $ = layui.$;
                var form = layui.form;
                var element = layui.element;
                var laytpl = layui.laytpl;
                
                var pageSizeMax = "1000"; //定义查询设备最大数量
                
                var suitTypeForGoods; //定义商品适用设备类型

                var goodsMark = []; //定义商品勾选标记的外部变量

                $('#li_goods').click(function () {
                    table.reload('id_goodsTable');
                });
                $('#li_mod').click(function () {
                    table.reload('id_modTable');
                });

                // 封装去重的方法 maxArr 长度大的数组   minArr 长度小的数组,要进行比较的数组  返回的结果
                function arrRemoveRepetition(maxArr, minArr) {
                    var nArr = [];  //存储新数组
                    nArr = maxArr.filter(function (item) {
                        var temp = minArr.map(function (v) {
                            return v.goodsId
                        });
                        return !temp.includes(item.goodsId)
                    });
                    return nArr
                }

                //查询拥有的设备
                $.ajax({
                    url: tchost + '/tcstore/tcDeviceInfo/getList',
                    type: 'get',
                    contentType: 'application/json',
                    headers: {'uid': Config.tcUid},
                    data:{'pageSize':pageSizeMax},
                    success: function (data) {
                        if (data.success == true) {
                            var getTpl = device_checkbox.innerHTML;
                            var view = document.getElementById('appendDevice');
                            laytpl(getTpl).render(data.result.records, function (html) {
                                view.innerHTML = html;
                            });
                            form.render('checkbox');
                        }

                    }
                });

                //下拉框触发事件
                form.on("select", function (data) {

                    if (data.value == '') {
                        suitTypeForGoods = "";
                        table.reload('id_goodsTable',{
                            where:{
                                suitType:suitTypeForGoods
                                }
                            ,page:{
                                curr: 1 //重新从第 1 页开始
                                }
                            
                        });
                        $.ajax({
                            url: tchost + '/tcstore/tcDeviceInfo/getList',
                            type: 'get',
                            contentType: 'application/json',
                            headers: {'uid': Config.tcUid},
                            data: {'pageSize':pageSizeMax},
                            success: function (data) {
                                if (data.success == true) {
                                    var getTpl = device_checkbox.innerHTML;
                                    var view = document.getElementById('appendDevice');
                                    laytpl(getTpl).render(data.result.records, function (html) {
                                        view.innerHTML = html;
                                    });
                                    form.render('checkbox'); //赋值后重新渲染
                                }

                            }
                        });
                    }
                    if (data.value == '1') {
                        suitTypeForGoods = "1";
                        table.reload('id_goodsTable',{
                            where:{
                                suitType:suitTypeForGoods
                                }
                            ,page:{
                                curr: 1 //重新从第 1 页开始
                                }
                            
                        });
                        $.ajax({
                            url: tchost + '/tcstore/tcDeviceInfo/getList',
                            type: 'get',
                            contentType: 'application/json',
                            headers: {'uid': Config.tcUid},
                            data: {'deviceType': 1,'pageSize':pageSizeMax},
                            success: function (data) {
                                if (data.success == true) {
                                    var getTpl = device_checkbox.innerHTML;
                                    var view = document.getElementById('appendDevice');
                                    laytpl(getTpl).render(data.result.records, function (html) {
                                        view.innerHTML = html;
                                    });
                                    form.render('checkbox'); //赋值后重新渲染
                                }

                            }
                        });
                    }
                    if (data.value == '11') {
                        suitTypeForGoods = "11";
                        table.reload('id_goodsTable',{
                            where:{
                                suitType:suitTypeForGoods
                                }
                            ,page:{
                                curr: 1 //重新从第 1 页开始
                                }
                            
                        });
                        $.ajax({
                            url: tchost + '/tcstore/tcDeviceInfo/getList',
                            type: 'get',
                            contentType: 'application/json',
                            headers: {'uid': Config.tcUid},
                            data: {'deviceType': 11,'pageSize':pageSizeMax},
                            success: function (data) {
                                if (data.success == true) {
                                    var getTpl = device_checkbox.innerHTML;
                                    var view = document.getElementById('appendDevice');
                                    laytpl(getTpl).render(data.result.records, function (html) {
                                        view.innerHTML = html;
                                    });
                                    form.render('checkbox'); //赋值后重新渲染
                                }

                            }
                        });
                    }
                });


                //模板商品表格
                var mod_table = table.render({
                    id: 'id_modTable'
                    , elem: '#modTable'
                    , limit:100
                    , limits: [50, 100,500]//每页条数的选择项
                    , page: true
                    , data:[]
                    , toolbar: '#toolbarDemo' //开启头部工具栏，并为其绑定左侧模板
                    , defaultToolbar: []
                    , even:true
                    , cols: [[ //表头
                          {field: 'urlPhoto', title: '商品图片', width: '150', templet: '#id_img',align:'center'}
                        , {field: 'goodsName', title: '商品名称', width: '450',align:'center'}
                        , {field: 'goodsId', title: '商品编号', width: '200',align:'center'}
                        , {field: 'salePrice', title: '销售价格', width: '100', edit: 'text',align:'center'}
                        , {field: 'stockNum', title: '标准库存', width: '100', edit: 'text',align:'center'}
                        , {field: 'costPrice', title: '成本', width: '100', edit: 'text',align:'center'}
                        , {field: 'option', title: '操作', width: '150', templet: '#id_option_mod',align:'center',fixed:'right'}
                    ]]
                    , done: function (res, curr, count) {


                        hoverOpenImg();//显示大图
                        $('table tr').on('click', function () {
                            $('table tr').css('background', '');
                            $(this).css('background', '<%=PropKit.use("config.properties").get("table_color")%>');
                        });
                    }
                });
                mod_active = {
                    mod_reload: function () {
                        var nameLike = $('#goodsName1').val();
                        var goodsId = $('#goodsId1').val();

                        var res1 = goodsMark;  //给左侧商品赋值


                        var res2 = [];
                        $.each(res1, function (key, obj) {
                            if ((nameLike != '')&&(goodsId != '')) {
                                if ((obj.goodsName.indexOf(nameLike) >= 0)&&(obj.goodsId.indexOf(goodsId)>= 0))
                                    res2.push(obj);//只输出存在的值


                            } else if ((nameLike != '')&&(goodsId == '')){
                                if (obj.goodsName.indexOf(nameLike)>=0){
                                    res2.push(obj);//只输出存在的值
                                }
                            }else if ((goodsId != '')&&(nameLike == '')){
                                if (obj.goodsId.indexOf(goodsId)>=0){
                                    res2.push(obj);//只输出存在的值
                                }
                            }
                            else if((nameLike == '')&&(goodsId == '')){
                                res2.push(obj);
                            }



                        });
                        total = res2.length;

                        mod_table.reload({data:res2})

                    }
                };

                //总商品表格
                table.render({
                    id: 'id_goodsTable'
                    , elem: '#goodsTable'
                    , url: tchost + '/tcstore/tcModel/getAllGoodsList' //数据接口
                    , method: "get"
                    , limits:[10,20,50,100,200,500,1000,5000]//每页条数的选择项
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
                        var result = res.result.records; //返回的数据
                        //循环改变已勾选值得绑定状态
                        $.each(result,function (key,obj) {
                            if (obj['isBind'] ==1){
                                obj['isBind'] =0; //无论返回是否已绑定,都设为未绑定
                            }
                            $.each(goodsMark,function (k1,v1) {
                                if (obj['goodsId'] ==v1['goodsId']){
                                    obj['isBind']=1; //根据已绑定的goodsMark,重新设置为是否已绑定
                                }
                            });
                        });


                        return {
                            "code": res.code, //解析接口状态
                            "msg": res.message, //解析提示文本
                            "count": res.result.total, //解析数据长度
                            "data": result
                            //解析数据列表
                        }

                    }
                    , defaultToolbar: []
                    ,even:true
                    , cols: [[ //表头
                          {field: 'urlPhoto', title: '商品图片', width: '150', templet: '#id_img',align:'center'}
                        , {field: 'goodsName', title: '商品名称', width: '600',align:'center'}
                        , {field: 'goodsId', title: '商品编号', width: '300',align:'center'}
                        , {field: 'option', title: '操作', width: '150', templet: '#id_option_goods',align:'center',fixed:'right'}
                    ]]
                    , done: function (res, curr, count) {
                        hoverOpenImg();//显示大图
                        $('table tr').on('click', function () {
                            $('table tr').css('background', '');
                            $(this).css('background', '<%=PropKit.use("config.properties").get("table_color")%>');
                        });
                    }
                });
                goods_active = {
                    goods_reload: function () {
                        var nameLike = $('#goodsName2').val();
                        var goodsId = $('#goodsId2').val();

                        //执行重载
                        table.reload('id_goodsTable', {
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
                                createTimeSort: 1
                            }
                        }, 'data');

                    }
                };

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

                //模板表搜索点击事件
                $('#mod_search').on('click', function () {
                    var type = $(this).data('type');
                    mod_active[type] ? mod_active[type].call(this) : '';
                });

                //商品表搜索点击事件
                $('#goods_search').on('click', function () {
                    var type = $(this).data('type');
                    goods_active[type] ? goods_active[type].call(this) : '';
                });

                //重置事件
                $("#reset").click(function () {
                    $(":input").val("");
                    $("#type").val("");
                    form.render();
                });

                //模板商品表格行按钮监听事件
                table.on('tool(lf_modTable)', function (res) {

                    var data = res.data; //获取当前行数据
                    var modId = res.data.id;
                    var goodsId = res.data.goodsId;
                    switch (res.event) {
                        case 'del':
                            res.del(); //删除对应行（tr）的DOM结构，并更新缓存
                            //对象数组删除
                            for (var i = 0; i < goodsMark.length; i++) {
                                if (goodsMark[i].goodsId == res.data.goodsId) {
                                    goodsMark.splice(i, 1);
                                }
                            }
                            //mod_table.reload({data: goodsMark});


                            break;
                    }
                });

                //商品库表格行按钮监听事件
                table.on('tool(lf_goodsTable)', function (res) {

                    var data = res.data; //获取当前行数据
                    var modId = res.data.id;
                    var goodsId = res.data.goodsId;
                    switch (res.event) {
                        case 'addModGoods':
                            goodsMark.push(data);
                            //数组对象去重
                            var obj_goodsMark = {};
                            var result = [];
                            for (var i = 0; i < goodsMark.length; i++) {
                                if (!obj_goodsMark[goodsMark[i].goodsId]) {
                                    result.push(goodsMark[i]);
                                    obj_goodsMark[goodsMark[i].goodsId] = true;
                                }
                            }
                            goodsMark = result;



                            mod_table.reload({data: goodsMark});
                            //禁用按钮
                            $(this).addClass("layui-btn-disabled").attr('disabled', true).html('已选择');
                            break;
                    }
                });

                //单元格编辑事件(商品价格信息编辑)
                table.on('edit(lf_modTable)', function (obj) { //注：edit是固定事件名，test是table原始容器的属性 lay-filter="对应的值"
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
                    if (obj.field == 'stockNum') {
                        var kucun = /^(\d{1,7})$/g
                        if (!kucun.test(obj.value)) {
                            layer.msg('只能输入7位数字!');
                            obj.tr.find('td[data-field=stockNum] input').val(oldtext);
                            obj.update({stockNum: oldtext});
                        }
                    }
                    if (obj.field == 'costPrice') {
                        if (!reg.test(obj.value)) {
                            layer.msg('只能输入7位数字!且只能保留小数点后俩位!');
                            obj.tr.find('td[data-field=costPrice] input').val(oldtext);
                            obj.update({costPrice: oldtext});
                        }
                    }


                    //数组对象替换
                    for (var i = 0; i < goodsMark.length; i++) {
                        if (goodsMark[i].goodsId == obj.data.goodsId) {
                            goodsMark.splice(i, 1, replace_data);
                        }
                    }
                    mod_table.reload({data: goodsMark});




                });

                //提交保存
                form.on('submit(save)', function (data) {
                    var loading = layer.msg('保存中...', {icon: 16, shade: 0.3, time:0});
                    //禁用按钮
                    $('#btnSub').addClass("layui-btn-disabled").attr('disabled', true);
                    var deviceList = [];
                    $('input[type=checkbox]:checked').each(function () {
                        deviceList.push({"deviceId": $(this).val()});
                    });

                    data.field.goodsList = goodsMark; //获得已选商品信息;
                    data.field.deviceList = deviceList; //获得已选商品信息;
                    $.ajax({
                        url: tchost + '/tcstore/tcModel/updateOrEdit',
                        type: 'post',
                        contentType: 'application/json',
                        headers: {"uid": Config.tcUid},
                        data: JSON.stringify(data.field),
                        success: function (data) {

                            if (data.code == 200) {
                                layer.msg('创建模板成功!', {icon: 1, time: 2000}, function () {
                                    $("#btnSub").removeClass("layui-btn-disabled").attr("disabled",false); //启用按钮
                                    layer.close(loading);
                                    Fast.api.close();//在这里关闭当前弹窗
                                    parent.location.reload();//这里刷新父页面，可以换其他代码
                                });
                            } else {
                                layer.msg(data.message, {icon: 2, time: 5000});
                                $("#btnSub").removeClass("layui-btn-disabled").attr("disabled",false); //启用按钮
                                layer.close(loading);
                            }
                        }

                    });
                    return false;

                });


            });
        },
        edit: function () {
            layui.use(['table', 'layer', 'element', 'laytpl'], function () {
                var table = layui.table;
                var layer = layui.layer;
                var $ = layui.$;
                var form = layui.form;
                var element = layui.element;
                var laytpl = layui.laytpl;
                
                var pageSizeMax = "1000"; //定义查询设备最大数量
                
                var suitTypeForGoods; //定义商品适用设备类型

                var goodsMark = []; //定义商品勾选标记的外部变量
                var bindDeviceList;////定义设备已勾选标记的外部变量

                //获取异步ajax内容
                layer.ready(function () {
                    //获取当前模板详情
                    $.ajax({
                        url: tchost + '/tcstore/tcModel/getOne',
                        type: 'get',
                        contentType: 'application/json',
                        data: {"id": modId},
                        headers: {"uid": Config.tcUid},
                        async: false,
                        success: function (data) {
                            if (data.success == true) {

                                suitTypeForGoods = data.result.suitType;  //获取绑定设备类型
                                bindDeviceList = data.result.bindDeviceList; //获得已绑定的设备信息

                                form.val("formTest", data.result);
                                form.render();
                            }

                        }

                    });
                    //查询拥有的所有设备,并为已绑定设备赋值勾选
                    $.ajax({
                        url: tchost + '/tcstore/tcDeviceInfo/getList',
                        type: 'get',
                        contentType: 'application/json',
                        headers: {'uid': Config.tcUid},
                        data:{'pageSize':pageSizeMax},
                        async: false,
                        success: function (data) {
                            if (data.success == true) {
                                var getTpl = device_checkbox.innerHTML;
                                var view = document.getElementById('appendDevice');
                                laytpl(getTpl).render(data.result.records, function (html) {
                                    view.innerHTML = html;
                                });
                                var temp = [];
                                $.each(bindDeviceList, function (key, val) {
                                    temp.push(val['deviceId']);
                                });
                                $.each(temp, function (key, val) {
                                    let node = $('input[type="checkbox"][name="deviceId"][value="' + val + '"]');
                                    if (node && node.length) {
                                        // 如果元素存在，使其选中
                                        node[0].checked = true;
                                    }
                                });
                                form.render('checkbox');
                            }

                        }
                    });
                    //查询模板绑定商品
                    $.ajax({
                        url: tchost + '/tcstore/tcModel/getModelGoodsList',
                        type: 'get',
                        contentType: 'application/json',
                        headers: {'uid': Config.tcUid},
                        data: {'modId': modId,'pageSize':pageSizeMax},
                        async:false,
                        success: function (data) {
                            if (data.success == true) {
                                goodsMark = data.result.records;
                            }

                        }
                    });
                });

                $('#li_goods').click(function () {
                    table.reload('id_goodsTable');
                });
                $('#li_mod').click(function () {
                    table.reload('id_modTable');
                });

                // 封装去重的方法 maxArr 长度大的数组   minArr 长度小的数组,要进行比较的数组  返回的结果
                function arrRemoveRepetition(maxArr, minArr) {
                    var nArr = [];  //存储新数组
                    nArr = maxArr.filter(function (item) {
                        var temp = minArr.map(function (v) {
                            return v.goodsId
                        });
                        return !temp.includes(item.goodsId)
                    });
                    return nArr
                }

                //下拉框触发事件
                form.on("select", function (data) {
                    if (data.value == '') {
                        suitTypeForGoods ="";
                        
                        table.reload('id_goodsTable',{
                    where:{
                        suitType:suitTypeForGoods
                    }
                    ,page:{
                         curr: 1 //重新从第 1 页开始
                    }
                });
                        
                        $.ajax({
                            url: tchost + '/tcstore/tcDeviceInfo/getList',
                            type: 'get',
                            contentType: 'application/json',
                            headers: {'uid': Config.tcUid},
                            data:{'pageSize':pageSizeMax},
                            success: function (data) {
                                if (data.success == true) {
                                    var getTpl = device_checkbox.innerHTML;
                                    var view = document.getElementById('appendDevice');
                                    laytpl(getTpl).render(data.result.records, function (html) {
                                        view.innerHTML = html;
                                    });
                                    var temp = [];
                                    $.each(bindDeviceList, function (key, val) {
                                        temp.push(val['deviceId']);
                                    });
                                    $.each(temp, function (key, val) {
                                        let node = $('input[type="checkbox"][name="deviceId"][value="' + val + '"]');
                                        if (node && node.length) {
                                            // 如果元素存在，使其选中
                                            node[0].checked = true;
                                        }
                                    });
                                    form.render('checkbox'); //赋值后重新渲染
                                }

                            }
                        });
                    }
                    if (data.value == '1') {
                        suitTypeForGoods = "1";
                        
                        table.reload('id_goodsTable',{
                            where:{
                                suitType:suitTypeForGoods
                                }
                            ,page:{
                                curr: 1 //重新从第 1 页开始
                                }
                            
                        });
                        
                        console.log(suitTypeForGoods);
                        $.ajax({
                            url: tchost + '/tcstore/tcDeviceInfo/getList',
                            type: 'get',
                            contentType: 'application/json',
                            headers: {'uid': Config.tcUid},
                            data: {'deviceType': 1,'pageSize':pageSizeMax},
                            success: function (data) {
                                if (data.success == true) {
                                    var getTpl = device_checkbox.innerHTML;
                                    var view = document.getElementById('appendDevice');
                                    laytpl(getTpl).render(data.result.records, function (html) {
                                        view.innerHTML = html;
                                    });
                                    var temp = [];
                                    $.each(bindDeviceList, function (key, val) {
                                        temp.push(val['deviceId']);
                                    });
                                    $.each(temp, function (key, val) {
                                        let node = $('input[type="checkbox"][name="deviceId"][value="' + val + '"]');
                                        if (node && node.length) {
                                            // 如果元素存在，使其选中
                                            node[0].checked = true;
                                        }
                                    });
                                    form.render('checkbox'); //赋值后重新渲染
                                }

                            }
                        });
                    }
                    if (data.value == '11') {
                        suitTypeForGoods = "11";
                        
                        table.reload('id_goodsTable',{
                    where:{
                        suitType:suitTypeForGoods
                    }
                    ,page:{
                         curr: 1 //重新从第 1 页开始
                    }
                })
                        
                        console.log(suitTypeForGoods);
                        $.ajax({
                            url: tchost + '/tcstore/tcDeviceInfo/getList',
                            type: 'get',
                            contentType: 'application/json',
                            headers: {'uid': Config.tcUid},
                            data: {'deviceType': 11,'pageSize':pageSizeMax},
                            success: function (data) {
                                if (data.success == true) {
                                    var getTpl = device_checkbox.innerHTML;
                                    var view = document.getElementById('appendDevice');
                                    laytpl(getTpl).render(data.result.records, function (html) {
                                        view.innerHTML = html;
                                    });
                                    var temp = [];
                                    $.each(bindDeviceList, function (key, val) {
                                        temp.push(val['deviceId']);
                                    });
                                    $.each(temp, function (key, val) {
                                        let node = $('input[type="checkbox"][name="deviceId"][value="' + val + '"]');
                                        if (node && node.length) {
                                            // 如果元素存在，使其选中
                                            node[0].checked = true;
                                        }
                                    });
                                    form.render('checkbox'); //赋值后重新渲染
                                }

                            }
                        });
                    }
                });
                mod_table = table.render({
                    id: 'id_modTable'
                    , elem: '#modTable'
                    , url: tchost + '/tcstore/tcModel/getModelGoodsList'
                    , limit:100
                    , limits: [50, 100,500]//每页条数的选择项
                    , page: true
                    , headers: {'uid': Config.tcUid}
                    , where: {'modId': modId}
                    , toolbar: '#toolbarDemo' //开启头部工具栏，并为其绑定左侧模板
                    , request: {
                        pageName: 'pageNo' //页码的参数名称，默认：page
                        , limitName: 'pageSize' //每页数据量的参数名，默认：limit
                    }
                    , response: {
                        statusName: 'code' //数据状态的字段名称
                        , statusCode: 200 //成功的状态码
                    }
                    , defaultToolbar: []
                    , even:true
                    , cols: [[ //表头
                          {field: 'urlPhoto', title: '商品图片', width: '150', templet: '#id_img',align:'center'}
                        , {field: 'goodsName', title: '商品名称', width: '450',align:'center'}
                        , {field: 'goodsId', title: '商品编码', width: '200',align:'center'}
                        , {field: 'salePrice', title: '销售价格', width: '100', edit: 'text', templet: '#id_salePrice',align:'center'}
                        , {field: 'stockNum', title: '标准库存', width: '100', edit: 'text', templet: '#id_stockNum',align:'center'}
                        , {field: 'costPrice', title: '成本', width: '100', edit: 'text', templet: '#id_costPrice',align:'center'}
                        , {field: 'option', title: '操作', width: '150', templet: '#id_option_mod',align:'center',fixed:'right'}
                    ]]
                    , parseData: function (res) {
                        var nameLike = $('#goodsName1').val();
                        var goodsId = $('#goodsId1').val();

                        var res1 = goodsMark;  //给左侧商品赋值



                        var res2 = [];
                        $.each(res1, function (key, obj) {
                            if ((nameLike != '')&&(goodsId != '')) {
                                if ((obj.goodsName.indexOf(nameLike) >= 0)&&(obj.goodsId.indexOf(goodsId)>= 0))
                                    res2.push(obj);//只输出存在的值


                            } else if ((nameLike != '')&&(goodsId == '')){
                                if (obj.goodsName.indexOf(nameLike)>=0){
                                    res2.push(obj);//只输出存在的值
                                }
                            }else if ((goodsId != '')&&(nameLike == '')){
                                if (obj.goodsId.indexOf(goodsId)>=0){
                                    res2.push(obj);//只输出存在的值
                                }
                            }
                            else if((nameLike == '')&&(goodsId == '')){
                                res2.push(obj);
                            }

                        });
                        total = res2.length;


                        return {
                            "code": res.code, //解析接口状态
                            "msg": res.message, //解析提示文本
                            "count": total, //解析数据长度
                            "data": res2
                            //解析数据列表
                        }

                    }
                    , done: function (res, curr, count) {


                        hoverOpenImg();//显示大图
                        $('table tr').on('click', function () {
                            $('table tr').css('background', '');
                            $(this).css('background', '<%=PropKit.use("config.properties").get("table_color")%>');
                        });
                    }
                });
                mod_active = {
                    mod_reload: function () {
                        var nameLike = $('#goodsName1').val();
                        var goodsId = $('#goodsId1').val();




                        //执行重载
                        mod_table.reload('id_modTable', {
                            page: {
                                curr: 1 //重新从第一页开始
                            }
                            , where: {
                                nameLike: nameLike,
                                goodsId: goodsId,
                                createTimeSort: 1
                            }
                        }, 'data');

                    }
                };

                //总商品表格
                table.render({
                    id: 'id_goodsTable'
                    , elem: '#goodsTable'
                    , url: tchost + '/tcstore/tcModel/getAllGoodsList' //数据接口
                    , method: "get"
                    , limits:[10,20,50,100,200,500,1000,5000]//每页条数的选择项
                    , page: true
                    , toolbar: '#toolbarDemo' //开启头部工具栏，并为其绑定左侧模板
                    , headers: {'uid': Config.tcUid}
                    , where: {'modId': modId,'suitType':suitTypeForGoods}
                    , request: {
                        pageName: 'pageNo' //页码的参数名称，默认：page
                        , limitName: 'pageSize' //每页数据量的参数名，默认：limit
                    }
                    , response: {
                        statusName: 'code' //数据状态的字段名称
                        , statusCode: 200 //成功的状态码
                    }
                    , parseData: function (res) {
                        var result = res.result.records; //返回的数据
                        //循环改变已勾选值得绑定状态
                        $.each(result,function (key,obj) {
                            if (obj['isBind'] ==1){
                                obj['isBind'] =0; //无论返回是否已绑定,都设为未绑定
                            }
                            $.each(goodsMark,function (k1,v1) {
                                if (obj['goodsId'] ==v1['goodsId']){
                                    obj['isBind']=1; //根据已绑定的goodsMark,重新设置为是否已绑定
                                }
                            });
                        });


                        return {
                            "code": res.code, //解析接口状态
                            "msg": res.message, //解析提示文本
                            "count": res.result.total, //解析数据长度
                            "data": result
                            //解析数据列表
                        }

                    }
                    , defaultToolbar: []
                    , cols: [[ //表头
                          {field: 'urlPhoto', title: '商品图片', width: '150', templet: '#id_img',align:'center'}
                        , {field: 'goodsName', title: '商品名称', width: '600',align:'center'}
                        , {field: 'goodsId', title: '商品编号', width: '250',align:'center'}
                        , {field: 'option', title: '操作', width: '150', templet: '#id_option_goods',align:'center',fixed:'right'}
                    ]]
                    , done: function (res, curr, count) {
                        hoverOpenImg();//显示大图
                        $('table tr').on('click', function () {
                            $('table tr').css('background', '');
                            $(this).css('background', '<%=PropKit.use("config.properties").get("table_color")%>');
                        });
                    }
                });
                goods_active = {
                    goods_reload: function () {
                        var nameLike = $('#goodsName2').val();
                        var goodsId = $('#goodsId2').val();

                        //执行重载
                        table.reload('id_goodsTable', {
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
                                createTimeSort: 1
                            }
                        }, 'data');

                    }
                };

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

                //模板表搜索点击事件
                $('#mod_search').on('click', function () {
                    var type = $(this).data('type');
                    mod_active[type] ? mod_active[type].call(this) : '';
                });

                //商品表搜索点击事件
                $('#goods_search').on('click', function () {
                    var type = $(this).data('type');
                    goods_active[type] ? goods_active[type].call(this) : '';
                });

                //重置事件
                $("#reset").click(function () {
                    $(":input").val("");
                    $("#type").val("");
                    form.render();
                });

                //模板商品表格行按钮监听事件
                table.on('tool(lf_modTable)', function (res) {
                    var data = res.data; //获取当前行数据
                    var modId = res.data.id;
                    var goodsId = res.data.goodsId;
                    switch (res.event) {
                        case 'del':
                            res.del(); //删除对应行（tr）的DOM结构，并更新缓存
                            //对象数组删除
                            for (var i = 0; i < goodsMark.length; i++) {
                                if (goodsMark[i].goodsId == res.data.goodsId) {
                                    goodsMark.splice(i, 1);
                                }
                            }
                            //mod_table.reload({data: goodsMark});


                            break;
                    }
                });

                //商品库表格行按钮监听事件
                table.on('tool(lf_goodsTable)', function (res) {
                    var data = res.data; //获取当前行数据
                    var modId = res.data.id;
                    var goodsId = res.data.goodsId;
                    switch (res.event) {
                        case 'addModGoods':
                            goodsMark.push(data); //选中行添加到已勾选变量 ;
                            //数组对象去重
                            var obj_goodsMark = {};
                            var result = [];
                            for (var i = 0; i < goodsMark.length; i++) {
                                if (!obj_goodsMark[goodsMark[i].goodsId]) {
                                    result.push(goodsMark[i]);
                                    obj_goodsMark[goodsMark[i].goodsId] = true;
                                }
                            }
                            goodsMark = result;



                            //mod_table.reload({data: goodsMark});
                            //禁用按钮
                            $(this).addClass("layui-btn-disabled").attr('disabled', true).html('已选择');
                            break;
                    }
                });

                //单元格编辑事件(商品价格信息编辑)
                table.on('edit(lf_modTable)', function (obj) { //注：edit是固定事件名，test是table原始容器的属性 lay-filter="对应的值"
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
                    if (obj.field == 'stockNum') {
                        var kucun = /^(\d{1,7})$/g
                        if (!kucun.test(obj.value)) {
                            layer.msg('只能输入7位数字!');
                            obj.tr.find('td[data-field=stockNum] input').val(oldtext);
                            obj.update({stockNum: oldtext});
                        }
                    }
                    if (obj.field == 'costPrice') {
                        if (!reg.test(obj.value)) {
                            layer.msg('只能输入7位数字!且只能保留小数点后俩位!');
                            obj.tr.find('td[data-field=costPrice] input').val(oldtext);
                            obj.update({costPrice: oldtext});
                        }
                    }


                    //数组对象替换
                    for (var i = 0; i < goodsMark.length; i++) {
                        if (goodsMark[i].goodsId == obj.data.goodsId) {
                            goodsMark.splice(i, 1, replace_data);
                        }
                    }
                    mod_table.reload({data: goodsMark}); //赋值




                });

                //提交保存
                form.on('submit(save)', function (data) {
                    console.log(data);
                    var loading = layer.msg('保存中...', {icon: 16, shade: 0.3, time:0});
                    //禁用按钮
                    $('#btnSub').addClass("layui-btn-disabled").attr('disabled', true);
                    var deviceList = [];
                    $('input[type=checkbox]:checked').each(function () {
                        deviceList.push({"deviceId": $(this).val()});
                    });
                    data.field.id = modId; //更新的modId
                    data.field.goodsList = goodsMark; //获得已选商品信息;
                    data.field.deviceList = deviceList; //获得已选商品信息;
                    $.ajax({
                        url: tchost + '/tcstore/tcModel/updateOrEdit',
                        type: 'post',
                        contentType: 'application/json',
                        headers: {"uid": Config.tcUid},
                        data: JSON.stringify(data.field),
                        success: function (data) {
                            if (data.code == 200) {
                                layer.msg('保存模板成功!', {icon: 1, time: 2000}, function () {
                                    $("#btnSub").removeClass("layui-btn-disabled").attr("disabled",false); //启用按钮
                                    layer.close(loading);
                                    Fast.api.close();//在这里关闭当前弹窗
                                    parent.location.reload();//这里刷新父页面，可以换其他代码
                                });
                            } else {
                                layer.msg(data.message, {icon: 2, time: 5000});
                                $("#btnSub").removeClass("layui-btn-disabled").attr("disabled",false); //启用按钮
                                layer.close(loading);
                            }
                        }

                    });
                    return false;

                });


            });
        },
        goods_list: function () {
            layui.use(['table', 'layer'], function () {
                var table = layui.table;
                var layer = layui.layer;
                var $ = layui.$;
                var form = layui.form;

                //获取模板列表
                table.render({
                    id: 'testReload'
                    , elem: '#demo'
                    , url: tchost + '/tcstore/tcModel/getModelGoodsList' //数据接口
                    , method: "get"
                    , limits:[10,20,50,100,200,500,1000,5000]//每页条数的选择项
                    , page: true
                    //, toolbar: '#toolbarDemo' //开启头部工具栏，并为其绑定左侧模板
                    , headers: {'uid': Config.tcUid}
                    , request: {
                        pageName: 'pageNo' //页码的参数名称，默认：page
                        , limitName: 'pageSize' //每页数据量的参数名，默认：limit
                    }
                    , response: {
                        statusName: 'code' //数据状态的字段名称
                        , statusCode: 200 //成功的状态码
                    }
                    , where: {
                        modId: modId,
                        createTimeSort: 1
                    }
                    ,defaultToolbar: []
                    , parseData: function (res) {
                        return {
                            "code": res.code, //解析接口状态
                            "msg": res.message, //解析提示文本
                            "count": res.result.total, //解析数据长度
                            "data": res.result.records //解析数据列表
                        }

                    }
                    //, defaultToolbar: []
                    ,even:true
                    , cols: [[ //表头
                          {field: 'urlPhoto', title: '商品图片', width: '10%', templet: '#id_img',align:'center'}
                        , {field: 'goodsName', title: '商品名称', width: '35%',align:'center'}
                        , {field: 'goodsId', title: '商品编号', width: '15%',align:'center'}
                        , {field: 'costPrice', title: '成本价', width: '20%',align:'center'}
                        , {field: 'salePrice', title: '销售价格', width: '20%',align:'center'}
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

            });
        }
    };
    return Controller;
});
