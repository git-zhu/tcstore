<?php

return array (
  0 => 
  array (
    'name' => 'wechat',
    'title' => '微信',
    'type' => 'array',
    'content' => 
    array (
    ),
    'value' => 
    array (
      'appid' => '',
      'app_id' => '',
      'app_secret' => '',
      'miniapp_id' => '',
      'mch_id' => '',
      'key' => '',
      'notify_url' => '/addons/epay/api/notifyx/type/wechat',
      'cert_client' => '/epay/certs/apiclient_cert.pem',
      'cert_key' => '/epay/certs/apiclient_key.pem',
      'log' => 1,
    ),
    'rule' => '',
    'msg' => '',
    'tip' => '微信参数配置',
    'ok' => '',
    'extend' => '',
  ),
  1 => 
  array (
    'name' => 'alipay',
    'title' => '支付宝',
    'type' => 'array',
    'content' => 
    array (
    ),
    'value' => 
    array (
      'app_id' => '1910221025267231',
      'notify_url' => '/addons/epay/api/notifyx/type/alipay',
      'return_url' => '/addons/epay/api/returnx/type/alipay',
      'ali_public_key' => 'bb33d0ccc056e224b75255939b5ca8b9ebe7f3ee',
      'private_key' => '1748f5f859231ba5bed74c4cbc887325',
      'log' => '1',
    ),
    'rule' => 'required',
    'msg' => '',
    'tip' => '支付宝参数配置',
    'ok' => '',
    'extend' => '',
  ),
  2 => 
  array (
    'name' => '__tips__',
    'title' => '温馨提示',
    'type' => 'array',
    'content' => 
    array (
    ),
    'value' => '请注意微信支付证书路径位于/addons/epay/certs目录下，请替换成你自己的证书<br>appid：APP的appid<br>app_id：公众号的appid<br>app_secret：公众号的secret<br>miniapp_id：小程序ID<br>mch_id：微信商户ID<br>key：微信商户支付的密钥',
    'rule' => '',
    'msg' => '',
    'tip' => '微信参数配置',
    'ok' => '',
    'extend' => '',
  ),
);
