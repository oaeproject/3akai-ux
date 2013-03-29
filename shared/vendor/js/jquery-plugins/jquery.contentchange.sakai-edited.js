/**
* Contentchange plugin
*
* Copyright (c) 2010 Sebastián Grignoli (http://stackoverflow.com/users/290221/sebastian-grignoli)
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*
*/

/**
* Detect change of HTML/text in a given jQuery object
*
* @example $("div").contentChange(function(){debug.log("Change detected!")});
* @desc Detects a change in any div
*
*
* @name $.contentchange
* @cat Plugins/Content
* @author Sebastián Grignoli
* http://stackoverflow.com/questions/3233991/jquery-watch-div
*/
define(['jquery'], function (jQuery) {
    jQuery.fn.contentChange = function(callback){
      var elms = jQuery(this);
      elms.each(
        function(i){
          var elm = jQuery(this);
          elm.data("lastContents", elm.html());
          window.watchContentChange = window.watchContentChange ? window.watchContentChange : [];
          window.watchContentChange.push({"element": elm, "callback": function(){callback(elm)}});
        }
      )
      return elms;
    };
    setInterval(function(){
      if(window.watchContentChange){
        for( i in window.watchContentChange){
          if(window.watchContentChange[i] && window.watchContentChange[i].element && window.watchContentChange[i].element.data("lastContents") != window.watchContentChange[i].element.html()){
            window.watchContentChange[i].callback.apply(window.watchContentChange[i].element);
            window.watchContentChange[i].element.data("lastContents", window.watchContentChange[i].element.html())
          };
        }
      }
    },500);
});
