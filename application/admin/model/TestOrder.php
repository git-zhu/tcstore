<?php

namespace app\admin\model;

use think\Model;


class TestOrder extends Model
{

    

    

    // 表名
    protected $table = 'order_info';
    
    // 自动写入时间戳字段
    protected $autoWriteTimestamp = false;

    // 定义时间戳字段名
    protected $createTime = false;
    protected $updateTime = false;
    protected $deleteTime = false;

    // 追加属性
    protected $append = [

    ];
    

    







    public function tcorderdetail()
    {
        return $this->belongsTo('TcOrderDetail', 'order_id', 'order_id', [], 'LEFT')->setEagerlyType(0);
    }
}
