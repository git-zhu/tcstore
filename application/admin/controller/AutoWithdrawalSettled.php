<?php

namespace app\admin\controller;

use app\common\controller\Backend;

/**
 * 
 *
 * @icon fa fa-circle-o
 */
class AutoWithdrawalSettled extends Backend
{
    
    /**
     * AutoWithdrawalSettled模型对象
     * @var \app\admin\model\AutoWithdrawalSettled
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\AutoWithdrawalSettled;

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
            $auth = $this->auth->is_super;
            $userid =$this->auth->userid;
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
            }elseif ($auth ==2) {
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
            }else{
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
                $row->visible(['id','wo_id','administrator_id','type','status','count','create_time']);
                $row->visible(['administrator']);
				$row->getRelation('administrator')->visible(['name']);
            }
            $list = collection($list)->toArray();
            $result = array("total" => $total, "rows" => $list);

            return json($result);
        }
        return $this->view->fetch();
    }
}
