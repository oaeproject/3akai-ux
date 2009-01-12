(function() {
	tinymce.create('tinymce.plugins.ChangeWrapping', {
		init : function(ed, url) {
			var t = this;

			t.editor = ed;

			ed.addCommand('mceChangeWrapping', function() {
				sakai.dashboard.changeWrapping(ed.selection.getContent(), ed);
			});

			ed.addButton('changewrapping', {title : 'Change Wrapping', cmd : 'mceChangeWrapping'});
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
	tinymce.PluginManager.add('changewrapping', tinymce.plugins.ChangeWrapping);
})();