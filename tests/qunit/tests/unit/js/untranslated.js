require(
    [
    'jquery',
    'sakai/sakai.api.core',
    'qunitjs/qunit',
    '../../../../tests/qunit/js/sakai_qunit_lib.js',
    '../../../../tests/qunit/js/dev.js',
    '../../../../tests/qunit/js/devwidgets.js'
    ],
    function($, sakai) {

         module('Untranslated Keys');

         var regex = new RegExp('__MSG__(.*?)__', 'gm');

         /**
          * Check HTML pages and test for hard coded english
          */
         var testUntranslatedKeys = function() {

             var makeCoreTest = function(url) {
                 asyncTest(url, function() {
                     $.ajax({
                         url: url,
                         success: function(data) {
                             checkKeys(data, function() {
                                 start();
                             });
                         }
                     });
                 });
             };

             // Check all the core HTML files
             for (var i=0,j=sakai_global.qunit.devHtmlFiles.length; i<j; i++) {
                 var urlToCheck = sakai_global.qunit.devHtmlFiles[i];
                 makeCoreTest(urlToCheck);
             }

             var makeWidgetTest = function(url, widget) {
                 asyncTest(url, function() {
                     $.ajax({
                         url: url,
                         success: function(data) {
                             getWidgetInfo(widget.name, function() {
                                 checkKeys(data, function() {
                                     start();
                                 }, widget);
                             });
                         }
                     });
                 });
             };

             // Check all the widgets
             for (var z=0,y=sakai_global.qunit.widgets.length; z<y; z++) {
                 var widgetURLToCheck = sakai_global.qunit.widgets[z].html;
                 var widgetObject = sakai_global.qunit.widgets[z];
                 makeWidgetTest(widgetURLToCheck, widgetObject);
             }

             $(window).trigger('addlocalbinding.qunit.sakai');
             QUnit.start();

         };

         /**
          * Grabs the widget's default bundle
          *
          * @param {String} widgetname The name of the widget
          * @param {Function} callback Callback function, called with a boolean for if the widget
          *                            has a bundle or not
          */
         var getWidgetInfo = function(widgetname, callback) {
             var bundle = false;
             if ($.isPlainObject(sakai.widgets[widgetname].i18n)) {
                 if (sakai.widgets[widgetname].i18n['default']) {
                     bundle = sakai.widgets[widgetname].i18n['default'];
                 }
             }
             if (bundle && bundle.bundle) {
                 $.ajax({
                     url: bundle.bundle,
                     success: function(data) {
                         sakai.api.i18n.data.widgets[widgetname] = sakai.api.i18n.data.widgets[widgetname] || {};
                         sakai.api.i18n.data.widgets[widgetname]['default'] = sakai.api.i18n.changeToJSON(data);
                         if ($.isFunction(callback)) {
                             callback(true);
                         }
                     }
                 });
             } else {
                 if ($.isFunction(callback)) {
                     callback(false);
                 }
             }
         };

         /**
          * Checks whether all the keys found in the HTML string have a translation
          * @param {String} data   HTML string to check for untranslated keys
          */
         var checkKeys = function(data, callback, widget) {
             while (regex.test(data)) {
                 var key = RegExp.lastMatch;
                 key = key.substring(7, key.length - 2);
                 if (widget) {
                     ok(sakai.api.i18n.getValueForKey(key, widget.name), 'Default value exists for ' + key);
                 } else {
                     ok(sakai.api.i18n.getValueForKey(key), 'Default value exists for ' + key);
                 }
             }
             callback();
         };

         var startTest = function() {
             if (sakai.api.i18n.done) {
                 testUntranslatedKeys();
             } else {
                 $(window).on('done.i18n.sakai', function() {
                     testUntranslatedKeys();
                 });
             }
         };

         /**
          * Run the test
          */
         if (sakai_global.qunit && sakai_global.qunit.ready) {
             startTest();
         } else {
             $(window).on('ready.qunit.sakai', function() {
                 startTest();
             });
         }

    }
);
