$(function () {
    "use strict";




    /* ==========================================================================
   Preload
   ========================================================================== */

    $(window).load(function () {

        $("#status").fadeOut();

        $("#preloader").delay(300).fadeOut("fast");
    });


    /* ==========================================================================
   Background Slideshow images
   ========================================================================== */

    $(".main").backstretch([
        "img/bg-1.jpg",
        "img/bg-2.jpg"

    ], {
            fade: 750,
            duration: 4000
        });


    /* ==========================================================================
   On Scroll animation
   ========================================================================== */

    if ($(window).width() > 992) {
        new WOW().init();
    };


    /* ==========================================================================
   Fade On Scroll
   ========================================================================== */


    if ($(window).width() > 992) {

        $(window).on('scroll', function () {
            $('.main').css('opacity', function () {
                return 1 - ($(window).scrollTop() / $(this).outerHeight());
            });
        });
    };


    /* ==========================================================================
   Tweet
   ========================================================================== */


    $('.tweet').twittie({
        username: 'designstub', // change username here
        dateFormat: '%b. %d, %Y',
        template: '{{tweet}} {{user_name}}',
        count: 10
    }, function () {
        var item = $('.tweet ul');

        item.children('li').first().show().siblings().hide();
        setInterval(function () {
            item.find('li:visible').fadeOut(500, function () {
                $(this).appendTo(item);
                item.children('li').first().fadeIn(500);
            });
        }, 5000);
    });

    /* ==========================================================================
   countdown
   ========================================================================== */

    $('.countdown').downCount({
        date: '12/31/2117 12:00:00' // m/d/y
    });


    /* ==========================================================================
     sub form
     ========================================================================== */

    var $form = $('#mc-form');

    $('#mc-search').on('click', function (event) {
        if (event)
            event.preventDefault();
        var query = $('#search').val();
        if (!query || $.trim(query) == '') {
            $('#mc-notification').hide().html('<span class="alert">想啥呢.</span>').fadeIn("slow");
            return;
        }
        register($form);
    });

    function register($form) {
        $.ajax({
            type: $form.attr('method'),
            url: $form.attr('action'),
            data: $form.serialize(),
            cache: false,
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            error: function (err) {
                //$('#mc-notification').hide().html('<span class="alert">服务器繁忙,请稍候重试.</span>').fadeIn("slow");
                //$('#mc-notification').hide().html('<span class="alert"><i class="fa fa-exclamation-triangle"></i>你好</span>').fadeIn("slow");
                $('#mc-notification').hide().html('<span class="success"><i class="fa fa-envelope"></i><a class="search-item" href="http://www.baidu.com">无心法师2</a></span><br>'+
                '<span class="success"><i class="fa fa-envelope"></i><a class="search-item" href="https://www.gaiasys.cn">无心法师2</a></span>').fadeIn("slow");
            },
            success: function (data) {

                if (data.result != "success") {
                    var message = data.msg.substring(4);
                    $('#mc-notification').hide().html('<span class="alert"><i class="fa fa-exclamation-triangle"></i>' + message + '</span>').fadeIn("slow");

                } else {
                    var message = data.msg.substring(4);
                    $('#mc-notification').hide().html('<span class="success"><i class="fa fa-envelope"></i>' + 'Awesome! We sent you a confirmation email.' + '</span>').fadeIn("slow");

                }
            }
        });
    }

    $(document).on('click', '.search-item', function (e) {
        if (e) {
            e.preventDefault();
        }
        $('#player_div').removeClass('hide');
        $('#player_iframe').attr('src', $(this).attr('href'));
        mScroll('player_div');
    });



    function mScroll(id) { $("html,body").stop(true); $("html,body").animate({ scrollTop: $("#" + id).offset().top }, 500); }

    /* ==========================================================================
     Textrotator
     ========================================================================== */



    $(".rotate").textrotator({
        animation: "dissolve",
        separator: ",",
        speed: 30000
    });



    /* ==========================================================================
   ScrollTop Button
   ========================================================================== */


    $(window).scroll(function () {
        if ($(this).scrollTop() > 200) {
            $('.scroll-top a').fadeIn(200);
        } else {
            $('.scroll-top a').fadeOut(200);
        }
    });


    $('.scroll-top a').click(function (event) {
        event.preventDefault();

        $('html, body').animate({
            scrollTop: 0
        }, 1000);
    });



});
