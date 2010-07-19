/**
 * $Id: editor_plugin_src.js 201 2007-02-12 15:56:56Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	// Load plugin specific language pack
	tinymce.PluginManager.requireLangPack('resourcelink');

	tinymce.create('tinymce.plugins.ResourceLinkPlugin', {
		/**
		 * Initializes the plugin, this will be executed after the plugin has been created.
		 * This call is done before the editor instance has finished it's initialization so use the onInit event
		 * of the editor instance to intercept that event.
		 *
		 * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
		 * @param {string} url Absolute URL to where the plugin is located.
		 */
		init : function(ed, url) {
			// Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('mceResourceLink');
			ed.addCommand('mceResourceLink', function() {
				ed.windowManager.open({
					file : url + '/resourcelink.htm',
					width : 450 + parseInt(ed.getLang('resourcelink.delta_width', 0)),
					height : 260 + parseInt(ed.getLang('resourcelink.delta_height', 0)),
					inline : 1
				}, {
					plugin_url : url, // Plugin absolute URL
				});
			});
			
			ed.addCommand('mceResourceLinkBrowse', function() {
				ed.windowManager.open({
					file : url + '/pickresource.htm',
					width : 775 + parseInt(ed.getLang('resourcelink.delta_width', 0)),
					height : 375 + parseInt(ed.getLang('resourcelink.delta_height', 0)),
					inline : 1
				}, {
					plugin_url : url, // Plugin absolute URL
				});
			});
			

			// Register example button
			ed.addButton('resourcelink', {
				title : 'resourcelink.desc',
				cmd : 'mceResourceLink',
				image : url + '/img/link.gif'
			});

			
			// Add a node change handler, selects the button in the UI when a image is selected
		},

		/**
		 * Creates control instances based in the incomming name. This method is normally not
		 * needed since the addButton method of the tinymce.Editor class is a more easy way of adding buttons
		 * but you sometimes need to create more complex controls like listboxes, split buttons etc then this
		 * method can be used to create those.
		 *
		 * @param {String} n Name of the control to create.
		 * @param {tinymce.ControlManager} cm Control manager to use inorder to create new control.
		 * @return {tinymce.ui.Control} New control instance or null if no control was created.
		 */
		createControl : function(n, cm) {
			return null;
		},

		/**
		 * Returns information about the plugin as a name/value array.
		 * The current keys are longname, author, authorurl, infourl and version.
		 *
		 * @return {Object} Name/value array containing information about the plugin.
		 */
		getInfo : function() {
			return {
				longname : 'Resource Link Plugin',
				author : 'Chris Roby - NYU',
				authorurl : 'http://www.chrisroby.com',
				infourl : 'http://www.nyu.edu',
				version : "0.1"
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('resourcelink', tinymce.plugins.ResourceLinkPlugin);
})();