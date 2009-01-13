(function() {
	tinymce.create('tinymce.plugins.InsertSakaiLink', {
		init : function(ed, url) {
			var t = this;

			t.editor = ed;

			ed.addCommand('mceInsertSakaiLink', function() {
				sakai.dashboard.showLinkWindow(ed.selection.getContent(), ed);
			});

			ed.addButton('insertsakailink', {title : 'Insert Sakai Link', cmd : 'mceInsertSakaiLink'});
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
	tinymce.PluginManager.add('insertsakailink', tinymce.plugins.InsertSakaiLink);
})();