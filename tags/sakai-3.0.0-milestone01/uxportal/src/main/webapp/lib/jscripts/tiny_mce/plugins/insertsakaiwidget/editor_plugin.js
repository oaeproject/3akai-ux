(function() {
	tinymce.create('tinymce.plugins.InsertSakaiWidget', {
		init : function(ed, url) {
			var t = this;

			t.editor = ed;

			ed.addCommand('mceInsertSakaiWidget', function() {
				sakai.dashboard.showWidgetList(ed);
			});

			ed.addButton('insertsakaiwidget', {title : 'Insert Sakai Widget', cmd : 'mceInsertSakaiWidget'});
		},

		getInfo : function() {
			return {
				longname : 'Insert date/time',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/insertdatetime',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}

	});

	// Register plugin
	tinymce.PluginManager.add('insertsakaiwidget', tinymce.plugins.InsertSakaiWidget);
})();