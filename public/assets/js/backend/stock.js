define(['jquery', 'bootstrap', 'backend', 'table', 'form','layui'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'stock/index' + location.search,
                    add_url: 'stock/add',
                    edit_url: 'stock/edit',
                    del_url: 'stock/del',
                    multi_url: 'stock/multi',
                    table: 'stock',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                //禁用默认搜索
                search:false,
                columns: [
                    [

                        {field: 'id', title: __('Id'),visible:false},
                        {field: 'device_id', title: __('设备id')},
                        //{field: 'administrator_id', title: __('商户姓名')},
                        {field: 'operate', title: __('Operate'), table: table,buttons:[
                                {name:'detail',text:'查看详情',title:'查看详情',icon:'fa fa-list',classname:'btn btn-xs btn-primary btn-dialog',url:'stock/detail?ids={ids}'},
                                {name:'detail',text:'销量统计',title:'销量统计',icon:'fa fa-list-alt',classname:'btn btn-xs btn-info btn-dialog',url:'stock/sales?device_id={device_id}'}
                            ],
                            events: Table.api.events.operate, formatter: Table.api.formatter.buttons}
                    ]
                ]
            });

            // 为表格绑定事件
            Table.api.bindevent(table);
        },
        add: function () {
            Controller.api.bindevent();
        },
        edit: function () {
            Controller.api.bindevent();
        },
        detail: function () {
            layui.use('form',function () {
                var form = layui.form;
                $ =layui.$;

                /*更新库存*/
                $('#save_stock').on("click",function () {
                    var array = $('#form').serializeArray();
                    //
                    var arr =[]
                    for(var i=0;i<array.length;i++){
                        var obj ={};
                        obj[array[i].name] = array[i]['value'];
                        arr.push(obj);
                    }
                    var num = array.length/5;
                    var temp =[];
                    for(j=0;j<num;j++){
                        var target ={};
                        target =Object.assign(arr[array.length-5],arr[array.length-4],arr[array.length-3],arr[array.length-2],arr[array.length-1])
                        temp.push(target);
                        array.length =array.length-5;
                    }
                    temp = JSON.stringify(temp)

                    $.ajax({
                        url: 'stock/do_edit?ids='+ids,
                        type: 'POST',
                        dataType: 'json',
                        async: false,
                        //traditional: true,
                        //contentType: "application/formdata ; charset=utf-8",
                        data: {temp},
                        success: function(data){
                            layer.alert("更新成功");
                        },
                        error: function(e){
                            layer.alert("更新失败!!");
                        }

                    });

                })

            })
        },
        sales: function () {
            layui.use(['table','layer','laydate'],function () {
                var table = layui.table;
                var layer =layui.layer;
                var laydate =layui.laydate;
                var $ = layui.$;

                //时间控件
                laydate.render({
                    elem: '#time'
                    ,range: true
                });

                //查询
                table.render({
                    elem: '#sales'
                    ,toolbar: '#toolbarDemo' //开启头部工具栏，并为其绑定左侧模板
                    ,cellMinWidth: 80
                    ,url: 'stock/sales_count?device_id=' + device_id
                    ,cols: [[
                        //{field: 'goodsId',title: '商品编码',width:120,sort: true,}
                        {field: 'name',title: '商品名称',width:230,sort: true}
                        ,{field: 'count',title: '已售数量',width:120,sort: true}
                        ,{field: 'coupon',title: '单价',width:120,sort: true}
                        ,{field: 'sum',title: '总价',width:120,sort: true}
                    ]]
                })
                //全部查询
                $('#search0').on("click",function () {
                    table.render({
                        elem: '#sales'
                        ,toolbar: '#toolbarDemo' //开启头部工具栏，并为其绑定左侧模板
                        ,cellMinWidth: 80
                        ,url: 'stock/sales_count?device_id=' + device_id
                        ,cols: [[
                            //{field: 'goodsId',title: '商品编码',width:120,sort: true,}
                            {field: 'name',title: '商品名称',width:230,sort: true}
                            ,{field: 'count',title: '已售数量',width:120,sort: true}
                            ,{field: 'coupon',title: '单价',width:120,sort: true}
                            ,{field: 'sum',title: '总价',width:120,sort: true}
                        ]]
                    })

                })
                //今日查询
                $('#search1').on("click",function () {
                    table.render({
                        elem: '#sales'
                        ,toolbar: '#toolbarDemo' //开启头部工具栏，并为其绑定左侧模板
                        ,cellMinWidth: 80
                        ,url: 'stock/time1?device_id=' + device_id
                        ,cols: [[
                            //{field: 'goodsId',title: '商品编码',width:120,sort: true,}
                            {field: 'name',title: '商品名称',width:230,sort: true}
                            ,{field: 'count',title: '已售数量',width:120,sort: true}
                            ,{field: 'coupon',title: '单价',width:120,sort: true}
                            ,{field: 'sum',title: '总价',width:120,sort: true}
                        ]]
                    })

                    /* $.ajax({
                         url: 'stock/sales_count?device_id=' + device_id,
                         type: 'POST',
                         contentType: "application/json; charset=utf-8",
                         data: "time",
                         success: function (data) {
                             table.render({
                                 elem: '#sales'
                                 ,toolbar: '#toolbarDemo' //开启头部工具栏，并为其绑定左侧模板
                                 ,cellMinWidth: 80
                                 ,url: 'stock/sales_count?device_id=' + device_id
                                 ,cols: [[
                                     //{field: 'goodsId',title: '商品编码',width:120,sort: true,}
                                     ,{field: 'name',title: '商品名称',width:230,sort: true}
                                     ,{field: 'count',title: '已售数量',width:120,sort: true,templet:'#count'}
                                 ]]
                             })
                         }
                     })*/

                })
                //昨日日查询
                $('#search2').on("click",function () {
                    table.render({
                        elem: '#sales'
                        ,toolbar: '#toolbarDemo' //开启头部工具栏，并为其绑定左侧模板
                        ,cellMinWidth: 80
                        ,url: 'stock/time2?device_id=' + device_id
                        ,cols: [[
                            //{field: 'goodsId',title: '商品编码',width:120,sort: true,}
                            {field: 'name',title: '商品名称',width:230,sort: true}
                            ,{field: 'count',title: '已售数量',width:120,sort: true}
                            ,{field: 'coupon',title: '单价',width:120,sort: true}
                            ,{field: 'sum',title: '总价',width:120,sort: true}
                        ]]
                    })

                    /* $.ajax({
                         url: 'stock/sales_count?device_id=' + device_id,
                         type: 'POST',
                         contentType: "application/json; charset=utf-8",
                         data: "time",
                         success: function (data) {
                             table.render({
                                 elem: '#sales'
                                 ,toolbar: '#toolbarDemo' //开启头部工具栏，并为其绑定左侧模板
                                 ,cellMinWidth: 80
                                 ,url: 'stock/sales_count?device_id=' + device_id
                                 ,cols: [[
                                     //{field: 'goodsId',title: '商品编码',width:120,sort: true,}
                                     ,{field: 'name',title: '商品名称',width:230,sort: true}
                                     ,{field: 'count',title: '已售数量',width:120,sort: true,templet:'#count'}
                                 ]]
                             })
                         }
                     })*/

                })
                //近7日今日查询
                $('#search3').on("click",function () {
                    table.render({
                        elem: '#sales'
                        ,toolbar: '#toolbarDemo' //开启头部工具栏，并为其绑定左侧模板
                        ,cellMinWidth: 80
                        ,url: 'stock/time3?device_id=' + device_id
                        ,cols: [[
                            //{field: 'goodsId',title: '商品编码',width:120,sort: true,}
                            {field: 'name',title: '商品名称',width:230,sort: true}
                            ,{field: 'count',title: '已售数量',width:120,sort: true}
                            ,{field: 'coupon',title: '单价',width:120,sort: true}
                            ,{field: 'sum',title: '总价',width:120,sort: true}
                        ]]
                    })

                    /* $.ajax({
                         url: 'stock/sales_count?device_id=' + device_id,
                         type: 'POST',
                         contentType: "application/json; charset=utf-8",
                         data: "time",
                         success: function (data) {
                             table.render({
                                 elem: '#sales'
                                 ,toolbar: '#toolbarDemo' //开启头部工具栏，并为其绑定左侧模板
                                 ,cellMinWidth: 80
                                 ,url: 'stock/sales_count?device_id=' + device_id
                                 ,cols: [[
                                     //{field: 'goodsId',title: '商品编码',width:120,sort: true,}
                                     ,{field: 'name',title: '商品名称',width:230,sort: true}
                                     ,{field: 'count',title: '已售数量',width:120,sort: true,templet:'#count'}
                                 ]]
                             })
                         }
                     })*/

                })
                //自定义查询
                $('#search4').on("click",function () {
                    var search_time = $(" input[ name='search_time' ] ").val()

                    table.render({
                        elem: '#sales'
                        ,toolbar: '#toolbarDemo' //开启头部工具栏，并为其绑定左侧模板
                        ,cellMinWidth: 80
                        ,url: 'stock/time4?device_id=' + device_id + '&time=' + search_time
                        ,cols: [[
                            //{field: 'goodsId',title: '商品编码',width:120,sort: true,}
                            {field: 'name',title: '商品名称',width:230,sort: true}
                            ,{field: 'count',title: '已售数量',width:120,sort: true}
                            ,{field: 'coupon',title: '单价',width:120,sort: true}
                            ,{field: 'sum',title: '总价',width:120,sort: true}
                        ]]
                    })


                })


            })


        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        },
    };
    return Controller;
});