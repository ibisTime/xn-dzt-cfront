define([
    'js/app/controller/base',
    'js/app/util/ajax',
    'js/app/module/loading/loading',
    'js/app/module/validate/validate'
], function(base, Ajax, loading, Validate) {
    var accountNumber;
    init();
    function init(){
        loading.createLoading();
        addListeners();
        getInitData();
    }
    function getInitData() {
        $.when(
            getAccountList(),
            getBankCardList()
        ).then(loading.hideLoading);
    }
    // 获取银行卡列表
    function getBankCardList(){
        Ajax.get("802016", {
            userId: base.getUserId(),
            status: "1"
        }).then(function(res){
            if(res.success){
                if(res.data.length){
                    var html = "";
                    $.each(res.data, function(i, item){
                        html += '<option value='+item.bankcardNumber+'>'+item.bankName+' - '+item.bankcardNumber+'</option>';
                    });
                    $("#bankcardNumber").html(html).trigger("change");
                }else{
                    $("#bankcardNumber").remove();
                    addGoBankCardListener();
                }
            }else{
                base.showMsg(res.msg);
                addGoBankCardListener();
            }
        });
    }
    function addGoBankCardListener(){
        $("#addBankCard").on('click', function(){
            location.href = './add_bankcard.html';
        });
    }
    // 获取账户信息
    function getAccountList() {
        return Ajax.get("802503", {
            userId: base.getUserId()
        }).then(function (res) {
            if(res.success && res.data.length){
                var data = res.data;
                $.each(data, function (i, d) {
                    if(d.currency == "CNY"){
                        accountNumber = d.accountNumber;
                    }
                });
            }else{
                res.msg && base.showMsg(res.msg);
            }
        }, function () {
            base.showMsg("账户信息获取失败");
        });
    }
    function addListeners(){
        $("#chargeForm").validate({
            'rules': {
                bankcardNumber: {
                    required: true
                },
                transAmount: {
                    required: true,
                    "Z+": true
                }
            },
            onkeyup: false
        });
        $("#sbtn").on("click", function(){
            if($("#chargeForm").valid()){
                charge();
            }
        });
        $("#bankcardNumber").on("change", function(){
            $("#bankCardSpan").html($("#bankcardNumber").val());
        });
    }
    // 充值
    function charge(){
        loading.createLoading("提交中...");
        var param = $("#chargeForm").serializeObject();
        param.bizNote = '1';
        param.accountNumberList = [accountNumber];
        param.transAmount = +param.transAmount * 1000;
        Ajax.post("802510", {json: param})
            .then(function(res){
                loading.hideLoading();
                if(res.success){
                    base.showMsg("操作成功");
                    setTimeout(function(){
                        history.back();
                    }, 1000);
                }else{
                    base.showMsg(res.msg);
                }
            });
    }
})
