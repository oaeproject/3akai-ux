package org.sakaiproject.bootstrap.client;



import com.google.gwt.core.client.EntryPoint;
import com.google.gwt.core.client.JavaScriptObject;
import com.google.gwt.event.dom.client.ChangeEvent;
import com.google.gwt.event.dom.client.ChangeHandler;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.DOM;
import com.google.gwt.user.client.Element;
import com.google.gwt.user.client.Window;
import com.google.gwt.http.client.Request;
import com.google.gwt.http.client.RequestBuilder;
import com.google.gwt.http.client.RequestCallback;
import com.google.gwt.http.client.RequestException;
import com.google.gwt.http.client.Response;
import com.google.gwt.http.client.URL;
import com.google.gwt.json.client.JSONObject;
import com.google.gwt.json.client.JSONParser;
import com.google.gwt.json.client.JSONString;
import com.google.gwt.json.client.JSONValue;
import com.google.gwt.user.client.ui.Button;
import com.google.gwt.user.client.ui.InlineHTML;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.ListBox;
import com.google.gwt.user.client.ui.Panel;
import com.google.gwt.user.client.ui.RootPanel;


/**
 * Entry point classes define <code>onModuleLoad()</code>.
 */
public class Helloworldwow implements EntryPoint {
	private RootPanel root;
	private String tuid;
	private String placement;
	private ListBox lst;
	private String[] colorValues = {"#000000", "#FF0000", "#0000FF", "#00FF00"};
		
	 private  void doGet(String url, RequestCallback req) {
	    RequestBuilder builder = new RequestBuilder(RequestBuilder.GET, url);

	    try {
	      Request response = builder.sendRequest(null, req);
	    } catch (RequestException e) {
	    	root.get("helloworldwow_name").clear();
	    	root.get("helloworldwow_name").add(new Label("Failed to retrieve data."));
        	
	    }
	}
	 
	 private void doPost(String url, String postData, String filename) {
		    RequestBuilder builder = new RequestBuilder(RequestBuilder.POST, url);
		    String bounder = "bound" + Math.floor((Math.random() * 999999999));
		    String out = "--" + bounder + "\r\n";
		    out += "Content-Disposition: form-data; name=\"" + filename + "\"; filename=\"" + filename + "\"\r\n";
		    out += "Content-Type: text/plain\r\n\r\n";
		    out += postData + "\r\n";
		    out += "--" + bounder + "--";

		    try {
		      builder.setHeader("Content-Type", "multipart/form-data; charset=UTF-8; boundary=" + bounder);
		      Request response = builder.sendRequest(out, new RequestCallback() {

		        public void onError(Request request, Throwable exception) {
		        	 Window.alert("Failed to send the request: " + exception.getMessage());
		        }

		        public void onResponseReceived(Request request, Response response) {
		        	informFinish(tuid);
		        }
		      });
		    } catch (RequestException e) {
		      Window.alert("Failed to send the request: " + e.getMessage());
		    }
		 
	 }



	 private void showOutput() {
		 root.get("helloworldwow_settings").setVisible(false);
		 root.get("helloworldwow_output").setVisible(true);
		
			
		 root.get("helloworldwow_name").clear();
		 RequestCallback req = new RequestCallback() {
		        public void onError(Request request, Throwable exception) {
		        	root.get("helloworldwow_name").clear();
		        	root.get("helloworldwow_name").add(new Label("Failed to retrieve data."));
		        }

		        public void onResponseReceived(Request request, Response response) {
		        	JSONObject json = JSONParser.parse(response.getText()).isObject();
		        	JSONObject jsonProfile = json.get("profile").isObject();
		        	root.get("helloworldwow_name").add(new InlineHTML(jsonProfile.get("firstName").isString().stringValue()));
		        	
		        	checkHeight(tuid);
		        }

		 };
		doGet("/rest/me" ,req);
		 RequestCallback req2 = new RequestCallback() {
		        public void onError(Request request, Throwable exception) {
		            DOM.setStyleAttribute(root.get("helloworldwow_name").getElement(), "color", "#000000"); 
		        }

		        public void onResponseReceived(Request request, Response response) {
		            DOM.setStyleAttribute(root.get("helloworldwow_name").getElement(), "color", response.getText()); 
		        }

		 };
		doGet("/sdata/p/" + placement + "/" + tuid + "/commentswowcolor.txt", req2);
	}
	 
	private void showSettings() {
		root.get("helloworldwow_output").setVisible(false);
		root.get("helloworldwow_settings").setVisible(true);
		lst = new ListBox();
		String[] colors = {"Black", "Red", "Blue", "Green"};
		for(int i = 0 ; i < colors.length; i++){
			lst.addItem(colors[i],colorValues[i]);
		}
	
		root.get("helloworldwow_settings").add(lst);
		
		Button b = new Button("Save", new ClickHandler(){

			public void onClick(ClickEvent event) {
				String color = lst.getValue(lst.getSelectedIndex());
				doPost("/sdata/p/" + placement + "/" + tuid,color, "commentswowcolor.txt");
			}
			
		});
		root.get("helloworldwow_settings").add(b);
		
		 RequestCallback req2 = new RequestCallback() {
		        public void onError(Request request, Throwable exception) {
		            lst.setSelectedIndex(0);
		        }

		        public void onResponseReceived(Request request, Response response) {
		        	for(int i = 0 ; i < colorValues.length; i++){
		    			if(colorValues[i] == response.getText()){
		    				lst.setSelectedIndex(i);
		    			}
		    		}
		        	
		        }

		 };
		doGet("/sdata/p/" + placement + "/" + tuid + "/commentswowcolor.txt", req2);
		
		checkHeight(tuid);
	}
	public void onModuleLoad() {
		
		tuid = Window.Location.getParameter("tuid"); 
		applyStyles(tuid);
		root = RootPanel.get(tuid);
		placement = Window.Location.getParameter("placement"); 
		Boolean showSettings =  Boolean.parseBoolean(Window.Location.getParameter("showSettings")); 
		
		if(showSettings){
			showSettings();
		}
		else{
			showOutput();
		}
		
		
		
		
	}
	public static native void informFinish(String tuid) /*-{
	  $wnd.parent.sdata.container.informFinish(tuid, "helloworldwow");
	}-*/;
	public static native void applyStyles(String tuid) /*-{
	  $wnd.gwtCaller.onload(tuid);
	}-*/;
	public static native void checkHeight(String tuid) /*-{
	  $wnd.gwtCaller.resize("helloworldwow_frame" ,"#" + tuid);
	}-*/;
	
}


