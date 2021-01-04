define(['layui'], function (undefined) {

    var Controller = {
        index: function () {
            layui.use('element', function(){
                var element = layui.element;


            })

        },
        get_money: function () {
            layui.use('form',function () {
                var form =layui.form;

            })


        }
    };
    return Controller;
});