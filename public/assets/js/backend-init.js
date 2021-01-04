define(['backend', 'table'], function (Backend, Table) {

    //引入layui模块
    require.config({
        paths: {
            'layui': '../libs/layui/layui',
        },
        shim: {
            'layui': {
                deps: ['css!../libs/layui/css/layui.css'],
                exports: "layui"
            }
        }
    });


    /*! 注册 data-tips-image 事件行为
    * 点击图片放大
    * */
    $('body').on('click', '[data-tips-image]', function () {
        var img = new Image();
        var imgWidth = this.getAttribute('data-width') || '240px';
        img.onload = function () {
            var $content = $(img).appendTo('body').css({background: '#fff', width: imgWidth, height: 'auto'});
            Layer.open({
                type: 1, area: imgWidth, title: false, closeBtn: 1,
                skin: 'layui-layer-nobg', shadeClose: true, content: $content,
                end: function () {
                    $(img).remove();
                },
                success: function () {

                }
            });
        };
        img.onerror = function (e) {

        };
        img.src = this.getAttribute('data-tips-image') || this.src;
    });

    Table.api.formatter.image =  function(value){
        return "<a href='javascript:void(0)' data-tips-image='"+value+"'><img src='"+value+"' class='img-sm img-center' ></a>";
    };
});