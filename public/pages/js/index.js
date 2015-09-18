var slider = function (params) {
    var defaults = {
        durtion: 5000
    }
    var len = $(".banner-img>ul>li").length;
    var index = 1;
    var adTimer = null;
    //默认第一个显示
    $(".banner-img>ul>li").eq(0).addClass("select");
    setTimeout(function () {
        $(".banner-img>ul>li").eq(0).find("img").addClass("active");
    }, 400)
    $(".point>span").eq(0).addClass("select");

    function showImg(index) {
        $(".banner-img>ul>li").eq(index).siblings().find("img").removeClass("active");
        setTimeout(function () {
            $(".banner-img>ul>li").removeClass("select").eq(index).addClass("select");
        }, 300)
        setTimeout(function () {
            $(".banner-img>ul>li").eq(index).find("img").addClass("active");
        }, 600)
        $(".point>span").removeClass("select").eq(index).stop(true, true).addClass("select");
    }

    $(".point>span").click(function () {
        index = $(".point>span").index(this)
        showImg(index);
    });

    function autoStart() {
        adTimer = setInterval(function () {
            showImg(index);
            index++;
            if (index == len) { index = 0; }

        }, defaults.durtion);
    }
    autoStart();
}
slider = new slider();

//微信营销方法
$(".wsy-main-con1>div").hover(function () {
    $(this).addClass("active").siblings().removeClass("active");
})

//解决方案
var sliderSolution = function (params) {
    var lensolution = $(".top-classify>ul>li").length;
    var widSo = $(".wsy-solution-main>ul>li").width();
    $(".wsy-solution-main>ul").width(widSo * lensolution);
    var step = -1;
    var soTimer = null;
    var defopt = {
        durtion: 5000
    }
    //默认第一个显示
    $(".top-classify>ul>li").eq(0).addClass("current");
    function showimg(nindex) {
        step = nindex;
        window.clearTimeout(soTimer);
        $(".top-classify>ul>li").eq(nindex).addClass("current").siblings().removeClass("current");
        $(".wsy-solution-main>ul").stop(true, true).animate({ "left": -nindex * widSo }, 500);
        soTimer = window.setTimeout(autoMove, 5000);
    }
    function autoMove() {
        step++;
        if (step >= lensolution) {
            step = 0;
        }
        $(".wsy-solution-main>ul").stop(true, true).animate({ "left": -step * widSo }, 500);
        $(".top-classify>ul>li").eq(step).addClass("current").siblings().removeClass("current");
        soTimer = window.setTimeout(autoMove, 5000);
    }
    autoMove();
    $(".top-classify>ul>li").click(function () {
        var indexii = $(this).index();
        showimg(indexii);
    })
    $(".solution-arrow-left").click(function () {
        if (step == 2) {
            step = -1;
        }
        step++;
        showimg(step);
    })
    $(".solution-arrow-right").click(function () {
        if (step == 0) {
            step = 3;
        }
        step--;
        showimg(step);
    })

}
sliderSolution = new sliderSolution();

var swiper = new Swiper('.slider-case', {
    pagination: '.case-pagination',
    slidesPerView: 3,
    slidesPerColumn: 1,
    paginationClickable: true,
    spaceBetween: 30,
    autoplay: 4000,
    autoplayDisableOnInteraction: false
});

$.fn.smartFloat = function () {
    var position = function (element) {
        $(window).scroll(function () {
            $('#ding').removeClass('yincang');
            var scrolls = $(this).scrollTop();
            if (window.XMLHttpRequest) {
                element.css({
                    position: "fixed",
                    top: 0
                });
            } else {
                element.css({
                    top: scrolls
                });
            }
        });
    };
    return $(this).each(function () {
        position($(this));
    });
};
//绑定
$(".nav").smartFloat();




$("#login-index").click(function(){
    $("#loginBox").addClass("on1");
    return false;
})

$(".login-cover").click(function(){
    $("#loginBox").removeClass("on1");
})


$('#login').click(function () {
    var model = {
        emailID: $('#emailID').val().trim(),
        passwordStr : $('#passwordStr').val().trim()
    };

    $.ajax({
        url:'/api/account/login',
        type:'post',
        data: model,
        success: function (data) {
            if (data.status == 200 && data.data) {
                window.localStorage['user'] = JSON.stringify(data.data);
                window.location.href = '/index.html#/home';
            } else {
                alert(data.message);
            }
        },error:function(){
            alert('error');
        }
    });
})
