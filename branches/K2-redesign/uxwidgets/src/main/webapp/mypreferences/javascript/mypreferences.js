var MyPreferences = {

	sites : null,
	favourites : null,

	doInit : function(){

		var content1 = document.getElementById("MyPreferences_content");
		document.body.appendChild(content1);

		$("#MyPreferences_icon").bind("click", function(ev, ui){
			var content = document.getElementById("MyPreferences_content");
			if (content.style.display != "none"){
				$("#MyPreferences_content").slideUp(200);
			} else {
				content.style.position = "absolute";
				content.style.left = $("#MyPreferences_icon").offset().left - 0 + "px";
				content.style.top = $("#MyPreferences_icon").offset().top + 20 + "px";
				content.style.zIndex = 200000;
				$("#MyPreferences_content").slideDown(200);
			}
			
		});

		$(jQuery(window)).bind("resize", function(e){
			var content = document.getElementById("MyPreferences_content");
			if (content.style.display != "none") {
				$("#MyPreferences_content").slideUp(200);
			}
		});
		
		$(jQuery(document.body)).bind("mouseup", function(e){
			var content = document.getElementById("MyPreferences_content");
			if (content.style.display != "none") {
				$("#MyPreferences_content").slideUp(200);
			}
		});

	}

}

MyPreferences.doInit();