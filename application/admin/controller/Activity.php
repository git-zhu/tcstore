<?php

namespace app\admin\controller;

use app\common\controller\Backend;

/**
 * 
 *
 * @icon fa fa-circle-o
 */
class Activity extends Backend
{
    
    /**
     * Activity模型对象
     * @var \app\admin\model\Activity
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Activity;

    }
    
    /**
     * 默认生成的控制器所继承的父类中有index/add/edit/del/multi五个基础方法、destroy/restore/recyclebin三个回收站方法
     * 因此在当前控制器中可不用编写增删改查的代码,除非需要自己控制这部分逻辑
     * 需要将application/admin/library/traits/Backend.php中对应的方法复制到当前控制器,然后进行修改
     */
    

    /**
     * 列表查看
     */
    public function index()
    {
        $tcUid = $this->auth->userid;

        $this->assignconfig('tcUid',$tcUid);
        return $this->view->fetch();

    }

    /**
     * 查看活动详情
     */
    public function detail($activityId = null)
    {
        $tcUid = $this->auth->userid;

        $this->assignconfig('tcUid',$tcUid);
        $this->assign('activityId',$activityId);
        return $this->view->fetch();

    }

    /**
     * 添加活动
     */

    public function add()
    {
        $tcUid = $this->auth->userid;

        $this->assignconfig('tcUid',$tcUid);
        return $this->view->fetch();
    }
}
