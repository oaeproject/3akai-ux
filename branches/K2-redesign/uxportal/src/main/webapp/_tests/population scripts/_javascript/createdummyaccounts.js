/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

var Config = Config || function(){ throw "Config file not available"; };
var $ = $ || function(){ throw "JQuery not available"; };
var sdata = sdata || function(){ throw "SData.js not available"; };
var json_parse = json_parse || function(){ throw "SData.js not available"; };
var jcap = jcap || function(){ throw "JCap (JavaScripts Captcha) is not available"; };

var sakai = sakai || {};

sakai.createdummyaccounts = function(){
	
	var log = function(message){
		$("#log").append("<span>" + message + "</span><br/>");
	}

	$("#save_account").bind("click", function(ev){
		var user1 = {"userType": "default", "firstName": "First", "lastName": "User", "email": "first.user@sakai.com", "password": "test1", "eid": "user1"};
		$.ajax({
    	    url : Config.URL.CREATE_USER_SERVICE,
    	    type : "POST",
    	    data : user1,
    	   	success : function(data) {
				log("Created user 1");
			},
			error: function(data){
				log("Failed to create user 1");
			}
		});

		var user2 = {"userType": "default", "firstName": "Second", "lastName": "User", "email": "second.user@sakai.com", "password": "test2", "eid": "user2"};
		$.ajax({
    	    url : Config.URL.CREATE_USER_SERVICE,
    	    type : "POST",
    	    data : user2,
    	    success : function(data) {
				log("Created user 2");
			},
			error: function(data){
				log("Failed to create user 2");
			}
		});

		var user3 = {"userType": "default", "firstName": "Third", "lastName": "User", "email": "third.user@sakai.com", "password": "test3", "eid": "user3"};
		$.ajax({
    	    url : Config.URL.CREATE_USER_SERVICE,
    	    type : "POST",
    	    data : user3,
    	    success : function(data) {
				log("Created user 3");
			},
			error: function(data){
				log("Failed to create user 3");
			}
		});

		var user4 = {"userType": "default", "firstName": "Fourth", "lastName": "User", "email": "fourth.user@sakai.com", "password": "test4", "eid": "user4"};
		$.ajax({
    	    url : Config.URL.CREATE_USER_SERVICE,
    	    type : "POST",
    	    data : user4,
    	    success : function(data) {
				log("Created user 4");
			},
			error: function(data){
				log("Failed to create user 4");
			}
		});

		var user5 = {"userType": "default", "firstName": "Fifth", "lastName": "User", "email": "fifth.user@sakai.com", "password": "test5", "eid": "user5"};
		$.ajax({
    	    url : Config.URL.CREATE_USER_SERVICE,
    	    type : "POST",
    	    data : user5,
    	    success : function(data) {
				log("Created user 5");
			},
			error: function(data){
				log("Failed to create user 5");
			}
		});

	});
	
};

sdata.container.registerForLoad("sakai.createdummyaccounts");