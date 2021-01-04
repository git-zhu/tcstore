<?php

namespace app\admin\validate;

use think\Validate;

class Administrator extends Validate
{
    /**
     * 验证规则
     */
    protected $rule = [
        'user_name' => 'require|regex:\w{3,16}|unique:administrator',
    ];
    /**
     * 提示消息
     */
    protected $message = [
    ];
    /**
     * 验证场景
     */
    protected $scene = [
        'add'  => [],
        'edit' => [],
        'admin_add' => ['user_name']
    ];
    
}
