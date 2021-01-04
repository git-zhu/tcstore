<?php

namespace app\admin\controller;

use app\common\controller\Backend;

/**
 * 库存
 *
 * @icon fa fa-circle-o
 */
class Stock extends Backend
{
    
    /**
     * Stock模型对象
     * @var \app\admin\model\Stock
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Stock;

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
                    ->where('administrator_id ='.$userid)
                    ->order($sort, $order)
                    ->count();

                $list = $this->model

                    ->where($where)
                    ->where('administrator_id ='.$userid)
                    ->order($sort, $order)
                    ->limit($offset, $limit)
                    ->select();

            }


            foreach ($list as $row) {
                $row->visible(['id','device_id','administrator_id']);

            }
            $list = collection($list)->toArray();
            $result = array("total" => $total, "rows" => $list);

            return json($result);
        }
        return $this->view->fetch();
    }

    /**
     * 详情
     */
    public function detail($ids =null)
    {
        $Stock = new \app\admin\model\Stock();
        $stock = $Stock->where('id ='.$ids)->find()->toArray();
        $temp = json_decode($stock['detail'],true);
        $Device_goods = new \app\admin\model\DeviceGoods();
        $device_goods =$Device_goods->where('device_id',$stock['device_id'])
            ->field('goods_id')->select()->toArray();
        $device_goods =array_column($device_goods,'goods_id');
        $temp2 =[];
        foreach ($temp as $k=>$v)
        {

            if (array_search($v['goodsId'],$device_goods)!==false){
                $k = $v['goodsId'];
                $temp2[$k] =$v;
            }

        }
        $this->assign('stock_list',$temp2);
        $this->assign('ids',$ids);
        return $this->view->fetch();
    }

    /**
     * 更新库存
     */

    public function do_edit($ids =null)
    {
        if($this->request->isAjax()){
            $temp = $this->request->param("temp");
            $Stock =new \app\admin\model\Stock();
            $stock_detail = $Stock->where('id',$ids)->setField('detail',$temp);
            if($stock_detail ==1){
                $this->success('成功');
            }else{
                $this->error('失败');
            }

        }else{
            $this->error('非法请求！');
        }
    }

    /**
     * 销量统计
     */

    public function sales($device_id =null)
    {
            $this->assign('device_id',$device_id);
            return $this->view->fetch();
    }

    /**
     * 全部销量
     */
    public function sales_count($device_id =null)
    {
        $Order = new \app\admin\model\OrderInfo();
        //总销量
        $all = $Order
            ->where('device_id',$device_id)
            ->where('order_status',2)
            ->where('order_detail !=""')
            ->field('order_detail')
            ->select()->toArray();
        //halt($all);
        $arr = [];
        foreach ($all as $k=>$v){
            $arr[] = json_decode($v['order_detail'],true);
            //$arr[] = $v['order_detail'];
        }
        //halt($arr);
        //合并数组
        $item=array();
        foreach ($arr as $k=>$v)
        {
            foreach ($v as $k1=>$v1)
            {
                $k1 = $v1['goodsId'];
                if(!isset($item[$k1])){
                    $item[$k1] =$v1;
                }else{
                    $item[$k1]['count'] =$item[$k1]['count']+$v1['count'];
                    if($item[$k1]['goodsId'] =="abnormal"){
                        $item[$k1]['name'] ="异常";
                        $item[$k1]['coupon'] ="60";
                        $item[$k1]['sum'] =$item[$k1]['count']*$item[$k1]['coupon'];
                    }
                    if($item[$k1]['goodsId'] =="unknow"){
                        $item[$k1]['name'] ="未知";
                        $item[$k1]['coupon'] ="3";
                        $item[$k1]['sum'] =$item[$k1]['count']*$item[$k1]['coupon'];
                    }
                }
            }
        }
        $item_keys =array_keys($item);
        $find_unknow1 = array_search('unknow',$item_keys); //查找里面有无unknow值
        if($find_unknow1 !==false)
        {
            array_splice($item_keys, $find_unknow1, 1); //去掉unknow
        }
        $find_unknow2 = array_search('abnormal',$item_keys); //查找里面有无abnormal值
        if($find_unknow2 !==false)
        {
            array_splice($item_keys, $find_unknow2, 1); //去掉abnormal
        }
        $find_unknow3 = array_search('未知',$item_keys); //查找里面有无“未知”值
        if($find_unknow3 !==false)
        {
            array_splice($item_keys, $find_unknow3, 1); //去掉abnormal
        }
        $goods_id = implode(',',$item_keys); //转成字符串

        $Device_goods =new \app\admin\model\DeviceGoods();
        $goods_price =$Device_goods ->where('goods_id in ('.$goods_id.')')->where('device_id = "'.$device_id.'"')
            ->field(['coupon','goods_id'])->select();
        $goods_price_temp = collection($goods_price)->toArray();//得到对应价格数组  无“未知”“unknow”“abnormal”的数组；
        $goods_price_target =[];
        foreach ($goods_price_temp as $k=>$v){
            $goods_price_target[$k]['coupon'] =$v['coupon'];
            $goods_price_target[$k]['goodsId'] =$v['goods_id'];
        }
        $temp =array_merge_recursive($goods_price_target,$item);//合并数组
        $target = [];
        foreach ($temp as $k=>$v)
        {
            $k = $v['goodsId'];
            if(!isset($target[$k])){
                $target[$k] =$v;
            }else{
                $target[$k]['count'] =abs($v['count']);
                $target[$k]['name'] =$v['name'];
                $target[$k]['sum'] = round($target[$k]['count']*$target[$k]['coupon'],2);
            }}


       // $item =json_encode($item,JSON_UNESCAPED_UNICODE);
        $count =  100;
        $rs = array(
            'code'  =>  0,
            'msg'   =>  '',
            'count' =>  $count,
            'data'  =>$target,

        );
        return json($rs);

    }

    /**
     * 今日销量
     */

    public  function time1($device_id =null){
        $Order = new \app\admin\model\OrderInfo();
        //今日销量
        $all = $Order
            ->where('device_id',$device_id)
            ->whereTime('order_notify','d')
            ->where('order_status',2)
            ->where('order_detail !=""')
            ->field('order_detail')
            ->select()->toArray();



        //halt($all);
        $arr = [];
        foreach ($all as $k=>$v){
            $arr[] = json_decode($v['order_detail'],true);
            //$arr[] = $v['order_detail'];
        }
        //halt($arr);
        //合并数组
        $item=array();
        foreach ($arr as $k=>$v)
        {
            foreach ($v as $k1=>$v1)
            {
                $k1 = $v1['goodsId'];
                if(!isset($item[$k1])){
                    $item[$k1] =$v1;
                }else{
                    $item[$k1]['count'] +=$v1['count'];
                    if($item[$k1]['goodsId'] =="abnormal"){
                        $item[$k1]['name'] ="异常";
                        $item[$k1]['coupon'] ="60";
                        $item[$k1]['sum'] =$item[$k1]['count']*$item[$k1]['coupon'];
                    }
                    if($item[$k1]['goodsId'] =="unknow"){
                        $item[$k1]['name'] ="未知";
                        $item[$k1]['coupon'] ="3";
                        $item[$k1]['sum'] =$item[$k1]['count']*$item[$k1]['coupon'];
                    }
                }
            }
        }
        $item_keys =array_keys($item);
        $find_unknow1 = array_search('unknow',$item_keys); //查找里面有无unknow值
        if($find_unknow1 !==false)
        {
            array_splice($item_keys, $find_unknow1, 1); //去掉unknow
        }
        $find_unknow2 = array_search('abnormal',$item_keys); //查找里面有无abnormal值
        if($find_unknow2 !==false)
        {
            array_splice($item_keys, $find_unknow2, 1); //去掉abnormal
        }
        $find_unknow3 = array_search('未知',$item_keys); //查找里面有无“未知”值
        if($find_unknow3 !==false)
        {
            array_splice($item_keys, $find_unknow3, 1); //去掉abnormal
        }
        $goods_id = implode(',',$item_keys); //转成字符串

        $Device_goods =new \app\admin\model\DeviceGoods();
        $goods_price =$Device_goods ->where('goods_id in ('.$goods_id.')')->where('device_id = "'.$device_id.'"')
            ->field(['coupon','goods_id'])->select();
        $goods_price_temp = collection($goods_price)->toArray();//得到对应价格数组  无“未知”“unknow”“abnormal”的数组；
        $goods_price_target =[];
        foreach ($goods_price_temp as $k=>$v){
            $goods_price_target[$k]['coupon'] =$v['coupon'];
            $goods_price_target[$k]['goodsId'] =$v['goods_id'];
        }
        $temp =array_merge_recursive($goods_price_target,$item);//合并数组
        $target = [];
        foreach ($temp as $k=>$v)
        {
            $k = $v['goodsId'];
            if(!isset($target[$k])){
                $target[$k] =$v;
            }else{
                $target[$k]['count'] =abs($v['count']);
                $target[$k]['name'] =$v['name'];
                $target[$k]['sum'] = round($target[$k]['count']*$target[$k]['coupon'],2);
            }}
        // $item =json_encode($item,JSON_UNESCAPED_UNICODE);
        $count =  100;
        $rs = array(
            'code'  =>  0,
            'msg'   =>  '',
            'count' =>  $count,
            'data'  =>$target,

        );
        return json($rs);


    }

    /**
     * 昨日销量
     */

    public  function time2($device_id =null){
        $Order = new \app\admin\model\OrderInfo();
        //昨日销量
        $all = $Order
            ->where('device_id',$device_id)
            ->whereTime('order_notify','yesterday')
            ->where('order_status',2)
            ->where('order_detail !=""')
            ->field('order_detail')
            ->select()->toArray();



        //halt($all);
        $arr = [];
        foreach ($all as $k=>$v){
            $arr[] = json_decode($v['order_detail'],true);
            //$arr[] = $v['order_detail'];
        }
        //halt($arr);
        //合并数组
        $item=array();
        foreach ($arr as $k=>$v)
        {
            foreach ($v as $k1=>$v1)
            {
                $k1 = $v1['goodsId'];
                if(!isset($item[$k1])){
                    $item[$k1] =$v1;
                }else{
                    $item[$k1]['count'] +=$v1['count'];
                    if($item[$k1]['goodsId'] =="abnormal"){
                        $item[$k1]['name'] ="异常";
                        $item[$k1]['coupon'] ="60";
                        $item[$k1]['sum'] =$item[$k1]['count']*$item[$k1]['coupon'];
                    }
                    if($item[$k1]['goodsId'] =="unknow"){
                        $item[$k1]['name'] ="未知";
                        $item[$k1]['coupon'] ="3";
                        $item[$k1]['sum'] =$item[$k1]['count']*$item[$k1]['coupon'];
                    }
                }
            }
        }
        $item_keys =array_keys($item);
        $find_unknow1 = array_search('unknow',$item_keys); //查找里面有无unknow值
        if($find_unknow1 !==false)
        {
            array_splice($item_keys, $find_unknow1, 1); //去掉unknow
        }
        $find_unknow2 = array_search('abnormal',$item_keys); //查找里面有无abnormal值
        if($find_unknow2 !==false)
        {
            array_splice($item_keys, $find_unknow2, 1); //去掉abnormal
        }
        $find_unknow3 = array_search('未知',$item_keys); //查找里面有无“未知”值
        if($find_unknow3 !==false)
        {
            array_splice($item_keys, $find_unknow3, 1); //去掉abnormal
        }
        $goods_id = implode(',',$item_keys); //转成字符串

        $Device_goods =new \app\admin\model\DeviceGoods();
        $goods_price =$Device_goods ->where('goods_id in ('.$goods_id.')')->where('device_id = "'.$device_id.'"')
            ->field(['coupon','goods_id'])->select();
        $goods_price_temp = collection($goods_price)->toArray();//得到对应价格数组  无“未知”“unknow”“abnormal”的数组；
        $goods_price_target =[];
        foreach ($goods_price_temp as $k=>$v){
            $goods_price_target[$k]['coupon'] =$v['coupon'];
            $goods_price_target[$k]['goodsId'] =$v['goods_id'];
        }
        $temp =array_merge_recursive($goods_price_target,$item);//合并数组
        $target = [];
        foreach ($temp as $k=>$v)
        {
            $k = $v['goodsId'];
            if(!isset($target[$k])){
                $target[$k] =$v;
            }else{
                $target[$k]['count'] =abs($v['count']);
                $target[$k]['name'] =$v['name'];
                $target[$k]['sum'] = round($target[$k]['count']*$target[$k]['coupon'],2);
            }}
        // $item =json_encode($item,JSON_UNESCAPED_UNICODE);
        $count =  100;
        $rs = array(
            'code'  =>  0,
            'msg'   =>  '',
            'count' =>  $count,
            'data'  =>$target,

        );
        return json($rs);


    }

    /**
     * 近7日销量
     */

    public  function time3($device_id =null){
        $Order = new \app\admin\model\OrderInfo();
        //近7日销量
        $all = $Order
            ->where('device_id',$device_id)
            ->where('TO_DAYS( NOW( ) ) - TO_DAYS(order_notify)<7')
            ->where('order_status',2)
            ->where('order_detail !=""')
            ->field('order_detail')
            ->select()->toArray();



        //halt($all);
        $arr = [];
        foreach ($all as $k=>$v){
            $arr[] = json_decode($v['order_detail'],true);
            //$arr[] = $v['order_detail'];
        }
        //halt($arr);
        //合并数组
        $item=array();
        foreach ($arr as $k=>$v)
        {
            foreach ($v as $k1=>$v1)
            {
                $k1 = $v1['goodsId'];
                if(!isset($item[$k1])){
                    $item[$k1] =$v1;
                }else{
                    $item[$k1]['count'] +=$v1['count'];
                    if($item[$k1]['goodsId'] =="abnormal"){
                        $item[$k1]['name'] ="异常";
                        $item[$k1]['coupon'] ="60";
                        $item[$k1]['sum'] =$item[$k1]['count']*$item[$k1]['coupon'];
                    }
                    if($item[$k1]['goodsId'] =="unknow"){
                        $item[$k1]['name'] ="未知";
                        $item[$k1]['coupon'] ="3";
                        $item[$k1]['sum'] =$item[$k1]['count']*$item[$k1]['coupon'];
                    }
                }
            }
        }
        $item_keys =array_keys($item);
        $find_unknow1 = array_search('unknow',$item_keys); //查找里面有无unknow值
        if($find_unknow1 !==false)
        {
            array_splice($item_keys, $find_unknow1, 1); //去掉unknow
        }
        $find_unknow2 = array_search('abnormal',$item_keys); //查找里面有无abnormal值
        if($find_unknow2 !==false)
        {
            array_splice($item_keys, $find_unknow2, 1); //去掉abnormal
        }
        $find_unknow3 = array_search('未知',$item_keys); //查找里面有无“未知”值
        if($find_unknow3 !==false)
        {
            array_splice($item_keys, $find_unknow3, 1); //去掉abnormal
        }
        $goods_id = implode(',',$item_keys); //转成字符串

        $Device_goods =new \app\admin\model\DeviceGoods();
        $goods_price =$Device_goods ->where('goods_id in ('.$goods_id.')')->where('device_id = "'.$device_id.'"')
            ->field(['coupon','goods_id'])->select();
        $goods_price_temp = collection($goods_price)->toArray();//得到对应价格数组  无“未知”“unknow”“abnormal”的数组；
        $goods_price_target =[];
        foreach ($goods_price_temp as $k=>$v){
            $goods_price_target[$k]['coupon'] =$v['coupon'];
            $goods_price_target[$k]['goodsId'] =$v['goods_id'];
        }
        $temp =array_merge_recursive($goods_price_target,$item);//合并数组
        $target = [];
        foreach ($temp as $k=>$v)
        {
            $k = $v['goodsId'];
            if(!isset($target[$k])){
                $target[$k] =$v;
            }else{
                $target[$k]['count'] =abs($v['count']);
                $target[$k]['name'] =$v['name'];
                $target[$k]['sum'] = round($target[$k]['count']*$target[$k]['coupon'],2);
            }}
        // $item =json_encode($item,JSON_UNESCAPED_UNICODE);
        $count =  100;
        $rs = array(
            'code'  =>  0,
            'msg'   =>  '',
            'count' =>  $count,
            'data'  =>$target,

        );
        return json($rs);


    }

    /**
     * 自定义查询销量
     */

    public  function time4($device_id =null,$time =null){
        $Order = new \app\admin\model\OrderInfo();

        $time = explode(' - ',$time);
        //今日销量
        $all = $Order
            ->where('device_id',$device_id)
            ->whereTime('order_notify',$time)
            ->where('order_status',2)
            ->where('order_detail !=""')
            ->field('order_detail')
            ->select()->toArray();



        //halt($all);
        $arr = [];
        foreach ($all as $k=>$v){
            $arr[] = json_decode($v['order_detail'],true);
            //$arr[] = $v['order_detail'];
        }
        //halt($arr);
        //合并数组
        $item=array();
        foreach ($arr as $k=>$v)
        {
            foreach ($v as $k1=>$v1)
            {
                $k1 = $v1['goodsId'];
                if(!isset($item[$k1])){
                    $item[$k1] =$v1;
                }else{
                    $item[$k1]['count'] +=$v1['count'];
                    if($item[$k1]['goodsId'] =="abnormal"){
                        $item[$k1]['name'] ="异常";
                        $item[$k1]['coupon'] ="60";
                        $item[$k1]['sum'] =$item[$k1]['count']*$item[$k1]['coupon'];
                    }
                    if($item[$k1]['goodsId'] =="unknow"){
                        $item[$k1]['name'] ="未知";
                        $item[$k1]['coupon'] ="3";
                        $item[$k1]['sum'] =$item[$k1]['count']*$item[$k1]['coupon'];
                    }
                }
            }
        }
        $item_keys =array_keys($item);
        $find_unknow1 = array_search('unknow',$item_keys); //查找里面有无unknow值
        if($find_unknow1 !==false)
        {
            array_splice($item_keys, $find_unknow1, 1); //去掉unknow
        }
        $find_unknow2 = array_search('abnormal',$item_keys); //查找里面有无abnormal值
        if($find_unknow2 !==false)
        {
            array_splice($item_keys, $find_unknow2, 1); //去掉abnormal
        }
        $find_unknow3 = array_search('未知',$item_keys); //查找里面有无“未知”值
        if($find_unknow3 !==false)
        {
            array_splice($item_keys, $find_unknow3, 1); //去掉abnormal
        }
        $goods_id = implode(',',$item_keys); //转成字符串

        $Device_goods =new \app\admin\model\DeviceGoods();
        $goods_price =$Device_goods ->where('goods_id in ('.$goods_id.')')->where('device_id = "'.$device_id.'"')
            ->field(['coupon','goods_id'])->select();
        $goods_price_temp = collection($goods_price)->toArray();//得到对应价格数组  无“未知”“unknow”“abnormal”的数组；
        $goods_price_target =[];
        foreach ($goods_price_temp as $k=>$v){
            $goods_price_target[$k]['coupon'] =$v['coupon'];
            $goods_price_target[$k]['goodsId'] =$v['goods_id'];
        }
        $temp =array_merge_recursive($goods_price_target,$item);//合并数组
        $target = [];
        foreach ($temp as $k=>$v)
        {
            $k = $v['goodsId'];
            if(!isset($target[$k])){
                $target[$k] =$v;
            }else{
                $target[$k]['count'] =abs($v['count']);
                $target[$k]['name'] =$v['name'];
                $target[$k]['sum'] = round($target[$k]['count']*$target[$k]['coupon'],2);
            }}
        // $item =json_encode($item,JSON_UNESCAPED_UNICODE);
        $count =  100;
        $rs = array(
            'code'  =>  0,
            'msg'   =>  '',
            'count' =>  $count,
            'data'  =>$target,

        );
        return json($rs);


    }
    

}
