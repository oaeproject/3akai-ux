/*
  jQuery AutoLink
  MIT License

  Sakai OAE Notes: below
  This was originally taken from here: https://gist.github.com/47317 
  on July 29, 2011.

  We have made a few changes, such as fixing a syntax error, changing the
  replace link to use Sakai OAE styles, and adding a check for if parent is
  undefined.

  Eventually, given some time, I would like to see the url_regexp expanded to
  included other schemes, and www. style links with no scheme. ( Such as in
  the O'Reilly Regular Expression Cookbook 7.2 ).

*/

(function($) {
    var url_regexp = /(https?:\/\/[\u007F-\uFFFF-A-Za-z0-9\~\/._\?\&=\-%#\+:\;,\@\']+)/;
    $.fn.autolink = function() {
        return this.each(function(){
            var desc = $(this);
            desc.textNodes().each(function(){
                var text = $(this);
                var parent = text.parent();
                if(parent && parent.get(0).nodeName != 'A') {
                    text.replaceWith(this.data.replace(url_regexp, function($0, $1) {
                        return '<a class=\'my_link s3d-regular-links s3d-bold\' target=\'_blank\' href="' + $1 +'">' + $1 + '</a>';
                    }));
                }
            });
        });
    };

    $.fn.textNodes = function() {
        var ret = [];

        (function(el) {
            if (!el) {
                return;
            }
            if ((el.nodeType == 3)) {
                ret.push(el);
            } else {
                for (var i=0; i < el.childNodes.length; ++i) {
                    arguments.callee(el.childNodes[i]);
                }
            }
        })(this[0]);
        return $(ret);
    };
})(jQuery);
