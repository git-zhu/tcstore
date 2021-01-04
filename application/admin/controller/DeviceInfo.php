<?php

namespace app\admin\controller;

use app\common\controller\Backend;

/**
 * 设备信息
 *
 * @icon fa fa-circle-o
 */
class DeviceInfo extends Backend
{
    
    /**
     * DeviceInfo模型对象
     * @var \app\admin\model\DeviceInfo
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\DeviceInfo;

    }
    
    /**
     * 默认生成的控制器所继承的父类中有index/add/edit/del/multi五个基础方法、destroy/restore/recyclebin三个回收站方法
     * 因此在当前控制器中可不用编写增删改查的代码,除非需要自己控制这部分逻辑
     * 需要将application/admin/library/traits/Backend.php中对应的方法复制到当前控制器,然后进行修改
     */

    /**
     * 获取token
     */
    public function curl()
    {
        $postUrl = 'http://api.hahabianli.com/token/get';
        $postData = array(
            'app_id'    =>      '1910221025267231',
            'app_secret'=>      '1748f5f859231ba5bed74c4cbc887325',
            'rand_str'  =>      '666666',

        );
        $postData = http_build_query($postData);
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $postUrl);
        curl_setopt($curl, CURLOPT_USERAGENT,'Opera/9.80 (Windows NT 6.2; Win64; x64) Presto/2.12.388 Version/12.15');
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); // stop verifying certificate
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded'));
        curl_setopt($curl, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
        $r = curl_exec($curl);
        curl_close($curl);

        $arr = json_decode($r,true);
        $token = $arr['data']['access_token'];
        return $token;

    }
    /**
     * 查询在线状态
     */

    public function online()
    {
        $Device_info = new \app\admin\model\DeviceInfo();
        $device_list = $Device_info->column('device_id');
        foreach ($device_list as $k=>$v)
        {
            $device_id = $v;
            $token = $this->curl();
            $postUrl = 'http://api.hahabianli.com/device/getDeviceOnlineStatus';
            $postData = array(
                'access_token'    =>      $token,
                'device_id'=>      $device_id,
            );
            $postData = http_build_query($postData);
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, $postUrl);
            curl_setopt($curl, CURLOPT_USERAGENT,'Opera/9.80 (Windows NT 6.2; Win64; x64) Presto/2.12.388 Version/12.15');
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); // stop verifying certificate
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_POST, true);
            curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded'));
            curl_setopt($curl, CURLOPT_POSTFIELDS, $postData);
            curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
            $r = curl_exec($curl);
            curl_close($curl);

            $arr = json_decode($r,true);
            $status = $arr['data']['is_online'];

            $update = $Device_info->where('device_id',$device_id)->update(['is_online' => $status]);
        }
        $this->success('更新成功');


    }

    /**
     * 查询状态
     */
    public function status(){
        $Device_info = new \app\admin\model\DeviceInfo();
        $device_list = $Device_info->column('device_id');

            $token = $this->curl();
            $postUrl = 'http://api.hahabianli.com/device/getlist';
            $postData = array(
                'access_token'    =>      $token,
                'page_no'         =>        1,
                'page_size'       =>        100 ,
            );
            $postData = http_build_query($postData);
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, $postUrl);
            curl_setopt($curl, CURLOPT_USERAGENT,'Opera/9.80 (Windows NT 6.2; Win64; x64) Presto/2.12.388 Version/12.15');
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); // stop verifying certificate
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_POST, true);
            curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded'));
            curl_setopt($curl, CURLOPT_POSTFIELDS, $postData);
            curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
            $r = curl_exec($curl);
            curl_close($curl);

            dump($r);


    }

    /**
     * 定时任务
     */

    public function run()
    {
        ignore_user_abort(); //关闭浏览器，php脚本也可以继续执行；
        set_time_limit(0);// 通过set_time_limit(0)可以让程序无限制的执行下去

        $interval=60*15;// 每隔15分钟运行
        do{
            $run = include 'run.php';
            if(!$run)die('process abort');

            $this->online();

            sleep($interval);//等待15分钟

        }while(true);
    }
    

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
            $userid = $this->auth->userid;
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
            }elseif($auth == 2){
                $Administrator = new \app\admin\model\Administrator();
                $get_id = $Administrator->where('belong',$userid)->column('user_id');
                $total = $this->model
                    ->with(['administrator'])
                    ->where($where)
                    ->where('device_info.administrator_id','IN',$get_id)
                    ->order($sort, $order)
                    ->count();

                $list = $this->model
                    ->with(['administrator'])
                    ->where($where)
                    ->where('device_info.administrator_id','IN',$get_id)
                    ->order($sort, $order)
                    ->limit($offset, $limit)
                    ->select();
            }else{
                $total = $this->model
                    ->with(['administrator'])
                    ->where($where)
                    ->where('device_info.administrator_id = '.$userid)
                    ->order($sort, $order)
                    ->count();

                $list = $this->model
                    ->with(['administrator'])
                    ->where($where)
                    ->where('device_info.administrator_id = '.$userid)
                    ->order($sort, $order)
                    ->limit($offset, $limit)
                    ->select();
            }


            foreach ($list as $row) {
                $row->visible(['id','device_id','name','address','is_online','status']);
                $row->visible(['administrator']);
				$row->getRelation('administrator')->visible(['name']);
            }
            $list = collection($list)->toArray();
            $result = array("total" => $total, "rows" => $list);

            return json($result);
        }
        return $this->view->fetch();
    }

    /**
     * 二维码
     */
    public function code($ids = null)
    {
        $device_id = input('device_id');
        $this->assign('device_id',$device_id);
        $this->assign('ids',$ids);
        return $this->view->fetch();
    }

    /**
     * 分配设备
     */

    public function device_assigned($device_id =null)
    {
        $administrator_id = input('user_id');
        $Admin = new \app\admin\model\Administrator();
        $Device_info = new \app\admin\model\DeviceInfo();
        $Stock = new \app\admin\model\Stock();
        if ($this->request->isPost()) {
            $device_id = input('device_id');
            $update = $Device_info->where('device_id',$device_id)->update([
                'administrator_id'  =>  $administrator_id]);
            $update2 = $Stock->where('device_id',$device_id)->update([
                'administrator_id'  =>  $administrator_id]);
            if($update){
                $this->success('分配成功！');
            }else{
                $this->error('分配失败！');
            }

        }
        $list = $Admin->select();
        $this->assign('list',$list);
        $this->assign('device_id',$device_id);
        return $this->view->fetch();

    }
}
