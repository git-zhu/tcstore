<?php

namespace app\admin\controller;

use app\common\controller\Backend;

/**
 * 订单信息
 *
 * @icon fa fa-circle-o
 */
class DeviceSales extends Backend
{
    
    /**
     * DeviceSales模型对象
     * @var \app\admin\model\DeviceSales
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\DeviceSales;

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
            $userid = $this->auth->userid;
            $auth = $this->auth->is_super;
            if($auth==1) {
                $total = $this->model
                    ->with(['administrator'])
                    ->where($where)
                    ->field('SUM(order_money) as money,count(order_id) as count')
                    ->group('device_id')
                    ->order($sort, $order)
                    ->count();

                $list = $this->model
                    ->with(['administrator'])
                    ->where($where)
                    ->where('order_status != 3')
                    ->field('SUM(order_money) as money,count(order_id) as count')
                    ->order($sort, $order)
                    ->limit($offset, $limit)
                    ->group('device_id')
                    ->select();
            }elseif($auth == 2){
                $Administrator = new \app\admin\model\Administrator();
                $get_id = $Administrator->where('belong',$userid)->column('user_id');
                $total = $this->model
                    ->where($where)
                    ->where('administrator_id','IN',$get_id)
                    ->field('SUM(order_money) as money,count(order_id) as count')
                    ->group('device_id')
                    ->order($sort, $order)
                    ->count();

                $list = $this->model
                    ->where($where)
                    ->where('order_status != 3')
                    ->where('administrator_id','IN',$get_id)
                    ->field('SUM(order_money) as money,count(order_id) as count')
                    ->group('device_id')
                    ->order($sort, $order)
                    ->limit($offset, $limit)
                    ->select();
            }else{
                $total = $this->model
                    ->with(['administrator'])
                    ->where($where)
                    ->where('administrator_id ='.$userid)
                    ->field('SUM(order_money) as money,count(order_id) as count')
                    ->group('device_id')
                    ->order($sort, $order)
                    ->count();

                $list = $this->model
                    ->with(['administrator'])
                    ->where($where)
                    ->where('order_status != 3')
                    ->where('administrator_id ='.$userid)
                    ->field('SUM(order_money) as money,count(order_id) as count')
                    ->order($sort, $order)
                    ->limit($offset, $limit)
                    ->group('device_id')
                    ->select();

            }

            foreach ($list as $row) {
                $row->visible(['id','device_id','administrator_id','money','count','create_time','price']);
                $row->visible(['administrator']);
            }
            $list = collection($list)->toArray();
            $arr =[];
            foreach ($list as $k=>$v)
            {
                $arr[$k] =$v;
                $price = $v['count']== 0 ? 0 : ( $v['money']/$v['count']);
                $price = round($price,2);
                $arr[$k]['price'] = $price;
            }
            $list =$arr;

            $result = array("total" => $total, "rows" => $list);

            return json($result);
        }
        return $this->view->fetch();
    }
}
