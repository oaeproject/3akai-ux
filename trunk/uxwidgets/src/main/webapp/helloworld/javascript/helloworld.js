/*
This is the sakai namespace where all of what we do will be under. This is to avoid cluttering the window object and to make sure that we don't interfere with other things loaded in the page. The way to initiate this namespace means that you create the sakai variable and make it be the existing sakai namespace if it already exists (take with us what's already there) or create an empty object if there is no sakai namespace yet.
*/
var sakai = sakai || {};

/*
This is the constructor of your widget which basically gives you a place where the widget code can play in. This is the function that will be executed by the portal container and from there on everything is up to your code. The things that come in to this constructor are
	- tuid: The unique id of the div your widget is being placed. In all of the selectors you use, you should limit the DOM search to that div.
	- placement: This is basically the URL (site/page/dashboard) of where your widget is being placed. This will give you a URL structure to which you can save preferences for this particular widget in that particular context
	- showSettings: this is a true/false value which will tell whether we want the edit mode or the view mode. The decision of which one is required is up to the portal container.
*/
sakai.helloworld = function(tuid,placement,showSettings){

	/*
	This is a variable which will resemble the container div we are working. Like this, we can reuse the container element for every DOM selection we do in our javascript, and thus make sure that there can be multiple instance of the widget in 1 page
	*/
	var rootel = $("#" + tuid);

	/*
	Over here I determine whether I am in settings mode or not. According to that, I will show different things on the screen
	*/
	if (showSettings) {
		/*
		If the settings mode is requested, then I will take our main container by doing a jQuery selector that selects the main container, and I replace the content of it by a No Settings available HTML string. This way, when the settings mode is requested for this widget, it'll just show "No settings available".
		*/
		$("#mainHelloContainer", rootel).html("No settings available<br/><br/>");
	}
	else {
		/*
		If the view mode is requested, we'll do a request to one of the available json feeds (/sdata/me = A feed about all of my personal details and profile info). sdata.Ajax.request is a function that is available in sdata.js, and this file will be loaded in the page when your widget is being rendered. You specify the http method (GET, POST, DELETE or PUT), the URL (it's easiest to specify absolute URLs and to be careful about caching issues. The random id behind the URL you see will cause it no to get this feed out of the browser cache), the onSuccess function that will be executed when the feed came through in a correct way and an onFail function that will be executed when the AJAX request to that URL failed.
		*/
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/sdata/me?sid=" + Math.random(),
			onSuccess: function(data){
				/*
				The data variable in this function will contain the response body of the request, which will be a JSON formatted string. This is an example of what that could be for this particular feed:

{"items":{"cp":"9420a909-1f65-44c3-9a8a-697ea4d690f4","userLocale":{"country":"GB","variant":"","displayCountry":"United Kingdom","ISO3Country":"GBR","displayVariant":"","language":"en","displayLanguage":"English","ISO3Language":"eng","displayName":"English (United Kingdom)"},"createdBy":"Nicolaas Matthijs (no email)","preferences":{},"workspace":"~178c5241-3c4d-4fb7-b501-fe47ce831934","pref":"a1f3af53-5ee9-4937-8d40-e13dcb97c584","properties":{},"displayId":"nicolaas","createdTime":"06-Oct-2008 10:12","lastname":"Matthijs","userid":"178c5241-3c4d-4fb7-b501-fe47ce831934","firstname":"Nicolaas","email":"","userEid":"nicolaas"}}

				We then call the fillInUsername function which will put the current user in the placeholder span. We pass it the JSON response string and a true value to indicate that the request had been successful.
				*/
				fillInUsername(data, true);
				
			},
			onFail: function(status){
				/*
				The status variable that comes in to this function will be the HTTP code of the failure (404 - Not found, 401 - Authentication required, 500 - Internal Server Error, ...). We then call the fillInUsername function which will handle the failure. We pass it the status code and a false value to indicate that the request has failed.
				*/
				fillInUsername(status, false);
				
			}
		});
		
		/*
		This is the fillInUsername which will handle the output of the AJAX request
		*/
		var fillInUsername = function(response, success){
			/*
			We check the success parameter, so we can determine whether the request failed or succeeded. If it was successful, we enter the if clause.
			*/
			if (success) {
				/*
				We evaluate the JSON response string, and JavaScript will then transform this JSON string into a genuine JavaScript object with key/value pairs. We assign the JavaScript to new variable called feed.
				*/
				var feed = eval('(' + response + ')');
				/*
				We do a new jQuery selector where we select the placeholder span where we wanted to put the current user into. Mind that by adding ",rootel" after each selector, we will limit the jQuery selector to the current container. We then take this placeholder and change the text inside it to the displayId of the current user, as stated in the me feed. 
				*/
				$("#helloworld_username", rootel).text(feed.items.displayId);
			}
			else {
				/*
				If the request has failed, we just put up an alert box which states that something went wrong.
				*/
				alert("An error occured");
			}
		}
		
	}

};

/*
This is a necessairy bit which you will need to add at the bottom of all of the JavaScript files declared in your widget. This will notify the container that your widget is ready to be executed. The container will finish off things like i18n, ... and will then call the constructor function of your widget.
*/
sdata.widgets.WidgetLoader.informOnLoad("helloworld");