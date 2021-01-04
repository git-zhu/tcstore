<?php

namespace app\admin\controller;

use app\admin\model\Admin;
use app\admin\model\AuthGroupAccess;
use app\common\controller\Backend;
use fast\Random;

/**
 * 管理员
 *
 * @icon fa fa-circle-o
 */
class Administrator extends Backend
{
    
    /**
     * Administrator模型对象
     * @var \app\admin\model\Administrator
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Administrator;

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
        //设置过滤方法
        $this->request->filter(['strip_tags']);
        if ($this->request->isAjax()) {
            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('keyField')) {
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
            }elseif($auth==2){
                $total = $this->model
                    ->where($where)
                    ->where('belong',$userid)
                    ->order($sort, $order)
                    ->count();

                $list = $this->model
                    ->where($where)
                    ->where('belong',$userid)
                    ->order($sort, $order)
                    ->limit($offset, $limit)
                    ->select();

            }


            $list = collection($list)->toArray();
            $result = array("total" => $total, "rows" => $list);

            return json($result);
        }
        return $this->view->fetch();
    }

    /**
     * 添加超级商户
     */
    public function admin_add_super($super =NULL)
    {
        $Adm = new \app\admin\model\Administrator();
        $FaAdmin = new Admin();
        $FaAdmin_Group =new AuthGroupAccess();
        if ($this->request->isPost()) {
            $params = $this->request->post("row/a");
            $params['user_id'] = time().rand(10000,99999);
            $params['super'] = 2;
            $params['belong'] = $params['user_id'];
            $is_xist = $Adm->where('user_name',$params['user_name'])->find();//验证账号是否已存在
            if($is_xist ==NULL){
                $Adm ->save($params); //旧后台账号新增

                $params['salt'] = Random::alnum();
                $params['password'] = md5(md5($params['password']) . $params['salt']);
                $params['avatar'] = '/assets/img/avatar.png'; //设置新管理员默认头像。
                $result = $FaAdmin->data([
                    'userid'    =>  $params['user_id'],
                    'username'  =>  $params['user_name'],
                    'nickname'  =>  $params['name'],
                    'password'  =>  $params['password'],
                    'is_super'  =>  2,
                    'belong'  =>  $params['user_id'],
                    'salt'  =>  $params['salt'],
                    'avatar'    =>$params['avatar'],
                    'email' => NULL
                ])->save();
                $Fa_id =$FaAdmin->id;
                $rs = $FaAdmin_Group->data([
                    'uid'   =>$Fa_id,
                    'group_id' =>$super,
                ])->save();
                if(($result===false)&&($rs===false)){
                    $this->error('添加失败！');
                }else{
                    $this->success('添加账号成功！');
                }
            }else{
                $this->error("账号已存在！");
            }
        }else{
            return $this->view->fetch();
        }

    }


    /**
     * 添加普通商户
     */
    public function admin_add($super =NULL)
    {
        $Adm = new \app\admin\model\Administrator();
        $FaAdmin = new Admin();
        $FaAdmin_Group =new AuthGroupAccess();
        if ($this->request->isPost()) {
            $params = $this->request->post("row/a");
            $params['user_id'] = time().rand(10000,99999);
            $is_xist = $Adm->where('user_name',$params['user_name'])->find();//验证账号是否已存在
            if($is_xist ==NULL){
                $Adm ->save($params); //旧后台账号新增

                $params['salt'] = Random::alnum();
                $params['password'] = md5(md5($params['password']) . $params['salt']);
                $params['avatar'] = '/assets/img/avatar.png'; //设置新管理员默认头像。
                $result = $FaAdmin->data([
                    'userid'    =>  $params['user_id'],
                    'username'  =>  $params['user_name'],
                    'nickname'  =>  $params['name'],
                    'password'  =>  $params['password'],
                    'is_super'  =>  0,
                    'salt'  =>  $params['salt'],
                    'avatar'    =>$params['avatar'],
                    'email' => NULL
                ])->save();
                $Fa_id =$FaAdmin->id;
                $rs = $FaAdmin_Group->data([
                    'uid'   =>$Fa_id,
                    'group_id' =>$super,
                ])->save();
                if(($result===false)&&($rs===false)){
                    $this->error('添加失败！');
                }else{
                    $this->success('添加账号成功！');
                }
            }else{
                 $this->error("账号已存在！");
            }
        }else{
            return $this->view->fetch();
        }

    }

    /**
     * 添加二级商户
     */
    public function admin_add2($super =NULL)
    {
        $userid = $this->auth->userid;
        $is_super = $this->auth->id;
        if($is_super ==1){
            $this->error('超管账号不能添加二级商户！');
        }else{
            $Adm = new \app\admin\model\Administrator();
            $FaAdmin = new Admin();
            $FaAdmin_Group =new AuthGroupAccess();
            if ($this->request->isPost()) {
                $params = $this->request->post("row/a");
                $params['user_id'] = time().rand(10000,99999);
                $params['belong'] = $userid;
                $is_xist = $Adm->where('user_name',$params['user_name'])->find();//验证账号是否已存在
                if($is_xist ==NULL){
                    $Adm ->save($params); //旧后台账号新增

                    $params['salt'] = Random::alnum();
                    $params['password'] = md5(md5($params['password']) . $params['salt']);
                    $params['avatar'] = '/assets/img/avatar.png'; //设置新管理员默认头像。
                    $result = $FaAdmin->data([
                        'userid'    =>  $params['user_id'],
                        'username'  =>  $params['user_name'],
                        'nickname'  =>  $params['name'],
                        'password'  =>  $params['password'],
                        'is_super'  =>  0,
                        'belong'    =>  $userid,
                        'salt'  =>  $params['salt'],
                        'avatar'    =>$params['avatar'],
                        'email' => NULL
                    ])->save();
                    $Fa_id =$FaAdmin->id;
                    $rs = $FaAdmin_Group->data([
                        'uid'   =>$Fa_id,
                        'group_id' =>$super,
                    ])->save();
                    if(($result===false)&&($rs===false)){
                        $this->error('添加失败！');
                    }else{
                        $this->success('添加账号成功！');
                    }
                }else{
                    $this->error("账号已存在！");
                }
            }else{
                return $this->view->fetch();
            }

        }


    }

}
