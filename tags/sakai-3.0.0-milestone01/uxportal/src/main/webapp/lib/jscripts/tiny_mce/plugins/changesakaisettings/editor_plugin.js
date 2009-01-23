(function() {
	tinymce.create('tinymce.plugins.ChangeSakaiSettings', {
		init : function(ed, url) {
			var t = this;

			t.editor = ed;

			ed.addCommand('mceChangeSakaiSettings', function() {
				sakai.dashboard.changeWidgetSettingsAdded(ed.selection.getContent(), ed);
			});

			ed.addButton('changesakaisettings', {title : 'Change Widget Settings', cmd : 'mceChangeSakaiSettings'});
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
	tinymce.PluginManager.add('changesakaisettings', tinymce.plugins.ChangeSakaiSettings);
})();