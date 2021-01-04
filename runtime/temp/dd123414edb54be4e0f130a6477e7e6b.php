<?php if (!defined('THINK_PATH')) exit(); /*a:4:{s:82:"/www/wwwroot/test.wfbest.top/public/../application/admin/view/dashboard/index.html";i:1608885047;s:71:"/www/wwwroot/test.wfbest.top/application/admin/view/layout/default.html";i:1608728870;s:68:"/www/wwwroot/test.wfbest.top/application/admin/view/common/meta.html";i:1583049507;s:70:"/www/wwwroot/test.wfbest.top/application/admin/view/common/script.html";i:1583049507;}*/ ?>
<!DOCTYPE html>
<html lang="<?php echo $config['language']; ?>">
    <head>
        <meta charset="utf-8">
<title><?php echo (isset($title) && ($title !== '')?$title:''); ?></title>
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<meta name="renderer" content="webkit">

<link rel="shortcut icon" href="/assets/img/favicon.ico" />
<!-- Loading Bootstrap -->
<link href="/assets/css/backend<?php echo \think\Config::get('app_debug')?'':'.min'; ?>.css?v=<?php echo \think\Config::get('site.version'); ?>" rel="stylesheet">

<!-- HTML5 shim, for IE6-8 support of HTML5 elements. All other JS at the end of file. -->
<!--[if lt IE 9]>
  <script src="/assets/js/html5shiv.js"></script>
  <script src="/assets/js/respond.min.js"></script>
<![endif]-->
<script type="text/javascript">
    var require = {
        config:  <?php echo json_encode($config); ?>
    };
</script>
    </head>
    <body class="inside-header inside-aside <?php echo defined('IS_DIALOG') && IS_DIALOG ? 'is-dialog' : ''; ?>">
        <div id="main" role="main">
            <div class="tab-content tab-addtabs">
                <div id="content">
                    <div class="row">
                        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <section class="content-header hide">
                                <h1>
                                    <?php echo __('Dashboard'); ?>
                                    <small><?php echo __('Control panel'); ?></small>
                                </h1>
                            </section>
                            <?php if(!IS_DIALOG && !\think\Config::get('fastadmin.multiplenav')): ?>
                            <!-- RIBBON -->
                            <div id="ribbon">
                                <!--<ol class="breadcrumb pull-left">
                                    <li><a href="dashboard" class="addtabsit"><i class="fa fa-dashboard"></i> <?php echo __('首页'); ?></a></li>
                                </ol>-->
                                <ol class="breadcrumb pull-right">
                                    <?php foreach($breadcrumb as $vo): ?>
                                    <li><a href="javascript:;" data-url="<?php echo $vo['url']; ?>"><?php echo $vo['title']; ?></a></li>
                                    <?php endforeach; ?>
                                </ol>
                            </div>
                            <!-- END RIBBON -->
                            <?php endif; ?>
                            <div class="content">
                                <div class="content">
    <div style="padding: 20px; background-color: #F2F2F2;">
        <fieldset class="layui-elem-field layui-field-title" style="margin-top: 20px;">
            <legend>实时数据展示</legend>
        </fieldset>
        <div class="layui-row layui-col-space15">
            <div class="layui-col-md3">
                <div class="layui-card">
                    <div class="layui-card-header">今日销售额</div>
                    <div class="layui-card-body">
                        <div id="appendTodaySales"></div>

                    </div>
                </div>
            </div>
            <div class="layui-col-md3">
                <div class="layui-card">
                    <div class="layui-card-header">今日订单数</div>
                    <div class="layui-card-body">
                        <div id="appendTodayOrderCount"></div>
                    </div>
                </div>
            </div>
            <div class="layui-col-md3">
                <div class="layui-card">
                    <div class="layui-card-header">今日客单价</div>
                    <div class="layui-card-body">
                        <div id="appendTodayAveragePrice"></div>
                    </div>
                </div>
            </div>
            <div class="layui-col-md3">
                <div class="layui-card">
                    <div class="layui-card-header">不在线设备数</div>
                    <div class="layui-card-body">
                        <div id="appendInline"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div style="padding: 20px; background-color: #F2F2F2;">
        <div class="layui-row layui-col-space15">
            <div class="layui-col-md9">
                <fieldset class="layui-elem-field layui-field-title" style="margin-top: 20px;">
                    <legend>历史数据分析</legend>
                </fieldset>
                <div id="appendSales" >

                </div>
                <br>
                <div class="btn-group">
                    <button type="button" class="btn btn-default btn_all" id="yestoday">昨日</button>
                    <button type="button" class="btn btn-default btn_all" id="week">近7日</button>
                    <button type="button" class="btn btn-default btn_all" id="month">近30日</button>
                </div>
                <div class="layui-inline">
                    <input type="text" name="" class="layui-input" id="time" placeholder="请选择时间范围">
                </div>
                <button type="button" class="layui-btn" id="custom"> 查询</button>

                <div style="padding: 20px; background-color: #F2F2F2;">
                    <div class="layui-row layui-col-space15">
                        <div class="layui-col-md4">
                            <div class="layui-card">
                                <div class="layui-card-header">销售额</div>
                                <div class="layui-card-body">
                                    <div id="appendHistorySales" ></div>
                                </div>
                            </div>
                        </div>
                        <div class="layui-col-md4">
                            <div class="layui-card">
                                <div class="layui-card-header">订单数</div>
                                <div class="layui-card-body">
                                    <div id="appendHistoryOrderCount"></div>
                                </div>
                            </div>
                        </div>
                        <div class="layui-col-md4">
                            <div class="layui-card">
                                <div class="layui-card-header">客单价</div>
                                <div class="layui-card-body">
                                    <div id="appendHistoryAveragePrice"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="layui-col-md3" >
                <div class="layui-card">
                    <div class="layui-card-header">待处理事项：</div>
                    <div class="layui-card-body">
                        售后待处理订单：3件<br>
                        异常待处理订单：3件<br>
                        待处理订单：3件<br>
                        待支付订单：3件<br>
                        库存不足设备：3件<br>
                        公告信息：3件<br>
                        预警信息：3件<br>
                        用户反馈：3件<br>
                        保修信息：3件
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!--今日销售-->
<script type="text/html" id="tpl_todaySales">
    {{ d.currentSalesVolume }}元<br>
    与昨日同时段相比： {{ d.salesDifference }}元
</script>
<script type="text/html" id="tpl_todayOrderCount">
    {{ d.currentOrderCount }}单<br>
    与昨日同时段相比： {{ d.orderCountDifference }}单
</script>
<script type="text/html" id="tpl_todayAveragePrice">
    {{ d.currentAveragePrice }}元<br>
    与昨日同时段相比： {{ d.averagePriceDifference }}元
</script>
<!--历史销售-->
<script type="text/html" id="tpl_historySales">
    {{ d.currentSalesVolume }}元<br>
    与同时段相比： {{ d.salesDifference }}元
</script>
<script type="text/html" id="tpl_historyOrderCount">
    {{ d.currentOrderCount }}单<br>
    与同时段相比： {{ d.orderCountDifference }}单
</script>
<script type="text/html" id="tpl_historyAveragePrice">
    {{ d.currentAveragePrice }}元<br>
    与同时段相比： {{ d.averagePriceDifference }}元
</script>

<script type="text/html" id="tpl_inline">
    {{ d.notOnLineCount }}台<br>
    在线设备数： {{ d.onlineCount }}台
</script>

<script type="text/html" id="tpl_sales">
    累计销售额：{{ d.totalSalesVolume }}元 &ensp;&ensp;&ensp;  累计订单数：{{ d.totalOrderCount }}单 &ensp;&ensp;&ensp; 平均客单价：{{ d.averagePrice }}元
</script>





                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script src="/assets/js/require<?php echo \think\Config::get('app_debug')?'':'.min'; ?>.js" data-main="/assets/js/require-backend<?php echo \think\Config::get('app_debug')?'':'.min'; ?>.js?v=<?php echo htmlentities($site['version']); ?>"></script>
    </body>
</html>

<script>
    var tchost = 'https://tc.inleft.com';  //对接Java接口URL
    var myhost = 'https://admin.tc.inleft.com'; //本地接口
    var uploadUrl = 'https://tc.inleft.com/tcstore/tcFile/uploadFiles';
</script>