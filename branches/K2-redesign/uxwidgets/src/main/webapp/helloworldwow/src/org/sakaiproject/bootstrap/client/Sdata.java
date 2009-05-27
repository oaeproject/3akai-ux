package org.sakaiproject.bootstrap.client;

import com.google.gwt.http.client.Request;
import com.google.gwt.http.client.RequestBuilder;
import com.google.gwt.http.client.RequestCallback;
import com.google.gwt.http.client.RequestException;
import com.google.gwt.http.client.Response;
import com.google.gwt.json.client.JSONObject;
import com.google.gwt.json.client.JSONParser;
import com.google.gwt.user.client.Element;
import com.google.gwt.user.client.Event;
import com.google.gwt.user.client.EventListener;
import com.google.gwt.user.client.Window;
import com.google.gwt.user.client.ui.RootPanel;
import com.google.gwt.user.client.ui.TextBox;
import java.util.ArrayList;
import java.util.List;


import com.google.gwt.user.client.DOM;

public class Sdata {
	private static JSONObject me;
	
	
	public static native void informFinish(String tuid, String widgetName) /*-{
	  $wnd.parent.sdata.container.informFinish(tuid, widgetName);
	}-*/;
	public static native void informCancel(String tuid, String widgetName) /*-{
	  $wnd.parent.sdata.container.informCancel(tuid, widgetName);
	}-*/;
	public static native void applyStyles() /*-{
	  var linkrels = $wnd.window.top.document.getElementsByTagName('link');
		    var small_head = $wnd.document.getElementsByTagName('head')[0];
			

		    for (var i = 0, max = linkrels.length; i < max; i++) {
		      if (linkrels[i].rel && linkrels[i].rel === 'stylesheet') {
		        var thestyle = $wnd.document.createElement('link');
		        var attrib = linkrels[i].attributes;
		        for (var j = 0, attribmax = attrib.length; j < attribmax; j++) {
		        	if(attrib[j].nodeName === "href"){
		        		thestyle.setAttribute(attrib[j].nodeName, linkrels[i].href);	
		        	}
		        	else{
		        		thestyle.setAttribute(attrib[j].nodeName, attrib[j].nodeValue);
		        	}
		          
		        }
				var link = '<link rel="stylesheet" type="text/css" href="' + linkrels[i].href + '" />'
		        small_head.appendChild(thestyle);
		      }
		    }
	}-*/;
	private static native void JScheckHeight(String rootel, int height) /*-{
	    var $ = $wnd.$ || $wnd.parent.$;
		var e = $wnd.parent.document.getElementById(rootel).getElementsByTagName('iframe').item(0); 
		e.height = height;
	}-*/;
	public static void checkHeight(String tuid){
		JScheckHeight(tuid, getFrameHeight(tuid));
	}
	private static native int getFrameHeight(String rootel)/*-{
	    var e = $wnd.parent.document.getElementById(rootel).getElementsByTagName('iframe').item(0); 
		var height = 0;
						
		if(e.contentDocument){
			height = e.contentDocument.body.offsetHeight + 30;
		} else {
			height = e.contentWindow.document.body.scrollHeight;
		}
		return height;
	}-*/; 
	public static native void redirectToUrl(String url)/*-{
    $wnd.parent.location = url;
	}-*/; 
	
	public static void doPost(String url, String postData, String filename, RequestCallback callback) {
	    RequestBuilder builder = new RequestBuilder(RequestBuilder.POST, url);
	    String bounder = "bound" + Math.floor((Math.random() * 999999999));
	    String out = "--" + bounder + "\r\n";
	    out += "Content-Disposition: form-data; name=\"" + filename + "\"; filename=\"" + filename + "\"\r\n";
	    out += "Content-Type: text/plain\r\n\r\n";
	    out += postData + "\r\n";
	    out += "--" + bounder + "--";

	    try {
	      builder.setHeader("Content-Type", "multipart/form-data; charset=UTF-8; boundary=" + bounder);
	      builder.sendRequest(out, callback);
	    } catch (RequestException e) {
	      Window.alert("Failed to send the request: " + e.getMessage());
	    }
	 
	}
	public static void doGet(String url, RequestCallback req) {
	    RequestBuilder builder = new RequestBuilder(RequestBuilder.GET, url + "?sid=" + Math.random());

	    try {
	      builder.sendRequest(null, req);
	    } catch (RequestException e) {
	    	Window.alert("Failed to send the request: " + e.getMessage());
	    }
	}
	
	public static TextBox getTextBox(RootPanel root, String id){
		TextBox txt =TextBox.wrap(root.get(id).getElement());
		
		return txt;
	}
	public static void fillJSONMe(){
		doGet("/rest/me", new RequestCallback(){

			public void onError(Request request, Throwable exception) {
				// TODO Auto-generated method stub
				Window.alert(exception.getMessage());
			}

			public void onResponseReceived(Request request, Response response) {
				// TODO Auto-generated method stub
				me = JSONParser.parse(response.getText()).isObject();
				if(!me.get("preferences").isObject().containsKey("uuid")){
					redirectToUrl("/dev/index.html");
				}
			}
			
		});
	}
	public static JSONObject getMe(){
		return me;
	}
	public static String getMyId(){
		return me.get("preferences").isObject().get("uuid").isString().stringValue();
	}
	public static void setEventListener(String id, EventListener listener, int events){
		Element btnReplyInputForm =RootPanel.get(id).getElement();
		Event.setEventListener(btnReplyInputForm, listener);
		Event.sinkEvents(btnReplyInputForm, events);		
	}
	public static void setEventListenerToClass(String parent, String className, EventListener listener, int events){
		List<Element> items = findElementsForClass(RootPanel.get(parent).getElement(), className);
		
		for(Element el : items){
			Element btnItem = RootPanel.get(el.getId()).getElement();
			Event.setEventListener(btnItem, listener);
			Event.sinkEvents(btnItem, events);
		}
	}
	
	

	/**
     * Returns a List of Element objects that have the specified CSS class name.
     * 
     * @param element Element to start search from
     * @param className name of class to find
     * @return
     */
    public static List<Element> findElementsForClass (Element element, String className)
    {
        ArrayList result = new ArrayList();
        recElementsForClass(result, element, className);
        if(result == null)
        	result = new ArrayList<Element>();
        return result;
    }

    private static void recElementsForClass (ArrayList res, Element element, String className)
    {
        String c;
        
        if (element == null) {
            return;
        }

        c = DOM.getAttribute(element, "className");
        
        if (c != null) {
            String[] p = c.split(" ");
            
            for (int x = 0; x < p.length; x++) {
                if (p[x].equals(className)) {
                    res.add(element);
                }
            }
        }
        
        for (int i = 0; i < DOM.getChildCount(element); i++) {
            Element child = DOM.getChild(element, i);
            recElementsForClass(res, child, className);
        }
    }
}
