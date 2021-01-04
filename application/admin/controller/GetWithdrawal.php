<?php


namespace app\admin\controller;


use app\common\controller\Backend;
use app\admin\model\Withdrawal;
use app\admin\model\OrderInfo;
use app\admin\model\Administrator;
/**
 *
 *申请提现
 * @icon fa fa-circle-o
 */
class GetWithdrawal extends Backend
{
    public function index()
    {
        $witModel = new Withdrawal();
        $ordModel = new OrderInfo();
        $userid = $this->auth->userid;
        $get_money = $witModel->where('status = 1 and administrator_id='.$userid)
            ->field('sum(total_amount) as total_amount,sum(wx_amount) as wx_amount,sum(ali_amount) as ali_amount')
            ->find();
        //halt($get_money);

        $get_money_array = $ordModel
            ->where('administrator_id ='.$userid)
            ->where('order_status',2)
            ->where('settled',0)
            ->field('pay_way,sum(order_money) as order_money')
            ->group('pay_way')
            ->select();
        $get_money_array = collection($get_money_array)->toArray();

        $get_money['wx'] = 0;
        $get_money['ali'] = 0;
        if(empty($get_money_array)){
            $get_money['wx'] = 0;
            $get_money['ali'] = 0;

        }else{
            foreach($get_money_array as $k=>$v){
                if($v['pay_way'] == 0)
                {
                    $get_money['wx'] = $v['order_money'];
                }
                if($v['pay_way'] == 1){
                    $get_money['ali'] = $v['order_money'];
                }
            }

        }
        $get_money['use_amount'] = round(($get_money['wx'] + $get_money['ali']),2);
        //halt($get_money);
        $get_money['total_amount'] = round($get_money['total_amount'],2);
        $get_money['wx_amount'] = round($get_money['wx_amount'],2);
        $get_money['ali_amount'] = round($get_money['ali_amount'],2);
        //halt($get_money);

        $this->assign('info',$get_money);
        return $this->view->fetch();

    }

    /**
     * 提现页面
     */
    public function get_money(){
        $admModel = new Administrator();
        $ordModel = new OrderInfo();


        $userid = $this->auth->userid;
        $get_money = $ordModel
            ->where('administrator_id ='.$userid)
            ->where('order_status',2)
            ->where('settled',0)
            ->field('sum(order_money) as order_money')
            ->find();
        $get_money['order_money'] = round($get_money['order_money'],2);

        if($this->auth->is_super ==1){
            $admin = $admModel
                    ->find();
        }else{
            $admin = $admModel
                ->where('user_id='.$userid)
                ->find();
        }

        $info = $get_money;
        $this->assign('admin',$admin);
        $this->assign('info', $info);
        return $this->view->fetch();

    }
    /**
     * 发起提现
     */
    public function do_get_money(){

        $ordModel = new OrderInfo();
        $witModel = new Withdrawal();
        $admModel = new Administrator();
        $where = array();
        $userid = $this->auth->userid;
        $uid = $this->auth->is_super;
        $get_money_array = $ordModel
            ->where('administrator_id ='.$userid)
            ->where('order_status',2)
            ->where('settled',0)
            ->group('pay_way')
            ->field('pay_way,sum(order_money) as order_money')
            ->select();
        $get_money['wx'] = 0;
        $get_money['ali'] = 0;
        $info['wx_amount'] =0;
        $info['ali_amount'] =0;
        if(empty($get_money_array)){
            $info['wx_amount'] =0;
            $info['ali_amount'] =0;
        }else{
            foreach($get_money_array as $k=>$v){
                if($v['pay_way'] == 0)$info['wx_amount'] = $v['order_money'];
                if($v['pay_way'] == 1)$info['ali_amount'] = $v['order_money'];
            }
        }

        $info['total_amount'] = $info['wx_amount'] + $info['ali_amount'];
        if($info['total_amount'] != 0){
            $info['wo_id'] = time().rand(10000,99999);
            $info['create_time'] = date('Y-m-d H:i:s');
            $info['administrator_id'] = $userid;
            $res = $witModel->save($info);
        }else{
            $res = 0;
        }

        if($res&&($uid !==1)){
               $get_order = $ordModel
                ->where('administrator_id ='.$userid)
                ->where('order_status',2)
                ->where('settled',0)
                ->setField('settled',1);
                $this->success('提现成功！');
            }
        else{
            $this->error('提现失败！');
        }

    }

}