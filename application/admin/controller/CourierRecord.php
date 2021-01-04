<?php

namespace app\admin\controller;

use app\common\controller\Backend;

/**
 * 上下货记录
 *
 * @icon fa fa-circle-o
 */
class CourierRecord extends Backend
{
    
    /**
     * CourierRecord模型对象
     * @var \app\admin\model\CourierRecord
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\CourierRecord;

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
            $userid =$this->auth->userid;
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
                $row->visible(['id','courier_name','device_id','status','lst_up_time']);

            }
            $list = collection($list)->toArray();
            $result = array("total" => $total, "rows" => $list);

            return json($result);
        }
        return $this->view->fetch();
    }



    /**
     * 上下货详情
     */
    public function detail($ids =null)
    {
        //halt($ids);
        $Record = new \app\admin\model\CourierRecord();
        $record =$Record->where('id ='.$ids)->find()->toArray();
        $temp =json_decode($record['detail'] );
        if($temp!=null){
            $this->assign('list',$temp);
        }else{
            $temp =[];
            $this->assign('list',$temp);
        }
        return $this->view->fetch();

    }
    

}
