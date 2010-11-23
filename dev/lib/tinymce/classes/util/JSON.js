/**
 * $Id: JSON.js 920 2008-09-09 14:05:33Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright � 2004-2006, Moxiecode Systems AB, All rights reserved.
 */

/**#@+
 * @class JSON parser and serializer class.
 * @member tinymce.util.JSON
 * @static
 */
tinymce.create('static tinymce.util.JSON', {
	/**#@+
	 * @method
	 */

	/**
	 * Serializes the specified object as a JSON string.
	 *
	 * @param {Object} o Object to serialize as a JSON string.
	 * @return {string} JSON string serialized from input.
	 */
	serialize : function(o) {
		var i, v, s = tinymce.util.JSON.serialize, t;

		if (o == null)
			return 'null';

		t = typeof o;

		if (t == 'string') {
			v = '\bb\tt\nn\ff\rr\""\'\'\\\\';

			return '"' + o.replace(/([\u0080-\uFFFF\x00-\x1f\"])/g, function(a, b) {
				i = v.indexOf(b);

				if (i + 1)
					return '\\' + v.charAt(i + 1);

				a = b.charCodeAt().toString(16);

				return '\\u' + '0000'.substring(a.length) + a;
			}) + '"';
		}

		if (t == 'object') {
			if (o instanceof Array) {
					for (i=0, v = '['; i<o.length; i++)
						v += (i > 0 ? ',' : '') + s(o[i]);

					return v + ']';
				}

				v = '{';

				for (i in o)
					v += typeof o[i] != 'function' ? (v.length > 1 ? ',"' : '"') + i + '":' + s(o[i]) : '';

				return v + '}';
		}

		return '' + o;
	},

	/**
	 * Unserializes/parses the specified JSON string into a object.
	 *
	 * @param {string} s JSON String to parse into a JavaScript object.
	 * @return {Object} Object from input JSON string or undefined if it failed.
	 */
	parse : function(s) {
		try {
			return eval('(' + s + ')');
		} catch (ex) {
			// Ignore
		}
	}

	/**#@-*/
});
