This directory contains a complete set of files for making up a Sakai OAE Widget.

1) You can copy this folder to your 3akai-ux/node_module/oae-core folder. The name of this folder is also the name of the widget. You will need this name if you want to load the widget.

2) Each widget has a certain subfolders and files. We give them a default name by convention.

- widget-name/bundles
- widget-name/bundles/default.properties 
- widget-name/css
- widget-name/css/widget-name.css
- widget-name/js
- widget-name/js/widget-name.js
- widget-name/widget-name.html
- widget-name/manifest.json

   2.1) "Manifest.json"

   Manifest.json contains the settings for the widget.

      2.1.1) "i18n"

      i18n stands for internationisation and contains the settings about that.

      We have a default item that will be used if a language isn't specified. 
      Each item has a bundle, name and description.

      bundle is the relative path to the properties file of that language starting from the root folder of the widget. For the default value is this "bundles/default.properties".

      The languages that Sakai supports are:

      - en_GB
      - en_US
      - es_ES
      - fr_FR
      - nl_NL
      - ru_RU
      - zh_CN 

      2.1.2) "trigger"

      You can specify some trigger settings for the widget.

      - "selectors": selectors to load the widget. If you for example add "selectors": [".oae-trigger-widget-name"], you can add this class to a html element. Mostly used when the widget is a bootstrap modal and you didn't specified the widget on the page.

      - "events": you can specify some extra events for the widget that you can use with JavaScript to fire and handle that specific event. For example:

         // Defining in the manifest.json file
         "events": ["oae.trigger.widget-name"]

         // Event handler
         $(document).on('oae.trigger.widget-name', function(ev, data) {
            // Do something
         });

         // Fire that event
         $(document).trigger('oae.trigger.widget-name', { data });

      2.1.3) "src"

      Contains the location of the html source code of the widget. We use by convention the name of the widget for the name of the html source code file. "widget-name.html".

   2.2) "widget-name.html"

   This is the html source file of the widget with the link to the CSS and JavaScript files. There's a JavaScript template engine from TrimPath to render templates available.
   Source: https://code.google.com/p/trimpath/wiki/JavaScriptTemplates

   For example:

   // HTML code
   <div id="widget-name-template" class="hide"><!--
   
   --></div>

   // JavaScript code
   oae.api.util.template().render('#widget-name-template', {}, $('#widget-name-container'));

   With this function you can render a template by passing the template, potential data and the selector where the template must be rendered.

   Internationalisation:

   Notice that we use a special tag for output to the user, everything between "__MSG__" and "__" will be translated into the user's language atleast when that language provides that tag. You have to specify each tag into the properties files. If a tag isn't specified into a properties file than will the default propertie file be used. The tag should always atleast be available in default.properties file. For example:

   // In the HTML code
   <h1>__MSG__HELLO_WORLD__</h1>

   // In the propertie files: default.properties
   HELLO_WORLD = Hello world

      => in nl_NL.properties
      HELLO_WORLD = Dag wereld

   2.3) Bundles folder "bundles"

   This folder contains all the propteries files for the internationalisation like the example above. This folder should atleast have the default.properties file. Depending on the other languages you have other files for example en_GB.properties.

   2.4) JavaScriptfolder "js"

   In this folder are all the JavaScript files of the widget. By default we use always "js" as the name of the folder.

   2.5) "widget-name.js"

   Is the main JavaScript of the widget. By default we use name of the widget. If you change this you have to remember that and change it into the html source file.

   2.6) CSS folder "css"

   In this folder are all the CSS files of the widget. By default we use always "css" as the name of the folder.

   2.7) "widget-name.css"

   Is the main CSS of the widget. By default we use name of the widget. If you change this you have to remember that and change it into the html source file.

3) The last thing we need to do is load the widget on the page, you can do that by adding a data attribute "data-wiget" to a div like "<div data-widget="widget-name"></div>", when loading the page the widget will be rendered there. 

You can also load the widget without specifying the widget on the page by using the selector specified in the manifest.json trigger settings, but therefore you have to add that selector to a html element like <a href="#" class="oae-trigger-widget-name">Load widget</a>, the trigger setting will be: "selectors": [".oae-trigger-widget-name"].

4) After reading this documentation you should have enough information to create you own widget. You can use the widget builder to create an empty widget with the name you want. The widgetbuilder is available at http://oae-widgets.sakaiproject.org/sdk/developwidget/widgetbuilder