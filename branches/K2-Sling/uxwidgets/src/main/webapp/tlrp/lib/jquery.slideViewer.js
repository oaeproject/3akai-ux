jQuery(function(){
   jQuery("div.svw").prepend("<img src='svwloader.gif' class='ldrgif' alt='loading...'/ >"); 
});
var j = 0;
var quantofamo = 0;
jQuery.fn.slideView = function(settings) {
	  settings = jQuery.extend({
     easeFunc: "easeInOutExpo",
     easeTime: 750,
     toolTip: false
  }, settings);
	return this.each(function(){
		var container = jQuery(this);
		container.find("img.ldrgif").remove(); // removes the preloader gif
		container.removeClass("svw").addClass("stripViewer");		
		var pictWidth = container.find("img").width();
		var pictHeight = container.find("img").height();
		var pictEls = container.find("li").size();
		var stripViewerWidth = pictWidth*pictEls;
		container.find("ul").css("width" , stripViewerWidth); //assegnamo la larghezza alla lista UL	
		container.css("width" , pictWidth);
		container.css("height" , pictHeight);
		container.each(function(i) {
			jQuery(this).after("<div class='stripTransmitter' id='stripTransmitter" + (j) + "'><ul><\/ul><\/div>");
			jQuery(this).find("li").each(function(n) {
						jQuery("div#stripTransmitter" + j + " ul").append("<li><a title='" + jQuery(this).find("img").attr("alt") + "' href='#'>"+(n+1)+"<\/a><\/li>");												
				});
			jQuery("div#stripTransmitter" + j + " a").each(function(z) {
				jQuery(this).bind("click", function(){

				jQuery(this).addClass("current").parent().parent().find("a").not(jQuery(this)).removeClass("current"); // wow!
				var cnt = -(pictWidth*z);
				container.find("ul").animate({ left: cnt}, settings.easeTime, settings.easeFunc);
				return false;
				   });
				});
			
			
				// next image via image click	14/01/2009
				jQuery("div#stripTransmitter" + j + " a").parent().parent().parent().prev().find("img").each(function(z) {
				jQuery(this).bind("click", function(){
					var ui 	= 	jQuery(this).parent().parent().parent().next().find("a");
					if(z+1 < pictEls){
						ui.eq(z+1).trigger("click");
					}
					else ui.eq(0).trigger("click");
				   });
				});
				
				
			jQuery("div#stripTransmitter" + j).css("width" , pictWidth);
			jQuery("div#stripTransmitter" + j + " a:first").addClass("current");
			if(settings.toolTip){
			container.next(".stripTransmitter ul").find("a").Tooltip({
				track: true,
				delay: 0,
				showURL: false,
				showBody: false
				});
			}
			});
		j++;
  });	
};

sdata.widgets.WidgetLoader.informOnLoad("tlrp");