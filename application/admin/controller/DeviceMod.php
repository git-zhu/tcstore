<?php


namespace app\admin\controller;


use app\common\controller\Backend;
use app\admin\model\DeviceInfo;
use app\admin\model\Goods;
use think\Request;

/**
 * 模板管理
 *
 * @icon fa fa-circle-o
 */
class DeviceMod extends Backend
{
    public function index()
    {
        $userid = $this->auth->userid;
        $this->assignconfig("userid",$userid);
        return $this->view->fetch();

    }
    /**
     * curl获取模板数据
     * */

    public function curl(){
        $url = "https://tc.inleft.com/tcstore/template/getTemplateList";
        $data = array("code"=>"find_wonder");

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($ch, CURLOPT_AUTOREFERER, 1);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 4);
        curl_setopt($ch, CURLOPT_ENCODING, ""); //必须解压缩防止乱码
        curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 5.1; zh-CN) AppleWebKit/535.12 (KHTML, like Gecko) Chrome/22.0.1229.79 Safari/535.12");
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);

        $output = curl_exec($ch);
        curl_close($ch);
        $mod_list = json_decode($output);
        //dump($mod_list);
        return $mod_list;

    }

    /**
     * 模板添加
     */
    public function mod_add()
    {
        $device_info = new DeviceInfo();
        $where = array();
        $auth = $this->auth->is_super;
        $userid= $this->auth->userid;
        if($auth == 0){
            $where['administrator_id'] = $userid;
        }elseif ($auth == 2){
            $Administrator = new \app\admin\model\Administrator();
            $get_id = $Administrator->where('belong',$userid)->column('user_id');
            $where['administrator_id'] =array('in',$get_id);

        }
        $device_id = $device_info->where($where)->field('device_id')->select();

        $userid =$this->auth->userid;
        $this->assign('userid',$userid);
        $this->assign('device_id',$device_id);
        return $this->view->fetch();
    }

    /**
     * 执行添加
     */

    public function do_mod_add()
    {
        $modType = input('modType');
        $user_id = input('userId');
        $tplName = input('tplName');
        $time = time();
        $tplName= $tplName."@".$time;
        $nickname = input('nickname');
        $postUrl = 'https://tc.inleft.com/tcstore/template/createTempLate';
        $postData = array(
            'tplName'   =>$tplName,
            'modelType'   =>$modType,
            'userId'    =>$user_id
        );
        //halt($postData);
        $postData = http_build_query($postData);
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $postUrl);
        curl_setopt($curl, CURLOPT_USERAGENT,'Opera/9.80 (Windows NT 6.2; Win64; x64) Presto/2.12.388 Version/12.15');
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); // stop verifying certificate
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded'));
        curl_setopt($curl, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
        $r = curl_exec($curl);
        curl_close($curl);

        $Device_mod =new \app\admin\model\DeviceMod();
        $mod = $Device_mod->where('mod_name',$tplName)->update(['nickname' => $nickname]);

        $this->success('添加模板成功！','device_mod/device_select');

    }

    /**
     * 模板编辑
     *
     */
    public function mod_edit()
    {

        $uid = input('uid');
        $postUrl = 'https://tc.inleft.com/tcstore/template/queryTempLate';
        $postData = array(
            'uid'=>$uid,

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
        //dump($r);
        $mod = json_decode($r);
        //dump($mod);

        $modCode = $mod->data->modCode;
        $modName = $mod->data->modName;
        $modType = $mod->data->modType;
        $bindGoodList = $mod->data->bindGoodList;//获得已选商品
        $goods_list = json_decode($bindGoodList);//变成对象
        $bindDeviceList = $mod->data->bindDeviceList;//获得已选设备;
        if($bindDeviceList!=NULL)
        {
            $device_list = json_decode($bindDeviceList,true);//变成数组；
        }else{
            $modName = explode('@', $modName, -1);
            $modName =$modName[0];
            $device = array([
                'code'  =>  $modName,
                'name'  =>  $modName,
            ]);
            $bindDeviceList = json_encode($device);
            $device_list =NULL;
        }

        $ownId = $mod->data->ownId;
        //dump($modCode);

        $arr = [];//定义空数组
        if($goods_list !=NULL){
            foreach($goods_list as $v){
                $arr[] =  $v->goods_id;
            }
        }

        //dump($arr);

        $goods = new Goods;
        $goods_list = $goods->where('code is not null')->field('goods_id,name,code')->order('id DESC')->select();
        //dump($goods_list);
        $list = json_encode($goods_list,JSON_UNESCAPED_UNICODE);//JSON_UNESCAPED_UNICODE为了防止中文乱码

        $this->assign('list',$list);
        $this->assign('uid',$uid);
        $this->assign('modName',$modName);
        $this->assign('modType',$modType);
        $this->assign('modCode',$modCode);
        $this->assign('bindGoodList',$bindGoodList);
        $this->assign('arr',$arr);
        $this->assign('bindDeviceList',$bindDeviceList);
        $this->assign('device_list',$device_list);
        $this->assign('ownId',$ownId);
        return $this->view->fetch();
    }

    /**
     * 获取数据库本地商品
     */
    public function goods(){
        $goods = new Goods;
        $list = $goods->where('code is not null')->field('goods_id,name,code')->order('id DESC')->select();
        //dump($goods_list);
        $data = json_encode($list,JSON_UNESCAPED_UNICODE);//JSON_UNESCAPED_UNICODE为了防止中文乱码
        //dump($list);
        //dump($data);

        // $this->assign('list',$list);
        if($data){
            return json($data);

        }else{
            $data = "";
            return json($data);
        }



    }

    /**
     * 同步设备商品
     */

    public function device_goods_update($device_id=null)
    {
        if($this->request->isAjax()){

            $Device_mod = new \app\admin\model\DeviceMod();
            $mod = $Device_mod->where('mod_name',$device_id)->field('bind_device_list')->select();
            $mod  =collection($mod)->toArray();
            $device_str =array_column($mod,'bind_device_list');
            $device_array = json_decode($device_str[0],true);

            $arr_ds =[];
            if($device_array !=NULL)
            {
                foreach ($device_array as $k =>$v)
                {
                    $arr_ds[]=$v['code'];
                }
            }

            $rs = explode('@', $device_id, -1);
            if($rs !=NULL){
                $device_id =$rs[0];
            }

            $ids = $this->request->param("arrayIds");
            $ids =json_decode($ids);//拿到商品id
            //halt($ids);
            $Device_goods =new \app\admin\model\DeviceGoods();
            $All_goods = new Goods();
            $goods = $Device_goods->where('device_id',$device_id)->select();
            $goods = collection($goods)->toArray();//获取已存在的商品价格信息

                $goods = array_column($goods, 'goods_id'); //只提取goods_id

                $rs = array_diff($ids,$goods); //取没有的值
                //halt($rs);

                $device_list = $arr_ds;
                $arr =[];
                foreach ($device_list as $k1=>$v1)
                {
                    $arr[$k1]['device_id'] =$v1;
                }
                $arr = array_column($arr,'device_id'); //获得设备列表数组
                //更新设备商品信息
                foreach ($rs as $k=>$v){
                    $swhere['goods_id'] =$v;
                    $info = $All_goods->where($swhere)->find()->toArray();//找到对应的总商品库的商品
                    foreach ($arr as $k1=>$v1)
                    {
                        $info['device_id'] =$v1;
                        unset($info['id']);
                        $rs = $Device_goods->isUpdate(false)->data($info,true)->save();
                    }

                }
                //删除模板里面没有的商品
                $delete_goods = array_diff($goods,$ids);
                foreach ($delete_goods as $k1=>$v1){
                    $dwhere['goods_id'] = $v1;
                    foreach ($arr as $k=>$v)
                    {
                        $dwhere['device_id'] = $v;
                        $done_delete = $Device_goods
                            ->where($dwhere)->delete();
                    }

                }


                $this->success('同步成功！');



            //halt($goods);



        }else{
            $this->error("非法请求！");
        }

    }

    /**
     * 导入模板
     */

    public function mod_insert()
    {
        $uid = input('uid');
        $device_mod = new \app\admin\model\DeviceMod();
        $where = array();
        $auth = $this->auth->is_super;
        $userid = $this->auth->userid;
        if($auth == 0){
            $where['own_id'] = $userid;
        }elseif ($auth ==2){
            $Administrator = new \app\admin\model\Administrator();
            $get_id = $Administrator->where('belong',$userid)->column('user_id');
            $where['own_id'] =array('in',$get_id);
        }
        $mod = $device_mod->where($where)->select();
        $mod = collection($mod)->toArray();


        $this->assign('device_id',$mod);
        $this->assign('uid',$uid);
        return $this->view->fetch();

    }

    /**
     * 执行导入
     */

    public  function do_mod_insert()
    {
        $uid = input('uid');
        $mod_name = input('mod_name');
        $device_mod = new \app\admin\model\DeviceMod();
        $mod =$device_mod->where('uid',$uid)->select();//被导入的模板
        $mod = collection($mod)->toArray(); //变数组

        $goods =$device_mod->where('mod_name',$mod_name)->field('bind_good_list')->select();//获得选中的目标模板商品
        $goods =collection($goods)->toArray();
        $target_goods =$goods[0]['bind_good_list'];
        //$target_goods = array_column($goods,'bind_good_list');
        //$target_goods =json_encode($target_goods,JSON_UNESCAPED_UNICODE);//转字符串,防止乱码

        //$target =json_encode($arr,JSON_UNESCAPED_UNICODE);//转字符串,防止乱码


        $postUrl = 'https://tc.inleft.com/tcstore/template/updateTempLate';
        $postData = array(
            'uid'   =>  $mod[0]['uid'],
            'modCode'   =>  $mod[0]['mod_code'],
            'modName'   =>  $mod[0]['mod_name'],
            'modType'   =>  $mod[0]['mod_type'],
            'bindGoodList'   =>  $target_goods,
            'bindDeviceList'   =>$mod[0]['bind_device_list'],
            'ownId'   =>$mod[0]['own_id'],
        );
        $postData =json_encode($postData,JSON_UNESCAPED_UNICODE);//转字符串,防止乱码
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $postUrl);
        curl_setopt($curl, CURLOPT_USERAGENT,'Opera/9.80 (Windows NT 6.2; Win64; x64) Presto/2.12.388 Version/12.15');
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); // stop verifying certificate
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json; charset=utf-8'));
        curl_setopt($curl, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
        $r = curl_exec($curl);
        curl_close($curl);

        $this->success('导入成功！！');
    }

    /**
     * 设备选择
     */

    public function device_select()
    {
        $uid = input('uid');
        $Device_mod = new \app\admin\model\DeviceMod();
        $Device_info = new DeviceInfo();

        if($this->request->isPost()){
            $mod = $Device_mod->where('uid',$uid)->select();
            $mod = collection($mod)->toArray(); //获得已绑定模板信息
            $target_device = $this->request->post();
            $target_arr = [];
            foreach ($target_device as $k=>$v)
            {
                $target_arr[$k]['code'] = $k;
                $target_arr[$k]['name'] = $k;
            }
            $arr_target =[];
            foreach ($target_arr as $k=>$v)
            {
                $arr_target[] =$v;
            }

            $target_device =json_encode($arr_target);//获得目标json

            $postUrl = 'https://tc.inleft.com/tcstore/template/updateTempLate';
            $postData = array(
                'uid'   =>  $mod[0]['uid'],
                'modCode'   =>  $mod[0]['mod_code'],
                'modName'   =>  $mod[0]['mod_name'],
                'modType'   =>  $mod[0]['mod_type'],
                'bindGoodList'   =>  $mod[0]['bind_good_list'],
                'bindDeviceList'   =>$target_device,
                'ownId'   =>$mod[0]['own_id'],
            );
            $postData =json_encode($postData,JSON_UNESCAPED_UNICODE);//转字符串,防止乱码
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, $postUrl);
            curl_setopt($curl, CURLOPT_USERAGENT,'Opera/9.80 (Windows NT 6.2; Win64; x64) Presto/2.12.388 Version/12.15');
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); // stop verifying certificate
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_POST, true);
            curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json; charset=utf-8'));
            curl_setopt($curl, CURLOPT_POSTFIELDS, $postData);
            curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
            $r = curl_exec($curl);
            curl_close($curl);

            $this->success('设备选择成功！！');

        }

        $dwhere = array();
        $auth = $this->auth->is_super;
        $userid = $this->auth->userid;
        if($auth == 0){
            $dwhere['administrator_id'] = $this->auth->userid;
        }elseif ($auth ==2){
            $Administrator = new \app\admin\model\Administrator();
            $get_id = $Administrator->where('belong',$userid)->column('user_id');
            $dwhere['administrator_id'] =array('in',$get_id);

        }
        $device_list = $Device_info->where($dwhere)->field('device_id')->select();
        $device_list = collection($device_list)->toArray(); //获得拥有者的所有设备

        $device_selected = $Device_mod->where('uid',$uid)->field('bind_device_list')->select();
        $device_selected_arr = collection($device_selected)->toArray(); //获得已绑定模板的设备
        $device_selected_str =array_column($device_selected_arr,'bind_device_list');
        $device_selected_array = json_decode($device_selected_str[0],true);

        $arr_ds =[];
        if($device_selected_array !=NULL)
        {
            foreach ($device_selected_array as $k =>$v)
            {
                    $arr_ds[]=$v['code'];
            }
        }

        $arr =[];
        foreach ($device_list as $k=>$v)
        {
            foreach ($v as $k1=>$v1)
            {
                    $arr[] =$v1;
            }
        }

        $device_list =array_diff($arr,$arr_ds);

        $this->assign('device_selected',$device_selected_array);
        $this->assign('device_list',$device_list);
        $this->assign('uid',$uid);
        return $this->view->fetch();

    }

    /**
     * 模板名称修改
     */

    public function mod_name()
    {
        $uid = input('uid');
        if ($this->request->isPost())
        {
            $nickname =input('nickname');
            $uid =input('uid');
            $Device_mod = new \app\admin\model\DeviceMod();
            $rs = $Device_mod->where('uid',$uid)->update(['nickname' => $nickname]);
            $this->success('修改成功！');
        }
        $this->assign('uid',$uid);
        return $this->view->fetch();
    }

    /**
     * 获取已有模板接口
     */

    public function get_mod_list()
    {
        $where =array();
        $auth = $this->auth->is_super;
        $userid = $this->auth->userid;
        if ($auth ==0){
            $where['own_id'] =$userid;
        }elseif ($auth ==2)
        {
            $Administrator = new \app\admin\model\Administrator();
            $get_id = $Administrator->where('belong',$userid)->column('user_id');
            $where['own_id'] =array('in',$get_id);
        }
        $nickname =input('nickname');
        if(!empty($nickname)){
            $where['nickname'] = ['like',"%{$nickname}%"];
        }

        $Device_mod = new \app\admin\model\DeviceMod();
        //$rs = $Device_mod->where($where)->order('create_time desc')->select();
        //$data = collection($rs);
        //$count =count($rs);//总条数；
        $rs = $Device_mod->where($where)->order('create_time desc')->select();
        $count =count($rs);//总条数；
        $limit = Request::instance()->param('limit'); //获取每页显示的条数；
        $page = Request::instance()->param('page'); //获取当前页数；
        $tol = ($page-1)*$limit; //
        $rs = $Device_mod->where($where)->order('create_time desc')->limit($tol,$limit)->select();
        $data = collection($rs);


        $rd = array(
            'code'  =>  0,
            'msg'   =>  '获取成功!',
            'count' =>  $count,
            'data'  =>$data,

        );
        return json($rd);

    }
}