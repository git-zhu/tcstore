<?php

namespace app\admin\controller;

use app\common\controller\Backend;
use think\Db;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use \PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

/**
 * 订单信息
 *
 * @icon fa fa-circle-o
 */
class OrderInfo extends Backend
{

    /**
     * OrderInfo模型对象
     * @var \app\admin\model\OrderInfo
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\OrderInfo;

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
            list($where, $sort, $order, $offset, $limit) = $this->buildparams(null,true);
            $auth = $this->auth->is_super;
            $userid = $this->auth->userid;
            if($auth ==1){
                $total = $this->model
                    ->alias('o')
                    ->with(['activityrecord'])
                    ->where($where)
                    ->order($sort, $order)
                    ->count();

                $list = $this->model
                    ->with(['activityrecord'])
                    ->where($where)
                    ->order($sort, $order)
                    ->limit($offset, $limit)
                    ->select();
            }elseif($auth == 2){
                $Administrator = new \app\admin\model\Administrator();
                $get_id = $Administrator->where('belong',$userid)->column('user_id');
                $total = $this->model
                    ->alias('o')
                    ->with(['activityrecord'])
                    ->where($where)
                    ->where('order_info.administrator_id','IN',$get_id)
                    ->order($sort, $order)
                    ->count();

                $list = $this->model
                    ->alias('o')
                    ->with(['activityrecord'])
                    ->where($where)
                    ->where('order_info.administrator_id','IN',$get_id)
                    ->order($sort, $order)
                    ->limit($offset, $limit)
                    ->select();
            }else{
                $total = $this->model
                    ->alias('o')
                    ->with(['activityrecord'])
                    ->where($where)
                    ->where('order_info.administrator_id ='.$userid)
                    ->order($sort, $order)
                    ->count();

                $list = $this->model

                    ->alias('o')
                    ->with(['activityrecord'])
                    ->where($where)
                    ->where('order_info.administrator_id ='.$userid)
                    ->order($sort, $order)
                    ->limit($offset, $limit)
                    ->select();

            }


            foreach ($list as $row) {
                $row->visible(['id','order_id','device_id','order_name','order_money','create_time','order_status','pay_way','video_detail']);
                $row->visible(['activityrecord']);
				$row->getRelation('activityrecord')->visible(['phone']);
            }
            $list = collection($list)->toArray();
            $result = array("total" => $total, "rows" => $list);

            return json($result);
        }
        return $this->view->fetch();
    }

    /**
     * 订单详情
     */
    public function detail($ids = null){
            $ordModel = $this->model;
            $order_info = $ordModel->where('id="' . $ids . '"')->find();
            $order_info['order_detail'] = json_decode($order_info['order_detail'], true);
            $order_info['video_detail'] = json_decode($order_info['video_detail'], true);
            $order_info['videoUrl'] = $order_info['video_detail']['videoUrl'];
            $detail = $order_info['order_detail'];
            if($detail !==NULL){
                foreach ($detail as $k=>$v){
                    $detail[$k]['count'] =0-$v['count'];
                    if($detail[$k]['goodsId'] =="abnormal"){
                        $detail[$k]['sum'] =$detail[$k]['count']*50;
                        $detail[$k]['goodsId'] = "异常";
                    }elseif ($detail[$k]['goodsId'] == "unknow"){
                        $detail[$k]['sum'] =$detail[$k]['count']*3;
                        $detail[$k]['goodsId'] = "未知";
                    }
                }
                $device_id =$order_info['device_id'];
                $goods = array_column($order_info['order_detail'],'goodsId'); //获取goodsId数组
                $find_unknow1 = array_search('unknow',$goods); //查找里面有无unknow值
                if($find_unknow1 !==false)
                {
                    array_splice($goods, $find_unknow1, 1); //去掉unknow
                }
                $find_unknow2 = array_search('abnormal',$goods); //查找里面有无abnormal值
                if($find_unknow2 !==false)
                {
                    array_splice($goods, $find_unknow2, 1); //去掉abnormal
                }
                $find_unknow3 = array_search('未知',$goods); //查找里面有无“未知”值
                if($find_unknow3 !==false)
                {
                    array_splice($goods, $find_unknow3, 1); //去掉abnormal
                }
                $goods_id = implode(',',$goods); //转成字符串
                //halt($goods_id);
                $device_goods =new \app\admin\model\DeviceGoods();
                if(!empty($goods_id)){
                    $goods_price =$device_goods ->where('goods_id in ('.$goods_id.')')->where('device_id = "'.$device_id.'"')
                        ->field(['coupon','goods_id'])->select();
                    $goods_price = collection($goods_price)->toArray();//得到对应价格数组
                    $arr =[];
                    foreach ($goods_price as $k=>$v){
                        $arr[$k]['coupon'] =$v['coupon'];
                        $arr[$k]['goodsId'] =$v['goods_id'];

                    }

                    $temp =array_merge($arr,$detail);
                    $order_detail=array();
                    foreach ($temp as $k=>$v)
                    {
                        $k = $v['goodsId'];
                        if(!isset($order_detail[$k])){
                            $order_detail[$k] =$v;
                        }else{
                            $order_detail[$k]['count'] =$v['count'];
                            $order_detail[$k]['name'] =$v['name'];
                            $order_detail[$k]['sum'] = $order_detail[$k]['count']*$order_detail[$k]['coupon'];
                        }

                    }
                }else{
                    //有且仅有未知商品的情况
                    $order_detail = $detail;
                }
            }else{
                $order_detail = $detail;
            }
            $this->assign('order_detail',$order_detail);
            $this->assign('order_info',$order_info);
        //dump($order_info);
        return $this->view->fetch();
    }

    /**
     * 编辑
     */
    public function edit($ids = null){
        $row = $this->model->get($ids);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        $this->assignconfig("order_id",$row->order_id);
        return parent::edit($ids);
    }

    /**
     * 导出订单
     */

    public function export()
    {
        if ($this->request->isPost()) {
            set_time_limit(0);
            $search = $this->request->post('search');
            $ids = $this->request->post('ids');
            $filter = $this->request->post('filter');
            $op = $this->request->post('op');
            $columns = $this->request->post('columns');

            $excel = new Spreadsheet();

            $excel->getProperties()
                ->setTitle("订单数据")
                ->setSubject("Subject");
            $excel->getDefaultStyle()->getFont()->setName('Microsoft Yahei');
            $excel->getDefaultStyle()->getFont()->setSize(12);



            $excel->getDefaultStyle()->applyFromArray(
                array(
                    'fill'      => array(
                        'type'  => Fill::FILL_SOLID,
                        'color' => array('rgb' => '000000')
                    ),
                    'font'      => array(
                        'color' => array('rgb' => "000000"),
                    ),
                    'alignment' => array(
                        'vertical'   => Alignment::VERTICAL_CENTER,
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'indent'     => 1
                    ),
                    'borders'   => array(
                        'allborders' => array('style' => Border::BORDER_THIN),
                    )
                ));



            $excel->getActiveSheet()->getColumnDimension('A')->setWidth(22);
            $excel->getActiveSheet()->getColumnDimension('B')->setWidth(10);
            $excel->getActiveSheet()->getColumnDimension('C')->setWidth(10);
            $excel->getActiveSheet()->getColumnDimension('D')->setWidth(10);
            $excel->getActiveSheet()->getColumnDimension('E')->setWidth(25);
            $excel->getActiveSheet()->getColumnDimension('F')->setWidth(15);
            $excel->getActiveSheet()->getColumnDimension('G')->setWidth(25);
            $excel->getActiveSheet()->getColumnDimension('H')->setWidth(15);

            $worksheet = $excel->setActiveSheetIndex(0);
            $worksheet->setTitle('订单列表');

            $whereIds = $ids == 'all' ? '1=1' : ['id' => ['in', explode(',', $ids)]];
            $this->request->get(['search' => $search, 'ids' => $ids, 'filter' => $filter, 'op' => $op]);
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

            $line = 1;
            $list = [];
            $this->model
                ->field(['id','order_id','device_id','order_name','order_money','create_time','order_status','pay_way','video_detail'])
                ->where($where)
                ->where($whereIds)
                ->chunk(100, function ($items) use (&$list, &$line, &$worksheet) {
                    $styleArray = array(
                        'font' => array(
                            'color' => array('rgb' => '000000'),
                            'size'  => 12,
                            'name'  => 'Verdana'
                        ));
                    $list = $items = collection($items)->toArray();

                    foreach ($items as $key => $v) {

                        foreach ($v as $k => $ele) {
                            $tmparray = explode("_text",$k);
                            if(count($tmparray)>1){
                                $items[$key][$tmparray[0]] = $ele;
                                unset($items[$key][$k]);
                            }
                        }
                    }

                });

            $first = array_keys($list[0]);
            foreach ($first as $k => $ele) {
                $tmparray = explode("_text",$ele);
                if(count($tmparray)>1){
                    unset($first[$k]);
                }
            }


            $excel->createSheet();
            // Redirect output to a client’s web browser (Excel2007)
            $title = "订单数据".date("YmdHis");
            header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            header('Content-Disposition: attachment;filename="' . $title . '.xlsx"');
            header('Cache-Control: max-age=0');
            // If you're serving to IE 9, then the following may be needed
            header('Cache-Control: max-age=1');

            // If you're serving to IE over SSL, then the following may be needed
            header('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); // Date in the past
            header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT'); // always modified
            header('Cache-Control: cache, must-revalidate'); // HTTP/1.1
            header('Pragma: public'); // HTTP/1.0


            $objWriter = IOFactory::createWriter($excel, 'Xlsx');
            $objWriter->save('php://output');
            return;
        }
    }


}
