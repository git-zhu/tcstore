<?php

namespace app\admin\controller;

use app\admin\model\AutoWithdrawalSettled;
use app\common\controller\Backend;
use think\Loader;
use think\Log;
use addons\epay\library\Service;
use app\common\model\User;
use think\addons\Controller;
use Exception;

/**
 *
 *
 * @icon fa fa-circle-o
 */
class AutoWithdrawal extends Backend
{
    /**
     * AutoWithdrawal模型对象
     * @var \app\admin\model\AutoWithdrawal
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\AutoWithdrawal;

    }

    /**
     * 默认生成的控制器所继承的父类中有index/add/edit/del/multi五个基础方法、destroy/restore/recyclebin三个回收站方法
     * 因此在当前控制器中可不用编写增删改查的代码,除非需要自己控制这部分逻辑
     * 需要将application/admin/library/traits/Backend.php中对应的方法复制到当前控制器,然后进行修改
     */


    /**
     * 查看
     */
    public function index()
    {
        $userid =$this->auth->userid;
        //当前是否为关联查询
        $this->relationSearch = true;
        //设置过滤方法
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax())
        {
            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField'))
            {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            $auth = $this->auth->is_super;
            if($auth ==1){
                $total = $this->model
                    ->with(['administrator'])
                    ->where($where)
                    ->order($sort, $order)
                    ->count();

                $list = $this->model
                    ->with(['administrator'])
                    ->where($where)
                    ->order($sort, $order)
                    ->limit($offset, $limit)
                    ->select();
            }
            if($auth ==2){
                $Administrator = new \app\admin\model\Administrator();
                $get_id = $Administrator->where('belong',$userid)->column('user_id');
                $total = $this->model
                    ->with(['administrator'])
                    ->where($where)
                    ->where('administrator_id','IN',$get_id)
                    ->order($sort, $order)
                    ->count();

                $list = $this->model
                    ->with(['administrator'])
                    ->where($where)
                    ->where('administrator_id','IN',$get_id)
                    ->order($sort, $order)
                    ->limit($offset, $limit)
                    ->select();
            }if($auth==0){
                $total = $this->model
                    ->with(['administrator'])
                    ->where($where)
                    ->where('administrator_id ='.$userid)
                    ->order($sort, $order)
                    ->count();

                $list = $this->model
                    ->with(['administrator'])
                    ->where($where)
                    ->where('administrator_id ='.$userid)
                    ->order($sort, $order)
                    ->limit($offset, $limit)
                    ->select();
            }

            foreach ($list as $row) {
                $row->visible(['id','wo_id','administrator_id','name','account','type','status','amount','money','fee','create_time','update_time']);
                $row->visible(['administrator']);
                $row->getRelation('administrator')->visible(['name']);
            }
            $list = collection($list)->toArray();
            $result = array("total" => $total, "rows" => $list);

            return json($result);
        }

        //待结算微信和支付宝结算金额部分
        $Order_info = new \app\admin\model\OrderInfo();
        //微信待结算金额
        $get_wx_money = $Order_info
            ->where('administrator_id',$userid)
            ->where('order_status',70)
            ->where('pay_way',0)
            ->where('settled',0)
            ->field('sum(order_money) as order_money')
            ->find();
        $get_wx_money['order_money'] = round($get_wx_money['order_money'],2);
        //支付宝待结算金额
        $get_ali_money = $Order_info
            ->where('administrator_id',$userid)
            ->where('order_status',70)
            ->where('pay_way',1)
            ->where('settled',0)
            ->field('sum(order_money) as order_money')
            ->find();
        $get_ali_money['order_money'] = round($get_ali_money['order_money'],2);

        //已结算微信支付宝金额部分
        $Auto_settled = new AutoWithdrawalSettled();
        //已结算微信
        $wx_count = $Auto_settled->where('administrator_id',$userid)
            ->where('type',0)
            ->where('status',1)
            ->field('SUM(count) as count')
            ->find();
        //已结算支付宝
        $ali_count = $Auto_settled->where('administrator_id',$userid)
            ->where('type',1)
            ->where('status',1)
            ->field('SUM(count) as count')
            ->find();

        //已提现微信支付宝金额部分
        $Auto_withdrawal = new \app\admin\model\AutoWithdrawal();
        //已提现微信
        $wx_withdrawal = $Auto_withdrawal->where('administrator_id',$userid)
            ->where('type',0)
            ->where('status',1)
            ->field('SUM(money) as count')
            ->find();
        //已提现支付宝
        $ali_withdrawal = $Auto_withdrawal->where('administrator_id',$userid)
            ->where('type',1)
            ->where('status',1)
            ->field('SUM(money) as count')
            ->find();

        //可提现部分
        $wx_remain = $wx_count['count']-$wx_withdrawal['count'];
        $ali_remain = $ali_count['count']-$ali_withdrawal['count'];

        $this->assign('wx_money',$get_wx_money['order_money']);  //待结算金额
        $this->assign('ali_money',$get_ali_money['order_money']);

        $this->assign('wx_count',$wx_count['count']);  //已结算金额
        $this->assign('ali_count',$ali_count['count']);

        $this->assign('wx_withdrawal',$wx_withdrawal['count']); //已提现金额
        $this->assign('ali_withdrawal',$ali_withdrawal['count']);

        $this->assign('wx_remain',$wx_remain); //可提现金额
        $this->assign('ali_remain',$ali_remain);

        return $this->view->fetch();
    }

    /**
     * 结算
     * @param null $pay_way
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\exception\DbException
     */
    public function count($pay_way =NULL)
    {
        if($this->request->isPost()){
            $userid = $this->auth->userid;
            $Auto_Settled = new AutoWithdrawalSettled();
            $Order_info = new \app\admin\model\OrderInfo();

            //待提现金额
            $get_money = $Order_info
                ->where('administrator_id',$userid)
                ->where('order_status',70)
                ->where('pay_way',$pay_way)
                ->where('settled',0)
                ->field('sum(order_money) as order_money')
                ->find();
            $get_money = round($get_money['order_money'],2);
            if($get_money ==0){
                $this->error('结算必须大于0元!');
            }

            //生成结算单
            $info = array();
            $info['wo_id'] = time().rand(10000,99999);
            $info['administrator_id'] = $userid;
            $info['type'] = $pay_way;
            $info['status'] = 1;  //结算全部为成功状态
            $info['count'] = $get_money; //申请金额
            $info['create_time'] = date('Y-m-d H:i:s');
            $res = $Auto_Settled->save($info); //生成结算单

            //订单信息改为已提现状态
            $change_settled = $Order_info
                ->where('administrator_id',$userid)
                ->where('order_status',70)
                ->where('pay_way',$pay_way)
                ->where('settled',0)
                ->setField('settled',1);
            if(($res ==1)&&($change_settled ==1)){
                $this->success('结算成功！');
            }else{
                $this->error('结算失败！');
            }
        }


    }

    /**
     * 获取微信提现信息
     * @return string
     * @throws \think\Exception
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\exception\DbException
     */
    public function get_wx_money()
    {
        $userid =$this->auth->userid;
        //获取提现人信息
        $Admin = new \app\admin\model\Administrator();
        $Admin_User = new \app\admin\model\AdminUser();
        $admin = $Admin->where('user_id',$userid)->find();
        //$admin['phone'] =13600395024; //测试号码
        $open_id = $Admin_User->where('phone',$admin['phone'])
            ->where('wx_service_status',1)->find();

        //已结算金额
        $Auto_Settled = new AutoWithdrawalSettled();
        $counted_money = $Auto_Settled
            ->where('administrator_id',$userid)
            ->where('type',0) //微信结算类型
            ->where('status',1)
            ->field('sum(count) as counted_money')
            ->find();

        //已提现总额
        $Auto_withdrawal = new \app\admin\model\AutoWithdrawal();
        $withdrawaled_money = $Auto_withdrawal
            ->where('administrator_id',$userid)
            ->where('type',0)
            ->where('status',1)
            ->field('sum(money) as withdrawaled_money')
            ->find();
        //可提现总额
        $count = $counted_money['counted_money']-$withdrawaled_money['withdrawaled_money'];


        $this->assign('count',$count); //可提现总额
        $this->assign('phone',$admin['phone']);
        $this->assign('name',$admin['name']);
        $this->assign('forbidden',$admin['forbidden']);
        $this->assign('open_id',$open_id['open_id']);

        return $this->view->fetch();

    }

    /**
     * 执行微信提现
     */
    public function do_get_wx_money()
    {
        $userid = $this->auth->userid;
        if($this->request->isPost()){
            $money  = input('withdrawal_money');  //申请提现金额

            //已结算金额
            $Auto_Settled = new AutoWithdrawalSettled();
            $counted_money = $Auto_Settled
                ->where('administrator_id',$userid)
                ->where('type',0) //微信结算类型
                ->where('status',1)
                ->field('sum(count) as counted_money')
                ->find();

            //已提现总额
            $Auto_withdrawal = new \app\admin\model\AutoWithdrawal();
            $withdrawaled_money = $Auto_withdrawal
                ->where('administrator_id',$userid)
                ->where('type',0)
                ->where('status',1)
                ->field('sum(money) as withdrawaled_money')
                ->find();
            //可提现总额
            $count = $counted_money['counted_money']-$withdrawaled_money['withdrawaled_money'];


            $forbidden = input('forbidden'); //账号状态
            $open_id = input('open_id');  //微信open_id
            //$open_id = 'oMh4O5JUlBD_ytqMRxxazU5Mk_YU';
            $name = input('name');
            $phone = input('phone');

            if($forbidden ==0){
                if(round($money,2)>round($count,2)){
                    $this->error('提现金额已超过可提现金额！');
                }
                elseif($money >5000){
                    $this->error('提现金额已超过单笔单日5000元限制！');
                }elseif ($money ==0){
                    $this->error('提现金额必须大于0！');
                }
                else{
                    $Auto_withdrawal = new \app\admin\model\AutoWithdrawal();

                    //生成提现订单
                    $info = array();
                    $info['wo_id'] = time().rand(10000,99999);
                    $info['administrator_id'] = $userid;
                    $info['name'] = $name;
                    $info['account'] = $phone;
                    $info['type'] = 0;
                    $info['status'] = 0;
                    $info['money'] = $money; //申请金额
                    $info['fee'] = $money*0.006; //千分之6手续费
                    $temp = $money-$info['fee'];
                    $info['amount'] = round($temp,2); //到账金额
                    $info['create_time'] = date('Y-m-d H:i:s');
                    $res = $Auto_withdrawal->save($info); //生成提现单
                    if($res ==1){

                        $rs = $this->sendMoney($info['amount'],$open_id,'商户提现'); //调用微信企业打款方法

                        $log = json_encode($rs,JSON_UNESCAPED_UNICODE); //日志记录+
                        $result = $rs['result_code'];
                        if($result =='SUCCESS'){
                            $update_time = date('Y-m-d H:i:s');
                            $rd = $Auto_withdrawal->where('wo_id',$info['wo_id'])->setField(['update_time' => $update_time,'status' => 1,'json' =>  $log]);
                            $this->success('提现成功!','',6);
                        }else{
                            $err_code = $rs['err_code'];
                            $err_code_des = $rs['err_code_des'];
                            $rd = $Auto_withdrawal->where('wo_id',$info['wo_id'])->setField(['status' => 2,'json' =>  $log]);
                            $this->error($err_code_des.'错误码：'.$err_code,'',6);
                        }
                    }

                }
            }elseif($forbidden ==1){
                $this->error('账号已被禁用，无法提现！');
            }
            $money = 0.01;
            //$this->sendMoney($money,'oMh4O5JUlBD_ytqMRxxazU5Mk_YU','商户提现');
        }else{
            $this->error('无效的请求！');
        }


    }

    /**
     * 支付宝提现页面
     * @return string
     * @throws \think\Exception
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\exception\DbException
     */
    public function get_ali_money()
    {
        $userid =$this->auth->userid;
        //获取提现人信息
        $Admin = new \app\admin\model\Administrator();
        $Admin_User = new \app\admin\model\AdminUser();
        $admin = $Admin->where('user_id',$userid)->find();
        //$admin['phone'] =13600395024; //测试号码

        //已结算金额
        $Auto_Settled = new AutoWithdrawalSettled();
        $counted_money = $Auto_Settled
            ->where('administrator_id',$userid)
            ->where('type',1) //支付宝结算类型
            ->where('status',1)
            ->field('sum(count) as counted_money')
            ->find();

        //已提现总额
        $Auto_withdrawal = new \app\admin\model\AutoWithdrawal();
        $withdrawaled_money = $Auto_withdrawal
            ->where('administrator_id',$userid)
            ->where('type',1)
            ->where('status',1)
            ->field('sum(money) as withdrawaled_money')
            ->find();
        //可提现总额
        $count = $counted_money['counted_money']-$withdrawaled_money['withdrawaled_money'];


        $this->assign('count',$count); //可提现总额
        $this->assign('ali_account',$admin['ali_account']);
        $this->assign('ali_account_name',$admin['ali_account_name']);
        $this->assign('forbidden',$admin['forbidden']);

        return $this->view->fetch();

    }

    /**
     * 执行支付宝提现
     * @throws Exception
     */
    public function do_get_ali_money()
    {

        $userid = $this->auth->userid;
        if($this->request->isPost()){
            $money  = input('withdrawal_money');  //申请提现金额
            //$money =1;
            //已结算金额
            $Auto_Settled = new AutoWithdrawalSettled();
            $counted_money = $Auto_Settled
                ->where('administrator_id',$userid)
                ->where('type',1) //支付宝结算类型
                ->where('status',1)
                ->field('sum(count) as counted_money')
                ->find();

            //已提现总额
            $Auto_withdrawal = new \app\admin\model\AutoWithdrawal();
            $withdrawaled_money = $Auto_withdrawal
                ->where('administrator_id',$userid)
                ->where('type',1)
                ->where('status',1)
                ->field('sum(money) as withdrawaled_money')
                ->find();
            //可提现总额
            $count = $counted_money['counted_money']-$withdrawaled_money['withdrawaled_money'];
            //$count  = 1; //可提现金额
            $forbidden = input('forbidden'); //账号状态
            $name = input('ali_account_name'); //支付宝账号名称
            //$ali_account = 13600395024; //支付宝账号
            $ali_account = input('ali_account'); //支付宝账号

            if($forbidden ==0){
                if(round($money,2)>round($count,2)){
                    $this->error('提现金额已超过可提现金额！');
                }
                elseif($money >5000){
                    $this->error('提现金额已超过单笔单日5000元限制！');
                }elseif ($money ==0){
                    $this->error('提现金额必须大于0！');
                }
                else{
                    $Auto_withdrawal = new \app\admin\model\AutoWithdrawal();

                    //生成提现订单
                    $info = array();
                    $info['wo_id'] = time().rand(10000,99999);
                    $info['administrator_id'] = $userid;
                    $info['name'] = $name;
                    $info['account'] = $ali_account;
                    $info['type'] = 1;
                    $info['status'] = 0;
                    $info['money'] = $money; //申请金额
                    $info['fee'] = $money*0.006; //千分之6手续费
                    $temp = $money-$info['fee']; //到账金额
                    $info['amount'] = round($temp,2); //到账金额
                    $info['create_time'] = date('Y-m-d H:i:s');
                    $res = $Auto_withdrawal->save($info); //生成提现单
                    if($res ==1){
                        $rs = $this->ali_send_money($info['wo_id'],$info['account'],$info['amount']);
                        $res = json_decode($rs,JSON_UNESCAPED_UNICODE);
                        if($res['code'] ==10000){
                            $update_time = date('Y-m-d H:i:s');
                            $rd = $Auto_withdrawal->where('wo_id',$info['wo_id'])->setField(['update_time' => $update_time,'status' => 1,'json' =>  $rs]);
                            $this->success('提现成功！');
                        }else{
                            $msg = $res['sub_msg'];
                            $msg_code = $res['msg'];
                            $rd = $Auto_withdrawal->where('wo_id',$info['wo_id'])->setField(['status' => 2,'json' =>  $rs]);
                            $this->error('提现失败！'.$msg.'错误码：'.$msg_code,'',6);

                        }

                    }

                }
            }elseif($forbidden ==1){
                $this->error('账号已被禁用，无法提现！');
            }
        }else{
            $this->error('无效的请求！');
        }


    }

    /**
     * 支付宝转账到商户
     * @param null $out_trade_no
     * @param null $ali_account
     * @param null $money
     * @return array
     * @throws Exception
     */
    public function ali_send_money($out_trade_no =null,$ali_account=null,$money=null)
    {
        /*        $out_trade_no = time().rand(10000,99999);//订单号
                $ali_account = 13600395024;
                $money = 0.1;*/  //测试数据
        Vendor('aop.AopClient');
        Vendor('aop.request.AlipayFundTransToaccountTransferRequest');

        $aop = new \AopClient ();
        $aop->gatewayUrl = 'https://openapi.alipay.com/gateway.do';//支付宝网关
        $aop->appId = '2019091567415356';
        $aop->rsaPrivateKey = 'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDMeySFcH2EHztpPfTkkhLMSfSgFVB32Ubb2LZDIlRlpEGEq3H8MHQjvfcT3RHLAs7Ha+Tc4RxfdE3o+J3/Cawvjwoew5lnHCuw6LBz6NnumQA7dNm1KXk6+tFVc3WTnf0jGuDDOklvx7ORbSEQwvRcIe85viy73hLDurqDYh7XlfQkZxP7k/9wcxbI1u+Bm62ROWMfrJwh37L7BVK8Ns5xlFXQibhtf1N71kA2z58WdY4KncAA4WOvB2zwLdQsCuc2SZNuN3eN7CiOmWhEFLDg7+Immoc3Dw7mbwQU7ZdNRn8eVJPlZCjmW3n9NR2PomP8Hn0LgmQ8u794f7OxKJJtAgMBAAECggEACTKw3d/FhZ/yCDXlQjLf7ZiWDG1pBTsc2N7StApjSX8uA03C/tkfIEx3RMl492zU6FuOG/F0WUbeClDEqqhAupLwnZmm2OCHhpmw9kXPJ9ByFjqXYHLRJToLGJDtBQriTCX1XlLM4t5U0YHbLunWHB7ap/pKANlodq17nlVXldLwYwRpqlkx/ApPDp1+ThsIOfafdC3pGCrO6b3+rFlmTA9BjenvIXOCXTvtnO5lg5BLCjjFn5MLcheuN6fHhbKNHMQTyyZUo5+a9HO5e7PNmNa9iQppVOMxdMaqsQT3Q+p7UzV18yOTmJApQW5AKqSs/C4YPyOn4IFmgZuKaffEgQKBgQDt9CHsec6qdt3Zk25k9naL4FJWjba2GcQc4B1G0hF8mJyiW2MGVSVcvutNqO/ja/QUMPi4emYQTrkfVw93uatLkFqe3/k/AWHgQ1n3EDVshBP7W9FHXhRQ/e/qXt6zg9a69wcAeHSxSiG0wHPgl46IiYuUZEsa9GPtgjf/JGxABQKBgQDb/SO/wW+BrSO7kLb2mwHYqQNouRfUItzLjMJ/CFv4zFP1AYbSc9Lb7VkoqrQZ+eSX2gIiPdOjhCjDD72FTmp6tXYHCFPGcnemExdUExvw8SZgYpWijpmgYsEk2o9i14bB7C9BZdsVTAIJLjV2jV3gPHduRwHhD/XzvdS6q87dSQKBgBkyrRT5oST0CXIs5pfScaNGUfHQd/S4rcfRA8ioHinvj0ayHr5g7d/wZ8KFjUGsAODSfsQqUfyQGZJ0CbNH+he6ZZ5FYYOGhfLVrwU2tjGTmvoXMwY3tDcPbQSIn1SrNWX/GsK1/sV3cDJP3vV9lx5mUl2YcUudbaeNDpj6JmxxAoGBAM9vShdVqfRoM4p4sd2lWj9XV4yXA94XpYUWTIwGcNsQqJYdg2jMqGaSzwCmvj7EQQXjHyH0lKzaQKl2HSonQAZHN2z4MC6u3x2tYND5V96BNcOrEhf/SONQW3mJ0azNOBeBwylyhvv0+PJ5LRaFxKBdw+wrbp0vNKdKN95xhRVpAoGBALFY1QMAG3s5glnYAUne56/TMPun1PgjrPoBcHY5dMaxrposM5sPgj1w5uGKIk6tJOotL8og1wkyMEcZm6eIxxUXYi036aOC0bE8izdNAcVmDDNz+BJdjG+EbwomtwlenCCDA60JDpdE8JsRe8lEXQAOVB/5v1bCPaMvNlhYFV4N';
        $aop->apiVersion = '1.0';
        $aop->signType = 'RSA2';
        $aop->postCharset = 'utf-8';
        $aop->format = 'json';
        $request = new \AlipayFundTransToaccountTransferRequest ();
        $request->setBizContent("{" .
            "\"out_biz_no\":\"" . $out_trade_no . "\"," .
            "\"payee_type\":\"ALIPAY_LOGONID\"," .
            "\"payee_account\":\"" . $ali_account . "\"," .
            "\"amount\":\"" . $money  . "\"," .
            "\"payer_show_name\":\"来米零售\"," .
            "\"payee_real_name\":\"\"," .
            "\"remark\":\"商户提现\"" .
            "}");
        $result=$aop->execute($request);
        $responseNode=str_replace(".","_",$request->getApiMethodName())."_response";
        //halt($responseNode); //alipay_fund_trans_toaccount_transfer_response
        $resultCode=$result->$responseNode->code;
        //halt($resultCode); //40006
        if (!empty($resultCode) && $resultCode == 10000) {
            $rs=[];
            $rs['code'] =$result->$responseNode->code;
            $rs['msg']  =$result->$responseNode->msg;
            $rs['order_id']=$result->$responseNode->order_id;
            $rs['out_biz_no']=$result->$responseNode->out_biz_no;
            $rs['pay_date']=$result->$responseNode->pay_date;
            $rs = json_encode($rs,JSON_UNESCAPED_UNICODE);
            return $rs;
            //下发成功逻辑处理
        } else {
            $rd =[];
            $rd['code'] =$result->$responseNode->code;
            $rd['msg'] =$result->$responseNode->msg; //英文错误信息
            $rd['sub_code'] =$result->$responseNode->sub_code;
            $rd['sub_msg'] =$result->$responseNode->sub_msg; //错误信息
            $rd = json_encode($rd,JSON_UNESCAPED_UNICODE);
            return $rd;

            //下发失败
        }

    }
    /**
     * 微信企业付款到零钱
     * @param $amount
     * @param $re_openid
     * @param string $desc
     * @param string $check_name
     * @return \SimpleXMLElement
     */
    public function sendMoney($amount,$re_openid,$desc='销售提现',$check_name='zhu'){
        $total_amount = (100) * $amount;
        $data=array(
            'mch_appid'=> 'wx359088b91a7c2890',//商户账号appid
            'mchid'=> '1556138841',//商户号
            'nonce_str'=> $this->createNoncestr(),//随机字符串
            'partner_trade_no'=> date('YmdHis').rand(1000, 9999),//商户订单号
            'openid'=> $re_openid,//用户openid
            'check_name'=>'NO_CHECK',//校验用户姓名选项,
            're_user_name'=> $check_name,//收款用户姓名
            'amount'=>$total_amount,//金额
            'desc'=> $desc,//企业付款描述信息
            'spbill_create_ip'=> '121.40.234.228',//Ip地址
        );
        $secrect_key = 'dlkj26354655GHKJH09jklj09HLH0jkl';//API密码
        $data = array_filter($data);
        ksort($data);
        $str ='';
        foreach($data as $k=>$v) {
            $str.=$k.'='.$v.'&';
        }
        $str.='key='.$secrect_key;
        $data['sign'] = md5($str);
        $xml = $this->arraytoxml($data);
        $url='https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers'; //调用接口
        $res = $this->wx_curl($xml,$url);
        $return = $this->xmltoarray($res);
        $responseObj = simplexml_load_string($res, 'SimpleXMLElement', LIBXML_NOCDATA);
        //echo $res= $responseObj->return_code;  //SUCCESS  如果返回来SUCCESS,则发生成功，处理自己的逻辑
        $res= $responseObj->return_code;  //SUCCESS  如果返回来SUCCESS,则发生成功，处理自己的逻辑
        if($res =="SUCCESS"){
            return $return;
        }else{
            $this->error('与微信支付通信失败！');
        }
    }

    /**
     * 生成随机字符串
     * @param int $length
     * @return string
     */
    public function createNoncestr($length =32){
        $chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        $str ="";
        for ( $i = 0; $i < $length; $i++ )  {
            $str.= substr($chars, mt_rand(0, strlen($chars)-1), 1);
        }
        return $str;
    }

    /**
     * 数组转xml
     * @param $data
     * @return string
     */
    public function arraytoxml($data){
        $str='<xml>';
        foreach($data as $k=>$v) {
            $str.='<'.$k.'>'.$v.'</'.$k.'>';
        }
        $str.='</xml>';
        return $str;
    }

    /**
     * xml转数组
     * @param $xml
     * @return mixed
     */
    public function xmltoarray($xml) {
        //禁止引用外部xml实体
        libxml_disable_entity_loader(true);
        $xmlstring = simplexml_load_string($xml, 'SimpleXMLElement', LIBXML_NOCDATA);
        $val = json_decode(json_encode($xmlstring),true);
        return $val;
    }

    /**
     * curl发送post数据
     * @param $vars
     * @param $url
     * @param int $second
     * @param array $aHeader
     * @return bool|string
     */
    public function wx_curl($vars,$url,$second = 30, $aHeader = array())
    {
        $isdir = ROOT_PATH."cert/";//证书位置
        $ch = curl_init();//初始化curl
        curl_setopt($ch, CURLOPT_TIMEOUT, $second);//设置执行最长秒数
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);//要求结果为字符串且输出到屏幕上
        curl_setopt($ch, CURLOPT_URL, $url);//抓取指定网页
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);// 终止从服务端进行验证
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);//
        curl_setopt($ch, CURLOPT_SSLCERTTYPE, 'PEM');//证书类型
        curl_setopt($ch, CURLOPT_SSLCERT, $isdir . 'apiclient_cert.pem');//证书位置
        curl_setopt($ch, CURLOPT_SSLKEYTYPE, 'PEM');//CURLOPT_SSLKEY中规定的私钥的加密类型
        curl_setopt($ch, CURLOPT_SSLKEY, $isdir . 'apiclient_key.pem');//证书位置
        if (count($aHeader) >= 1) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, $aHeader);//设置头部
        }
        curl_setopt($ch, CURLOPT_POST, 1);//post提交方式
        curl_setopt($ch, CURLOPT_POSTFIELDS, $vars);//全部数据使用HTTP协议中的"POST"操作来发送

        $data = curl_exec($ch);//执行回话
        if ($data) {
            curl_close($ch);
            return $data;
        } else {
            $error = curl_errno($ch);
            echo "call faild, errorCode:$error\n";
            curl_close($ch);
            return false;
        }

    }


}
