var sakai = sakai || {};

sakai._changepic = {};
sakai.changepic = function(tuid, placement, showSettings){

	var realw = 0;
	var realh = 0;
	var picture = false;
	var ratio = 1;

	function preview(img, selection){
		
		$("#thumbnail_real_container").hide();
		
		bigSelection = selection;
		var scaleX = 100 / selection.width;
		var scaleY = 100 / selection.height;
		
		$("#parameters").val('{"urlImgtoCrop" : "/_private/D0/33/admin/P1000361.JPG", "urlSaveIn" : "/_private/D0/33/admin/", "x" : ' + selection.x1 + ', "y" : ' + selection.y1 + ', "width" : ' + selection.width + ', "height" : ' + selection.height + ', "dimensions" : [{"width" : 256, "height" : 256}, {"width" : 32, "height" : 32}, {"width":60,"height":60}]}');
		
		$('#thumbnail').css({
			width: Math.round(scaleX * img.width) + 'px',
			height: Math.round(scaleY * img.height) + 'px',
			marginLeft: '-' + Math.round(scaleX * selection.x1) + 'px',
			marginTop: '-' + Math.round(scaleY * selection.y1) + 'px'
		});
		
	}
	
	sakai._changepic.doInit = function(){
	
		// Check whether there is a base picture at all
		
		var me = sdata.me;
		var json = me.profile;
		
		picture = false;

		$("#changepic_form").attr("action","/sdata/f/_private" + me.userStoragePrefix);
		
		if (json.picture) {
		
			picture = json.picture;
			
		}
		
		if (picture && picture._name) {
			
			if (picture.name){
				$("#thumbnail_real").attr("src","/sdata/f/_private" + me.userStoragePrefix + picture.name);
			}
			
			$("#changepic_select").show();
		
			$("#picture_measurer").html("<img src='/sdata/f/_private" + me.userStoragePrefix + picture._name + "' id='picture_measurer_image' />");
			
			// Check the current picture's size
			
			$("#picture_measurer_image").bind("load", function(ev){
				realw = $("#picture_measurer_image").width();
				realh = $("#picture_measurer_image").height();
				
				// Width > 500 ; Height < 300 => Width = 500
				
				if (realw > 500 && (realh / (realw / 500) < 300)){
					ratio = realw / 500;
					$("#changepic_fullpicture").attr("src", "/sdata/f/_private" + me.userStoragePrefix + picture._name);
					$("#changepic_fullpicture").attr("width","500");
					
				// Width < 500 ; Height > 300 => Height = 300
				
				} else if (realh > 300 && (realw / (realh / 300) < 500)) {
					ratio = realh / 300;
					$("#changepic_fullpicture").attr("src", "/sdata/f/_private" + me.userStoragePrefix + picture._name);
					$("#changepic_fullpicture").attr("height", "300");
					
				// Width > 500 ; Height > 300
				
				} else if (realh > 300 && (realw / (realh / 300) > 500)) {
					
					var heightonchangedwidth = realh / (realw / 500);
					if (heightonchangedwidth > 300){
						ratio = realh / 300;
						$("#changepic_fullpicture").attr("src", "/sdata/f/_private" + me.userStoragePrefix + picture._name);
						$("#changepic_fullpicture").attr("height", "300");	
					} else {
						ratio = realw / 500;
						$("#changepic_fullpicture").attr("src", "/sdata/f/_private" + me.userStoragePrefix + picture._name);
						$("#changepic_fullpicture").attr("width", "500");
					}
						
				} else {
					$("#changepic_fullpicture").attr("src", "/sdata/f/_private" + me.userStoragePrefix + picture._name);
				} 
				$("#thumbnail").attr("src", "/sdata/f/_private" + me.userStoragePrefix + picture._name);
				
				$('#changepic_fullpicture').imgAreaSelect({ 
					selectionColor: 'white',
					aspectRatio: "1:1",
					onSelectEnd: preview,
					hide: false,
					disable: false
				});
				
			});
			
			showSelectTab();
			
		}
		else {
		
			$("#changepic_select").hide();
			showNewTab();
		
		}
		
		/*  */
		
	}
	
	var bigSelection = false;
	
	$("#changepic_select").bind("click", function(ev){
		sakai._changepic.doInit();
	});
	
	$("#save_new_selection").bind("click", function(ev){
		
		var tosave = {};
		tosave["urlImgtoCrop"] = "/_private" + me.userStoragePrefix + picture._name; 
		tosave["urlSaveIn"] = "/_private" + me.userStoragePrefix;
		tosave["x"] = Math.floor(bigSelection.x1 * ratio);
		tosave["y"] = Math.floor(bigSelection.y1 * ratio);
		tosave["height"] = Math.floor(bigSelection.height * ratio);
		tosave["width"] = Math.floor(bigSelection.width * ratio);
		tosave["dimensions"] = [{"width":256,"height":256}];
		
		var data = {
			parameters : sdata.JSON.stringify(tosave)
		}
		
		// Post all of this to the server
		
		sdata.Ajax.request({
			url: "/_rest/image/cropit",
			httpMethod: "POST",
			onSuccess: function(data){
				
				var tosave = {
					"name": "256x256_" + picture._name,
					"_name": picture._name
				};
				
				var stringtosave = sdata.JSON.stringify(tosave);
				var data = {"picture":stringtosave};
				
				sdata.me.profile.picture = tosave;
				
				// $("#picture_holder").html("<img src='/sdata/f/_private/" + profileinfo_userId + "/" + resp.uploads.file.name + "' width='250px'/>");
				
				var a = ["u"];
				var k = ["picture"];
				var v = [stringtosave];
				
				var tosend = {"k":k,"v":v,"a":a};
				
				sdata.Ajax.request({
		        	url :"/rest/patch/f/_private" + me.userStoragePrefix + "profile.json",
		        	httpMethod : "POST",
		            postData : tosend,
		            contentType : "application/x-www-form-urlencoded",
		            onSuccess : function(data) {
						
						$("#picture_holder").html("<img src='/sdata/f" + "/_private" + me.userStoragePrefix + tosave.name + "?sid=" + Math.random() + "'/>");
						$("#profile_picture").css("text-indent","0px");
						$("#profile_picture").html("<img src='/sdata/f" + "/_private" + me.userStoragePrefix + tosave.name + "?sid=" + Math.random() + "' height='60px' width='60px'/>");
						$("#changepic_container").jqmHide();
						
					},
					onFail : function(data){
						alert("An error has occured");
					}
				});
				
			},
			onFail : function(data){
				alert("An error has occured");
			},
			postData: data,
			contentType: "application/x-www-form-urlencoded"
		});
		
	});
	
	var hideArea = function(hash){
		$('#changepic_fullpicture').imgAreaSelect({ 
			hide: true,
			disable: true
		});
		
		hash.w.hide();
		hash.o.remove();
	}
	
	var showArea = function(hash){
		sakai._changepic.doInit();
		hash.w.show();
	}
	
	$("#changepic_container").jqm({
		modal: true,
		trigger: $('#changepic_container_trigger'),
		overlay: 20,
		toTop: true,
		onHide: hideArea,
		onShow: showArea
	});
	
	var showNewTab = function(){
		
		$('#changepic_fullpicture').imgAreaSelect({ 
			hide: true,
			disable: true
		});
				
		
		$("#changepic_select").removeClass("fl-activeTab");
		$("#changepic_select").removeClass("search_tab_selected");
			
		$("#changepic_upload").addClass("search_tab_selected");
		$("#changepic_upload").addClass("fl-activeTab");
			
		$("#changepic_selectpicture").hide();
		$("#changepic_uploadnew").show();
	}
	
	var showSelectTab = function(){				
		
		$("#changepic_select").addClass("fl-activeTab");
		$("#changepic_select").addClass("search_tab_selected");
			
		$("#changepic_upload").removeClass("search_tab_selected");
		$("#changepic_upload").removeClass("fl-activeTab");
			
		$("#changepic_selectpicture").show();
		$("#changepic_uploadnew").hide();
	}
	
	$("#changepic_upload").bind("click", function(ev){
		showNewTab();
	});
	
};


	
sakai._changepic.startCallback = function(){
	return true;
}
	
sakai._changepic.completeCallback = function(response){
	
	response = response.replace(/<pre[^>]*>/ig,"").replace(/<\/pre[^>]*>/ig,"");
	var resp = eval('(' + response + ')');
	var tosave = {
		"_name": resp.uploads.file.name
	};
		var stringtosave = sdata.JSON.stringify(tosave);
		var data = {"picture":stringtosave};
		
		// $("#picture_holder").html("<img src='/sdata/f/_private/" + profileinfo_userId + "/" + resp.uploads.file.name + "' width='250px'/>");
		
		var a = ["u"];
		var k = ["picture"];
		var v = [stringtosave];
		
		var tosend = {"k":k,"v":v,"a":a};
		
		sdata.me.profile.picture = tosave;
		
		sdata.Ajax.request({
        	url :"/rest/patch/f/_private" + me.userStoragePrefix + "profile.json",
        	httpMethod : "POST",
            postData : tosend,
            contentType : "application/x-www-form-urlencoded",
            onSuccess : function(data) {
				
				sakai._changepic.doInit();
				
			},
			onFail : function(data){
				alert("An error has occured");
			}
		});
	}
	

var AIM = {

    frame : function(c) {

		//alert("frame");
        var n = 'f' + Math.floor(Math.random() * 99999);
        var d = document.createElement('DIV');
        d.innerHTML = '<iframe style="display:none" src="about:blank" id="'+n+'" name="'+n+'" onload="AIM.loaded(\''+n+'\')"></iframe>';
        document.body.appendChild(d);

        var i = document.getElementById(n);
        if (c && typeof(c.onComplete) == 'function') {
            i.onComplete = c.onComplete;
        }

		//alert(n);

        return n;
    },

    form : function(f, name) {
		//alert("form");
        f.setAttribute('target', name);
    },

    submit : function(f, c) {
        AIM.form(f, AIM.frame(c));
        if (c && typeof(c.onStart) == 'function') {
            return c.onStart();
        } else {
            return true;
        }
    },

    loaded : function(id) {
		//alert("loaded => id = " + id);
        var i = document.getElementById(id);
		//alert("i = " + i);
        if (i.contentDocument) {
            var d = i.contentDocument;
        } else if (i.contentWindow) {
            var d = i.contentWindow.document;
        } else {
            var d = window.frames[id].document;
        }
        if (d.location.href == "about:blank") {
            return;
        }

        if (typeof(i.onComplete) == 'function') {
            i.onComplete(d.body.innerHTML);
        }
    }

}

sdata.widgets.WidgetLoader.informOnLoad("changepic");