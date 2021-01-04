<?php

namespace addons\epay\controller;

use addons\epay\library\QRCode;
use addons\epay\library\Service;
use addons\epay\library\Wechat;
use think\addons\Controller;
use think\Response;
use think\Session;
use Yansongda\Pay\Pay;

/**
 * API接口控制器
 *
 * @package addons\epay\controller
 */
class Api extends Controller
{

    protected $layout = 'default';
    protected $config = [];

    /**
     * 默认方法
     */
    public function index()
    {
        return;
    }

    /**
     * 外部提交
     */
    public function submit()
    {
        $this->request->filter('trim');
        $out_trade_no = $this->request->request("out_trade_no");
        $title = $this->request->request("title");
        $amount = $this->request->request('amount');
        $type = $this->request->request('type');
        $method = $this->request->request('method', 'web');
        $openid = $this->request->request('openid', '');
        $auth_code = $this->request->request('auth_code', '');
        $notifyurl = $this->request->request('notifyurl', '');
        $returnurl = $this->request->request('returnurl', '');

        if (!$amount || $amount < 0) {
            $this->error("支付金额必须大于0");
        }

        if (!$type || !in_array($type, ['alipay', 'wechat'])) {
            $this->error("支付类型错误");
        }

        $params = [
            'type'         => $type,
            'out_trade_no' => $out_trade_no,
            'title'        => $title,
            'amount'       => $amount,
            'method'       => $method,
            'openid'       => $openid,
            'auth_code'    => $auth_code,
            'notifyurl'    => $notifyurl,
            'returnurl'    => $returnurl,
        ];
        return Service::submitOrder($params);
    }

    /**
     * 微信支付
     * @return string
     */
    public function wechat()
    {
        $config = Service::getConfig('wechat');

        $isWechat = stripos($this->request->server('HTTP_USER_AGENT'), 'MicroMessenger') !== false;
        $isMobile = $this->request->isMobile();
        $this->view->assign("isWechat", $isWechat);
        $this->view->assign("isMobile", $isMobile);

        if ($isWechat) {
            //发起公众号(jsapi支付)
            $orderData = Session::get("wechatorderdata");
            $openid = Session::get('openid');
            //如果没有openid
            if (!$openid) {
                $wechat = new Wechat($config['app_id'], $config['app_secret']);
                $openid = $wechat->getOpenid();
            }

            $orderData['method'] = 'mp';
            $orderData['openid'] = $openid;
            $payData = Service::submitOrder($orderData);
            $payData = json_decode($payData, true);
            if (!isset($payData['appId'])) {
                $this->error("创建订单失败，请返回重试");
            }
            $type = 'jsapi';
            $this->view->assign("orderData", $orderData);
            $this->view->assign("payData", $payData);
        } else {
            //发起PC支付(Native支付)
            $body = $this->request->request("body");
            $code_url = $this->request->request("code_url");
            $out_trade_no = $this->request->request("out_trade_no");
            $return_url = $this->request->request("return_url");
            $total_fee = $this->request->request("total_fee");

            $sign = $this->request->request("sign");

            $data = [
                'body'         => $body,
                'code_url'     => $code_url,
                'out_trade_no' => $out_trade_no,
                'return_url'   => $return_url,
                'total_fee'    => $total_fee,
            ];
            if ($sign != md5(implode('', $data) . $config['appid'])) {
                $this->error("签名不正确");
            }

            if ($this->request->isAjax()) {
                $pay = Pay::wechat($config);
                $result = $pay->find($out_trade_no);
                if ($result['return_code'] == 'SUCCESS' && $result['result_code'] == 'SUCCESS') {
                    $this->success("", "", ['trade_state' => $result['trade_state']]);
                } else {
                    $this->error("查询失败");
                }
            }
            $data['sign'] = $sign;
            $type = 'pc';
            $this->view->assign("data", $data);
        }

        $this->view->assign("type", $type);
        $this->view->assign("title", "微信支付");
        return $this->view->fetch();
    }

    /**
     * 支付成功回调
     */
    public function notifyx()
    {
        $type = $this->request->param('type');
        if (!Service::checkNotify($type)) {
            echo '签名错误';
            return;
        }

        //你可以在这里你的业务处理逻辑,比如处理你的订单状态、给会员加余额等等功能
        //下面这句必须要执行,且在此之前不能有任何输出
        echo "success";
        return;
    }

    /**
     * 支付成功返回
     */
    public function returnx()
    {
        $type = $this->request->param('type');
        if (Service::checkReturn($type)) {
            echo '签名错误';
            return;
        }

        //你可以在这里定义你的提示信息,但切记不可在此编写逻辑
        $this->success("恭喜你！支付成功!", addon_url("epay/index/index"));

        return;
    }

    /**
     * 生成二维码
     * @return Response
     */
    public function qrcode()
    {
        $text = $this->request->get('text', 'hello world');

        $qr = QRCode::getMinimumQRCode($text, QR_ERROR_CORRECT_LEVEL_L);
        $im = $qr->createImage(8, 5);
        header("Content-type: image/png");
        imagepng($im);
        imagedestroy($im);
        return;
    }

}
