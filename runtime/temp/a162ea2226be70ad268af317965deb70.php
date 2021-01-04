<?php if (!defined('THINK_PATH')) exit(); /*a:4:{s:85:"/www/wwwroot/test.wfbest.top/public/../application/admin/view/order_refund/index.html";i:1607248288;s:71:"/www/wwwroot/test.wfbest.top/application/admin/view/layout/default.html";i:1608728870;s:68:"/www/wwwroot/test.wfbest.top/application/admin/view/common/meta.html";i:1583049507;s:70:"/www/wwwroot/test.wfbest.top/application/admin/view/common/script.html";i:1583049507;}*/ ?>
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
                                <div class="demoTable">
    <form class="layui-form">
        <div class="layui-form-item">
            <div class="layui-inline">
                <input type="text" name="id" id="id" value="" placeholder="请输入售后编号" class="layui-input">
            </div>
            <div class="layui-inline">
                <input type="text" name="deviceId" id="deviceId" value="" placeholder="请输入设备编号" class="layui-input">
            </div>
            <div class="layui-inline">
                <input type="text" name="orderId" id="orderId" value="" placeholder="请输入订单编号" class="layui-input">
            </div>
            <div class="layui-inline">
                <input type="text" name="userApplyTimeStart" class="layui-input" id="start_time" placeholder="请选择申退时间">
            </div>
            <div class="layui-inline">
                <select name="dealStatus" id="dealStatus" lay-filter="search" class="layui-input">
                    <option value="">请选择售后状态</option>
                    <option value="100">售后中</option>
                    <option value="110">售后退款中</option>
                    <option value="120">售后审核不通过</option>
                    <option value="130">系统退款失败</option>
                    <option value="140">退款成功(或部分退款)</option>
                </select>
            </div>
        </div>
    </form>
    <button type="button" class="layui-btn" data-type="reload">查询</button>
    <button class="layui-btn" id="reset">重置</button>




    <table id="demo" lay-filter="myfilter_test"></table>
    <table id="list" lay-filter="test" style="display: none"></table>
</div>

<script type="text/html" id="toolbarDemo">
    <div class="layui-btn-container">
        <button class="layui-btn layui-btn-sm" lay-event="out">导出</button>
    </div>
</script>


<script type="text/html" id="id_option">
    {{#  if(d.dealStatus ===100){ }}
    <a class="layui-btn layui-btn-xs layui-btn-normal" lay-event="audit" title="审核">审核</a>
    {{#  }else{ }}
    已审核
    {{#  } }}
</script>

<script type="text/html" id="id_dealStatus">
    {{#  if(d.dealStatus ===99){ }}
    无售后记录
    {{#  } if(d.dealStatus ===100){ }}
    售后中
    {{#  } if(d.dealStatus ===110){ }}
    售后退款中
    {{#  } if(d.dealStatus ===120){ }}
    售后审核不通过
    {{#  } if(d.dealStatus ===130){ }}
    系统退款失败
    {{#  } if(d.dealStatus ===140){ }}
    退款成功(或部分退款)
    {{#  } }}
</script>
<script type="text/html" id="id_goodsList">
    {{# layui.each(d.goodsList,function(index,item){ }}
    {{#  if(item!=null&& item.name!=null){  }}
    {{ item.name}};
    {{#  }else{ }}
    --
    {{#  } }}
    {{#  }); }}
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