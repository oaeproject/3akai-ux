var sakai = sakai || {};
sakai.index = function(){

	var isLoggingIn = false;
	var redirecturl = "/dev/redesign/my_sakai.html";

	var doInit = function(){

		var qs = new Querystring();
		var red = qs.get("url", "false");
		if (red != "false"){
			redirecturl = sdata.util.URL.decode(red);
		}
		$("input").bind("keydown", function(e){
			var code = e.keyCode;
			switch (code)
			{
			case 13:
				performLogIn();
				break			
			}
		});
		$("#loginbutton").bind("click", function(){
			performLogIn();
		});
		
		sdata.Ajax.request({
			url : "/rest/me?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				sakai.index.decideLoggedIn(data,true);
			},
			onFail : function(data){
				sakai.index.decideLoggedIn(data,false);
			}
		});

	}

	sakai.index.decideLoggedIn = function(response, exists){
		if (exists){
			var mejson = eval('(' + response + ')');
			if (mejson.preferences.uuid != "anon" && mejson.preferences.uuid != null){
				document.location = redirecturl;
			} else {
				$("#username").focus();
			}
		} else {
			// An error has occured
		}	

	}

	performLogIn = function(){

		var username = $('#username').attr("value");
		var password = $('#password').attr("value");

		if (!username || !password || username.replace(/ /g,"") == "" || password.replace(/ /g,"") == ""){

		} else {

			isLoggingIn = true;
			$("#failed").hide();
			$("#loginloader").show();
			$("#loginbutton").hide();
			$("#register_here").hide();

			var url= "/rest/login";
			var requestbody = {"l":1, "a":"FORM", "u" : $('#username').attr("value"), "p" : $('#password').attr("value")};
	
			sdata.Ajax.request({
				url :url,
				httpMethod : "POST",
				onSuccess : function(data) {
					sakai.index.checkLogInSuccess(data,true);
				},
				onFail : function(status) {
					sakai.index.checkLogInSuccess(status,false);
				},
				postData : requestbody,
				contentType : "application/x-www-form-urlencoded"
			});

		}

	}

	sakai.index.retryLogin = function(){

		var url= "/rest/login";
		var requestbody = {"l":1, "a":"FORM", "u" : $('#username').attr("value"), "p" : $('#password').attr("value")};
		
		sdata.Ajax.request({
			url :url,
			httpMethod : "POST",
			onSuccess : function(data) {
				sakai.index.checkLogInSuccess(data,true);
			},
			onFail : function(status) {
				sakai.index.checkLogInSuccess(status,false);
			},
			postData : requestbody,
			contentType : "application/x-www-form-urlencoded"
		});
	}

	sakai.index.checkLogInSuccess = function(response, exists){
		
		sdata.Ajax.request({
			url : "/rest/me?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				sakai.index.decideLoggedIn2(data,true);
			},
			onFail : function(data){
				sakai.index.decideLoggedIn2(data,false);
			}
		});
	
		if (isLoggingIn){
			setTimeout("sakai.index.retryLogin()",1000);
		}
	}

	sakai.index.decideLoggedIn2 = function(response, exists){

		if (exists){
			var mejson = eval('(' + response + ')');
			if (mejson.preferences.uuid != "anon" && mejson.preferences.uuid != null){
				document.location = redirecturl;
			} else {
				$("#failed").show();
				$("#loginloader").hide();
				$("#loginbutton").show();
				$("#register_here").show();
				isLoggingIn = false;
			}
		} else {
			// An error has occured
		}	

	}
	
	set_cookie('sakai_chat','', null, null, null, "/", null, null );

	doInit();

};

sdata.registerForLoad("sakai.index");