This directory (3akai-ux/devwidgets/_template) contains a complete set of files
to create a new Sakai OAE widget.

The best way to use these files is:

1) Copy the _template directory to another directory with the id of your new
   widget (i.e. 'mywidget').
   
   i.e. On a *nix system:
   $ cp -r 3akai-ux/devwidgets/_template 3akai-ux/devwidgets/mywidget
   
2) In your new directory, remove the README.txt file and change all occurences
   of WIDGET_ID in filenames and the files themselves to the id of your widget.
   
   After doing this, you should have the following file structure:
   
   devwidgets/mywidget
   devwidgets/mywidget/bundles
   devwidgets/mywidget/bundles/default.properties
   devwidgets/mywidget/config.json
   devwidgets/mywidget/css
   devwidgets/mywidget/css/mywidget.css
   devwidgets/mywidget/javascript
   devwidgets/mywidget/javascript/mywidget.js
   devwidgets/mywidget/mywidget.html
   
   and, you should no longer be able to find occurences of WIDGET_ID within your
   mywidget directory.

3) Configure and build your new widget!
   See http://confluence.sakaiproject.org/x/CCYhB for Sakai OAE Widget SDK
   documentation if you need help getting started.