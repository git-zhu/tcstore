<?php

namespace app\admin\controller;

use app\common\controller\Backend;

/**
 * 送货员
 *
 * @icon fa fa-circle-o
 */
class Courier extends Backend
{
    
    /**
     * Courier模型对象
     * @var \app\admin\model\Courier
     */
    protected $model = null;

    /**
     * 模型数组
     */
    protected $resultSetType = 'collection';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Courier;

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

            $userid = $this->auth->userid;
            $auth = $this->auth->is_super;
            if($auth==1){
                $total = $this->model
                    ->where($where)
                    ->order($sort, $order)
                    ->count();

                $list = $this->model
                    ->where($where)
                    ->order($sort, $order)
                    ->limit($offset, $limit)
                    ->select();

            }elseif($auth == 2){
                $Administrator = new \app\admin\model\Administrator();
                $get_id = $Administrator->where('belong',$userid)->column('user_id');
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
                $total = $this->model
                    ->where($where)
                    ->where('administrator_id',$userid)
                    ->order($sort, $order)
                    ->count();

                $list = $this->model
                    ->where($where)
                    ->where('administrator_id',$userid)
                    ->order($sort, $order)
                    ->limit($offset, $limit)
                    ->select();

            }


            foreach ($list as $row) {
                $row->visible(['id','user_name','device_id','status','create_time']);
                
            }
            $list = collection($list)->toArray();
            $result = array("total" => $total, "rows" => $list);

            return json($result);
        }
        return $this->view->fetch();
    }

    /**
     * 添加上货员
     */
    public function courier_add()
    {
        $userid = $this->auth->userid;
        $Device = new \app\admin\model\DeviceInfo();
        if($this->auth->is_super==1){
            $device = $Device->field('device_id')->select()->toArray();

        }else{
            $device = $Device->where('administrator_id ='.$userid)->field('device_id')->select();



        }
        $this->assign('device',$device);
        return $this->view->fetch();
    }
}
