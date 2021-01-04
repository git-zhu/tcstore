<?php if (!defined('THINK_PATH')) exit(); /*a:4:{s:86:"/www/wwwroot/test.wfbest.top/public/../application/admin/view/tc_order_info/index.html";i:1608032598;s:71:"/www/wwwroot/test.wfbest.top/application/admin/view/layout/default.html";i:1608728870;s:68:"/www/wwwroot/test.wfbest.top/application/admin/view/common/meta.html";i:1583049507;s:70:"/www/wwwroot/test.wfbest.top/application/admin/view/common/script.html";i:1583049507;}*/ ?>
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
    <from class="layui-form">
        <div class="layui-form-item">
            <div class="layui-inline">
                <div class="layui-inline">
                    <select name="orderStatus" id="orderStatus" lay-filter="search">
                        <option value="">请选择订单状态</option>
                        <option value="0">订单已创建</option>
                        <option value="10">进行中</option>
                        <option value="20">识别中</option>
                        <option value="30">识别异常</option>
                        <option value="40">支付中</option>
                        <option value="50">扣款轮询中</option>
                        <option value="60">支付失败</option>
                        <option value="70">已支付</option>
                        <option value="80">已取消</option>
                        <option value="80">已取消</option>
                        <option value="90">开门失败，订单取消</option>
                    </select>
                </div>
                <div class="layui-inline">
                    <select name="refundStatus" id="refundStatus" lay-filter="search">
                        <option value="">请选择售后状态</option>
                        <option value="99">无售后记录</option>
                        <option value="100">售后中</option>
                        <option value="110">售后退款中</option>
                        <option value="120">售后审核不通过</option>
                        <option value="130">系统退款失败</option>
                        <option value="140">退款成功(或部分退款)</option>
                    </select>
                </div>
                <div class="layui-inline">
                    <select name="payWay" id="payWay" lay-filter="search">
                        <option value="">请选择支付状态</option>
                        <option value="0">微信</option>
                        <option value="1">支付宝</option>
                    </select>
                </div>
                <div class="layui-inline">
                    <select name="isDiscount" id="isDiscount" lay-filter="search">
                        <option value="">请选择优惠状态</option>
                        <option value="1">有</option>
                        <option value="0">无</option>
                    </select>
                </div>
            </div>
            <div class="layui-inline">
                <input type="text" name="orderId" id="orderId" value="" placeholder="请输入订单编号" class="layui-input">
            </div>
            <div class="layui-inline">
                <input type="text" name="deviceId" id="deviceId" value="" placeholder="请输入设备编号" class="layui-input">
            </div>
            <div class="layui-inline">
                <input type="text" name="deviceNameLike" id="deviceNameLike" value="" placeholder="请输入设备名称"
                       class="layui-input">
            </div>
            <div class="layui-inline">
                <input type="text" name="phone" id="phone" value="" placeholder="请输入手机号码" class="layui-input">
            </div>
            <div class="layui-inline">
                <input type="text" name="start_time" class="layui-input" id="start_time" placeholder="请选择订单创建时间始">
            </div>
            <div class="layui-inline">
                至
            </div>
            <div class="layui-inline">
                <input type="text" name="start_time" class="layui-input" id="end_time" placeholder="请选择订单创建时间末">
            </div>
        </div>
    </from>
    <button class="layui-btn" data-type="reload">查询</button>
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
    <a class="layui-btn layui-btn-xs layui-btn-normal" lay-event="detail" title="查看详情">查看详情</a>
</script>
<script type="text/html" id="id_deviceList">
    {{# layui.each(d.deviceList,function(index,item){ }}
    {{ item.deviceId}}；
    {{#  }); }}
    {{# if(d.deviceList.length >2){ }}
    <a class="layui-btn layui-btn-xs layui-btn-normal" lay-event="device" title="设备列表">查看</a>
    {{#  } }}
</script>
<script type="text/html" id="id_payWay">
    {{#  if(d.payWay ===0){ }}
    <p style="color: green">微信</p>
    {{#  } if(d.payWay ===1){ }}
    <p style="color: blue">支付宝</p>
    {{#  } }}
</script>
<script type="text/html" id="id_orderDetailList">
    {{# layui.each(d.orderDetailList,function(index,item){ }}
    {{ item.goodsName}} * {{ item.buyCount }};
    {{#  }); }}
    {{# if((d.orderDetailList.length ===0)&&(d.orderStatus ===70)){ }}
    未购买商品
    {{# }else if((d.orderDetailList.length ===0)&&(d.orderStatus !=70)){ }}
    --
    {{#  } }}
</script>
<script type="text/html" id="tpl_payTime">
    {{# if(d.payTime ==null){ }}
    --
    {{# }else{ }}
    {{ d.payTime }}
    {{#  } }}
</script>
<script type="text/html" id="id_orderStatus">
    {{#  if(d.orderStatus ===0){ }}
    订单已创建
    {{#  }else if(d.orderStatus ===10){ }}
    进行中
    {{#  }else if(d.orderStatus ===20){ }}
    识别中
    {{#  }else if(d.orderStatus ===30){ }}
    识别异常
    {{#  }else if(d.orderStatus ===40){ }}
    支付中
    {{#  }else if(d.orderStatus ===50){ }}
    扣款轮询中
    {{#  }else if(d.orderStatus ===60){ }}
    支付失败
    {{#  }else if(d.orderStatus ===70){ }}
    已支付
    {{#  }else if(d.orderStatus ===80){ }}
    已取消
    {{#  }else if(d.orderStatus ===90){ }}
    开门失败，订单取消
    {{#  }else{ }}
    未知
    {{#  } }}
</script>

<script type="text/html" id="id_refundStatus">
    {{#  if(d.refundStatus ===99){ }}
    无售后记录
    {{#  }else if(d.refundStatus ===100){ }}
    售后中
    {{#  }else if(d.refundStatus ===110){ }}
    售后退款中
    {{#  }else if(d.refundStatus ===120){ }}
    售后审核不通过
    {{#  }else if(d.refundStatus ===130){ }}
    系统退款失败
    {{#  }else if(d.refundStatus ===140){ }}
    退款成功(或部分退款)
    {{# }else{ }}
    未知
    {{#  } }}
</script>
<script type="text/html" id="id_isDiscount">
    {{#  if(d.isDiscount ===0){ }}
    否
    {{#  } else if(d.isDiscount ===1){ }}
    是
    {{#  } }}
</script>
<script type="text/html" id="id_phone">
    {{#  if(d.phone.length==0){ }}
    --
    {{#  } else{ }}
    {{ d.phone }}
    {{#  } }}
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