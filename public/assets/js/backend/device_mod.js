
/**
 * 表格自动搜索
 * @param formSelector 搜索表单选择器
 * @param tableID 表格ID
 * @param selectFilter select lay-filter值
 */
function tableAutoSearch(formSelector, tableID, selectFilter) {
    tableID = tableID || 'mytable';
    selectFilter = selectFilter || 'search';

    // 监听搜索表单提交事件
    layui.$(document).on('submit', formSelector, function () {
        layui.table.reload(tableID, {
            where: getFormVals(this)
        });

        return false;
    });

    // layui下拉框改变时触发搜索表单提交事件
    layui.form.on('select(' + selectFilter + ')', function(){
        layui.$(formSelector).trigger('submit');
    });

    // 表单内容发送改变时触发搜索表单提交事件
    layui.$(formSelector).find('input').change(function () {
        layui.$(formSelector).trigger('submit');
    });

    layui.$(formSelector).find('[laydate]').each(function () {
        let config = JSON.parse(this.getAttribute('laydate'));
        config.elem = this;
        config.done = function(value, date, endDate){
            setTimeout(function () {
                layui.$(formSelector).trigger('submit');
            }, 200);

        };

        layui.laydate.render(config);
    });
}
function getFormVals(selector) {
    let data = {};
    layui.each(layui.$(selector).serializeArray(), function (key, value) {
        data[value.name] = value.value;
    });

    return data;
}
define(['layui'], function (undefined) {

    var Controller = {

        index: function () {
            layui.use(['table','layer'], function () {
                var table = layui.table;
                var layer = layui.layer;
                $=layui.$;

                var userId = Config.userid;

                //获取模板列表
                table.render({
                    id: "mytable"
                    , elem: '#demo'
                    , url: 'device_mod/get_mod_list' //数据接口
                    , method: "post"
                    , page: {
                        layout: ['limit', 'count', 'prev', 'page', 'next', 'skip']
                        ,limit:10 //一页显示多少条
                        ,limits:[10,20,50,100,200,500,1000,5000]//每页条数的选择项
                        ,first: "首页" //不显示首页
                        ,last: "尾页" //不显示尾页
                    } //开启分页
                    ,toolbar: '#toolbarDemo' //开启头部工具栏，并为其绑定左侧模板
                    , cols: [[ //表头
                        //{field: 'uid', title: 'ID', width: 100, sort: true, fixed: 'left'}
                       // , {field: 'modCode', title: '模板编号', width: 160,sort: true}
                         {field: 'nickname', title: '名称', width: '25%',sort: true}
                        //, {field: 'modType', title: '模板类型', width: 120}
                        //, {field: 'bindDeviceList', title: '设备列表', width: '25%',templet: '#id_device'}
                        , {field: 'bind_good_list', title: '商品列表', width: '30%',templet:'#id_goods'}
                        , {field:'option' ,title: '操作',width:'45%',templet:'#id_edit'}
                    ]]
                });
                //头工具栏事件
                table.on('toolbar(myfilter_test)', function(obj){
                    switch(obj.event){
                        case 'create':
                            var index = layer.open({
                                type:2
                                ,title:'模板添加'
                                ,content: "device_mod/mod_add"
                            });
                            layer.full(index);

                    };
                });

                //表格自动搜索
                tableAutoSearch('.table-auto-search');

                //表格行按钮监听事件
                table.on('tool(myfilter_test)', function(res){

                    var goods = JSON.parse(res.data.bind_good_list);

                    var device = JSON.parse(res.data.bind_device_list);
                    var uid = res.data.uid;
                    switch (res.event) {
                        case 'goods':
                            layer.open({
                                type:1
                                ,title: '商品列表'
                                ,area: ['100%','80%']
                                ,content: layui.$("#list")
                                ,success: function () {
                                    table.render({
                                        elem: '#list'
                                        , url: '' //数据接口
                                        ,page: true //开启分页
                                        , cols: [[ //表头
                                            {field: 'code', title: '商品编号', width: '50%'}
                                            ,{field: 'name', title: '商品名称', width: '50%'}
                                        ]]
                                        ,data: goods

                                    });

                                }
                                ,end: function () {
                                    $("#list+div").remove();
                                }

                            });
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
                                            {field: 'code', title: '设备编号', width: '50%'}
                                            ,{field: 'name', title: '设备名称', width: '50%'}
                                        ]]
                                        ,data: device

                                    });

                                }
                                ,end: function () {
                                    $("#list+div").remove();
                                }
                            });
                            break;
                        case 'edit':
                            var index = layer.open({
                                type:2
                                ,title:'模板编辑'
                                ,content: "device_mod/mod_edit"+'?uid='+uid
                            });
                            layer.full(index);
                            break;
                        case 'insert':
                            var insert_mod = layer.open({
                                type:2
                                ,title:'模板导入'
                                ,content: "device_mod/mod_insert"+'?uid='+uid
                            });
                            layer.full(insert_mod);
                            break;
                        case 'device_select':
                            var device_select = layer.open({
                                type:2
                                ,title:'设备选择'
                                ,content: "device_mod/device_select"+'?uid='+uid
                            });
                            layer.full(device_select);
                            break;
                        case 'mod_name':
                            var mod_name = layer.open({
                                type:2
                                ,title:'修改模板名称'
                                ,content: "device_mod/mod_name"+'?uid='+uid
                            });
                            layer.full(mod_name);
                            break;
                    }
                });

            });

        },
        mod_edit: function () {
            layui.use('transfer', function(){
                var transfer = layui.transfer;
                $ = layui.$;
                $.ajax({
                    url: 'device_mod/goods',
                    method: 'post',
                    dataType: 'json',
                    success: function (data) {
                        //
                        temp = JSON.parse(data);
                        transfer.render({
                            elem: '#test1'  //绑定元素
                            ,showSearch: true
                            ,width: 400
                            ,height: 600
                            ,title: ["可选商品","已选商品"]
                            ,data: temp
                            ,id: 'demo1' //定义索引
                            ,value:rightArraySelected //右侧模板值
                            ,parseData:function (res) {
                                return {
                                    "value": res.goods_id //数据值
                                    , "title": res.name //数据标题
                                    , "disabled": res.disabled  //是否禁用
                                    , "checked": res.checked //是否选中
                                }

                            }
                            ,onchange:function (data,index) {
                                //
                                //

                            }
                        });
                        $(document).ready(function(){
                            $(".layui-transfer-search").last().hide();//隐藏穿梭框右边搜索框

                        });

                    }
                });

                //渲染
                /*保存模板*/
                $('#getData').on("click", function () {
                    layer.confirm('确认无误并保存吗？',{icon:3,title:'保存提醒',yes:function (index) {

                            //
                            //
                            var data = transfer.getData('demo1');
                            let arrayIds =new Map();
                            let target = [];

                            layui.each(data,function(index,item){
                                arrayIds.set(item.value+"",item);
                            })
                            //
                            var i=0;
                            layui.each(temp,function(index,item){
                                if(arrayIds.get(item.goods_id+"")!=null){
                                    target.push(item);i++;
                                }
                            })
                            //
                            target = JSON.stringify(target);
                            //

                            updata.bindGoodList = target;
                            //
                            $.ajax({
                                url: tchsot +'/tcstore/template/updateTempLate',
                                type: 'POST',
                                async: false,
                                contentType: "application/json; charset=utf-8",
                                data: JSON.stringify(updata),
                                success: function(data){
                                    layer.alert("保存成功!",{icon: 6});
                                },
                                error: function(e){
                                    if(i>50){
                                        layer.alert("保存失败!超过最大商品数量50个!",{icon: 5});
                                    }else{
                                        layer.alert("保存失败!请移除最新添加的商品重试！",{icon: 5});
                                    }

                                }

                            });

                        layer.close(index);

                    }})


                })

                /*同步到设备商品*/
                $('#save').on("click", function () {
                    var data = transfer.getData('demo1');
                    //
                    let arrayIds = [];
                    let target = [];

                    layui.each(data,function(index,item){
                       arrayIds.push(item.value)
                    })

                    $.ajax({
                        url: 'device_mod/device_goods_update?device_id='+device_id,
                        type: 'POST',
                        dataType: 'json',
                        async: false,
                        //traditional: true,
                        //contentType: "application/formdata ; charset=utf-8",
                        data: {arrayIds:JSON.stringify(arrayIds)},
                        success: function(data){
                            layer.alert("同步成功!",{icon:6});
                        },
                        error: function(e){
                            layer.alert("同步失败！",{icon: 5});
                        }

                    });

                })


            });

        },
        mod_add: function () {
            layui.use('form',function () {
                var form = layui.form;

            })

        },
        mod_insert: function () {
            layui.use('form',function () {
                var form = layui.form;

            })

        },
        device_select: function () {
            layui.use('form',function () {
                var form = layui.form;
            })

        },
        mod_name: function () {
            layui.use('form',function () {
                var form = layui.form;
            })

        },
    };
    return Controller;
});
