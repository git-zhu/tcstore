<?php

namespace app\admin\model;

use think\Model;


class AutoWithdrawalSettled extends Model
{

    

    

    // 表名
    protected $table = 'auto_withdrawal_settled';
    
    // 自动写入时间戳字段
    protected $autoWriteTimestamp = true;

    // 定义时间戳字段名
    protected $createTime = 'create_time';
    protected $updateTime = 'update_time';
    protected $deleteTime = false;

    // 追加属性
    protected $append = [

    ];






    public function administrator()
    {
        return $this->belongsTo('Administrator', 'administrator_id', 'user_id', [], 'LEFT')->setEagerlyType(0);
    }



}
