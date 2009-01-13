var SiteSwitcher = {

	sites : null,
	favourites : null,

	doInit : function(){

		var content1 = document.getElementById("SiteSwitcher_content");
		document.body.appendChild(content1);

		$("#SiteSwitcher_icon").bind("click", function(ev, ui){
			var content = document.getElementById("SiteSwitcher_content");
			if (content.style.display != "none"){
				$("#SiteSwitcher_content").slideUp(200);
			} else {
				content.style.position = "absolute";
				content.style.left = $("#SiteSwitcher_icon").offset().left - 0 + "px";
				content.style.top = $("#SiteSwitcher_icon").offset().top + 20 + "px";
				content.style.zIndex = 200000;
				$("#SiteSwitcher_content").slideDown(200);
			}
			
		});

		$(jQuery(window)).bind("resize", function(e){
			var content = document.getElementById("SiteSwitcher_content");
			if (content.style.display != "none") {
				$("#SiteSwitcher_content").slideUp(200);
			}
		});
		
		$(jQuery(document.body)).bind("mouseup", function(e){
			var content = document.getElementById("SiteSwitcher_content");
			if (content.style.display != "none") {
				$("#SiteSwitcher_content").slideUp(200);
			}
		});

	}

}

SiteSwitcher.doInit();