define([
    'js/app/controller/base',
    'js/app/util/ajax',
    'js/app/module/loading/loading',
    'js/app/module/validate/validate'
], function(base, Ajax, loading, Validate) {
    var code = base.getUrlParam("code");
    init();
    function init() {
        loading.createLoading();
        getCont();
        addListeners();

    }

    function getCont(){
        Ajax.get("807717", {
            ckey: "yuyuePic"
        }).then(function(res){
            loading.hideLoading();
            if(res.success){
                $("#content").html('<img src="'+base.getImg1(res.data.note)+'"/>');
            }else{
                base.showMsg(res.msg);
            }
        }, loading.hideLoading);
    }

    function addListeners() {
        var bookForm = $("#bookForm");
        $("#address").cityPicker({
            title: "选择省市县"
        });
        $("#ltDatetime").calendar();
        $("#ltDatetime").on("click", function(){
            $("#ltDatetime").focus().blur();
        });
        $("#address").on("click", function(){
            $("#address").focus().blur();
        });

        bookForm.validate({
            'rules': {
                applyName: {
                    required: true,
                    isNotFace: true
                },
                applyMobile: {
                    required: true,
                    mobile: true
                },
                address: {
                    required: true,
                    isNotFace: true,
                },
                ltAddress: {
                    required: true,
                    isNotFace: true,
                    maxlength: 255
                },
                ltDatetime: {
                    required: true
                },
                applyNote: {
                    isNotFace: true,
                    maxlength: 255
                }
            },
            onkeyup: false
        });

        $("#sbtn").on("click", function(){
            if(isVisibile()){
                if(bookForm.valid()){
                    var param = bookForm.serializeObject();
                    var addr = param.address.split(/\s/);
                    var province = addr[0], city = addr[1], area = addr[2];
                    if( province + "市" == city ){
                        province = city;
                    }
                    param.ltProvince = province;
                    param.ltCity = city;
                    param.ltArea = area;
                    param.applyUser = param.updater = base.getUserId();
                    book(param);
                }
            }else{
                $("#nameWrap")[0].scrollIntoView();
            }
        });
    }
    function isVisibile(){
        var $win = $(window), $wrap = $("#nameWrap");
        if($win.height() + $win.scrollTop() - $wrap.offset().top - $wrap.innerHeight() <= 0){
            return false;
        }
        return true;
    }

    function book(param){
        Ajax.post("620200", {json: param})
            .then(function(res){
                if(res.success){
                    base.showMsg("预约成功");
                    setTimeout(function(){
                        location.href = "/";
                    }, 1000);
                }else{
                    base.showMsg(res.msg);
                }
            }, function(){
                base.showMsg("预约失败");
            });
    }

})
