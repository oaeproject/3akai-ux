/**
 * $Id: WindowManager.js 890 2008-07-09 10:40:52Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright � 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var Dispatcher = tinymce.util.Dispatcher, each = tinymce.each, isIE = tinymce.isIE, isOpera = tinymce.isOpera;

	/**#@+
	 * @class This class handles the creation of native windows and dialogs. This class can be extended to provide for example inline dialogs.
	 * @member tinymce.WindowManager
	 */
	tinymce.create('tinymce.WindowManager', {
		/**
		 * Constructs a new window manager instance.
		 *
		 * @constructor
		 * @param {tinymce.Editor} ed Editor instance that the windows are bound to.
		 */
		WindowManager : function(ed) {
			var t = this;

			t.editor = ed;
			t.onOpen = new Dispatcher(t);
			t.onClose = new Dispatcher(t);
			t.params = {};
			t.features = {};
		},

		/**#@+
		 * @method
		 */

		/**
		 * Opens a new window.
		 *
		 * @param {Object} s Optional name/value settings collection contains things like width/height/url etc.
		 * @param {Object} p Optional parameters/arguments collection can be used by the dialogs to retrive custom parameters.
		 */
		open : function(s, p) {
			var t = this, f = '', x, y, mo = t.editor.settings.dialog_type == 'modal', w, sw, sh, vp = tinymce.DOM.getViewPort(), u;

			// Default some options
			s = s || {};
			p = p || {};
			sw = isOpera ? vp.w : screen.width; // Opera uses windows inside the Opera window
			sh = isOpera ? vp.h : screen.height;
			s.name = s.name || 'mc_' + new Date().getTime();
			s.width = parseInt(s.width || 320);
			s.height = parseInt(s.height || 240);
			s.resizable = true;
			s.left = s.left || parseInt(sw / 2.0) - (s.width / 2.0);
			s.top = s.top || parseInt(sh / 2.0) - (s.height / 2.0);
			p.inline = false;
			p.mce_width = s.width;
			p.mce_height = s.height;
			p.mce_auto_focus = s.auto_focus;

			if (mo) {
				if (isIE) {
					s.center = true;
					s.help = false;
					s.dialogWidth = s.width + 'px';
					s.dialogHeight = s.height + 'px';
					s.scroll = s.scrollbars || false;
				}
			}

			// Build features string
			each(s, function(v, k) {
				if (tinymce.is(v, 'boolean'))
					v = v ? 'yes' : 'no';

				if (!/^(name|url)$/.test(k)) {
					if (isIE && mo)
						f += (f ? ';' : '') + k + ':' + v;
					else
						f += (f ? ',' : '') + k + '=' + v;
				}
			});

			t.features = s;
			t.params = p;
			t.onOpen.dispatch(t, s, p);

			u = s.url || s.file;
			if (tinymce.relaxedDomain)
				u += (u.indexOf('?') == -1 ? '?' : '&') + 'mce_rdomain=' + tinymce.relaxedDomain;

			u = tinymce._addVer(u);

			try {
				if (isIE && mo) {
					w = 1;
					window.showModalDialog(u, window, f);
				} else
					w = window.open(u, s.name, f);
			} catch (ex) {
				// Ignore
			}

			if (!w)
				alert(t.editor.getLang('popup_blocked'));
		},

		/**
		 * Closes the specified window. This will also dispatch out a onClose event.
		 *
		 * @param {Window} w Native window object to close.
		 */
		close : function(w) {
			w.close();
			this.onClose.dispatch(this);
		},

		/**
		 * Creates a instance of a class. This method was needed since IE can't create instances
		 * of classes from a parent window due to some reference problem. Any arguments passed after the class name
		 * will be passed as arguments to the constructor.
		 *
		 * @param {String} cl Class name to create an instance of.
		 * @return {Object} Instance of the specified class.
		 */
		createInstance : function(cl, a, b, c, d, e) {
			var f = tinymce.resolve(cl);

			return new f(a, b, c, d, e);
		},

		/**
		 * Creates a confirm dialog. Please don't use the blocking behavior of this
		 * native version use the callback method instead then it can be extended.
		 *
		 * @param {String} t Title for the new confirm dialog.
		 * @param {function} cb Callback function to be executed after the user has selected ok or cancel.
		 * @param {Object} s Optional scope to execute the callback in.
		 */
		confirm : function(t, cb, s, w) {
			w = w || window;

			cb.call(s || this, w.confirm(this._decode(this.editor.getLang(t, t))));
		},

		/**
		 * Creates a alert dialog. Please don't use the blocking behavior of this
		 * native version use the callback method instead then it can be extended.
		 *
		 * @param {String} t Title for the new alert dialog.
		 * @param {function} cb Callback function to be executed after the user has selected ok.
		 * @param {Object} s Optional scope to execute the callback in.
		 */
		alert : function(tx, cb, s, w) {
			var t = this;

			w = w || window;
			w.alert(t._decode(t.editor.getLang(tx, tx)));

			if (cb)
				cb.call(s || t);
		},

		// Internal functions

		_decode : function(s) {
			return tinymce.DOM.decode(s).replace(/\\n/g, '\n');
		}

		/**#@-*/
	});
}());