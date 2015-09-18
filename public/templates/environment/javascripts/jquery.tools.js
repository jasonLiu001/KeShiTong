///<reference path="jquery-1.10.2.min.js">
///<reference path="jquery.validate-vsdoc.js">
(function($) {
    $.fn.extend({
        tabs: function(options) {
                var defaultOptions = {
                    content: '',
                    nomalCss: '',
                    currentCss: '',
                    autoChange: false,
                    interval: 2000,
                    callback:null
                };
                var opts = $.extend({}, defaultOptions, options);
                var $this = $(this);
                $this.find(">ul>li").click(function() {
                    var i = $(this).index();
                    $this.find(">ul>li").attr("class", opts.nomalCss);
                    $(this).attr("class", opts.currentCss);
                    $(opts.content).find(">ul>li").hide();
                    $(opts.content).find(">ul>li:eq(" + i + ")").show();
                    if(opts.callback)
                    {
                        opts.callback(i);
                    }
                });
                $(opts.content).find(">ul>li:eq(0)").show();
            } //tab页

    })
})(jQuery);