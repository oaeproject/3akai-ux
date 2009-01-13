var sakai = sakai || {};
sakai.index = function(){

	var isLoggingIn = false;
	var redirecturl = "/dev/dashboard.html";

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
		sdata.widgets.WidgetPreference.get("loggedIn", sakai.index.decideLoggedIn);

	}

	sakai.index.decideLoggedIn = function(response, exists){
		if (exists == false) {
			if (response != "401" && response != "403" && response != "error"){
				document.location = redirecturl;
			} else {
				$("#username").focus();
			}
		} else {
			document.location = redirecturl;
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

			var url= "/portal/xlogin";
			var requestbody = {"eid" : $('#username').attr("value"), "pw" : $('#password').attr("value") , "submit" : "Login"};
	
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

		var url= "/portal/xlogin";
		var requestbody = {"eid" : $('#username').attr("value"), "pw" : $('#password') .attr("value") , "submit" : "Login"};
	
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
		sdata.widgets.WidgetPreference.get("loggedIn", sakai.index.decideLoggedIn2);
		if (isLoggingIn){
			setTimeout("sakai.index.retryLogin()",1000);
		}
	}

	sakai.index.decideLoggedIn2 = function(response, exists){

		if (exists == false) {
			if (response != "401" && response != "403" && response != "error"){
				document.location = redirecturl;
			} else {
				$("#failed").show();
				$("#loginloader").hide();
				$("#loginbutton").show();
				isLoggingIn = false;
			}
		} else {
			document.location = redirecturl;
		}

	}
	
	set_cookie('sakai_chat','', null, null, null, "/", null, null );

	doInit();

};

sdata.registerForLoad("sakai.index");