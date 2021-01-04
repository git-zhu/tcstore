<?php

namespace app\admin\model;

use think\Model;


class ActivityRecord extends Model
{

    

    

    // 表名
    protected $table = 'activity_record';
    
    // 自动写入时间戳字段
    protected $autoWriteTimestamp = false;

    // 定义时间戳字段名
    protected $createTime = false;
    protected $updateTime = false;
    protected $deleteTime = false;

    // 追加属性
    protected $append = [

    ];
    

    







/*    public function orderinfo()
    {
        return $this->belongsTo('OrderInfo', 'activity_id', 'activity_id', [], 'LEFT')->setEagerlyType(0);
    }*/
}
