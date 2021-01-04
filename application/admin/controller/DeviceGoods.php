<?php

namespace app\admin\controller;

use app\common\controller\Backend;

/**
 * 设备商品信息
 *
 * @icon fa fa-circle-o
 */
class DeviceGoods extends Backend
{
    
    /**
     * DeviceGoods模型对象
     * @var \app\admin\model\DeviceGoods
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\DeviceGoods;

    }

    protected $resultSetType = 'collection';  //对象转数组
    
    /**
     * 默认生成的控制器所继承的父类中有index/add/edit/del/multi五个基础方法、destroy/restore/recyclebin三个回收站方法
     * 因此在当前控制器中可不用编写增删改查的代码,除非需要自己控制这部分逻辑
     * 需要将application/admin/library/traits/Backend.php中对应的方法复制到当前控制器,然后进行修改
     */
    

    /**
     * 查看
     */
    public function index($device_id=null)
    {
        //当前是否为关联查询
        $this->relationSearch = false;
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
            $userid = $this->auth->userid;
            if($auth == 1){
                if($device_id ==null){
                    $total = $this->model
                        ->where($where)
                        ->order($sort, $order)
                        ->count();

                    $list = $this->model

                        ->where($where)
                        ->order($sort, $order)
                        ->limit($offset, $limit)
                        ->select();

                }else{
                    $device_id =json_encode($device_id);
                    $total = $this->model
                        ->where($where)
                        ->where('device_id = '.$device_id)
                        ->order($sort, $order)
                        ->count();

                    $list = $this->model

                        ->where($where)
                        ->where('device_id = '.$device_id)
                        ->order($sort, $order)
                        ->limit($offset, $limit)
                        ->select();

                }

            }elseif($auth == 2){
                $Administrator = new \app\admin\model\Administrator();
                $get_id = $Administrator->where('belong',$userid)->column('user_id');
                if($device_id ==null){
                    $total = $this->model
                        ->where($where)
                        ->where('administrator_id','IN',$get_id)
                        ->order($sort, $order)
                        ->count();

                    $list = $this->model
                        ->where($where)
                        ->where('administrator_id','IN',$get_id)
                        ->order($sort, $order)
                        ->limit($offset, $limit)
                        ->select();
                }else{
                    $device_id =json_encode($device_id);
                    $total = $this->model
                        ->where($where)
                        ->where('device_id = '.$device_id)
                        ->order($sort, $order)
                        ->count();

                    $list = $this->model

                        ->where($where)
                        ->where('device_id = '.$device_id)
                        ->order($sort, $order)
                        ->limit($offset, $limit)
                        ->select();
                }

            }else{
                $Device = new \app\admin\model\DeviceInfo();
                $device_id = $Device->where('administrator_id ='.$userid)->column('device_id');
                $device_id = implode(',',$device_id);
                $total = $this->model

                    ->where($where)
                    ->where('device_id','in',$device_id)
                    ->order($sort, $order)
                    ->count();

                $list = $this->model

                    ->where($where)
                    ->where('device_id','in',$device_id)
                    ->order($sort, $order)
                    ->limit($offset, $limit)
                    ->select();
            }


            foreach ($list as $row) {
                $row->visible(['id','device_id','goods_id','name','pic','code','coupon']);
                
            }
            $list = collection($list)->toArray();
            $result = array("total" => $total, "rows" => $list);

            return json($result);
        }
        return $this->view->fetch();
    }
}
