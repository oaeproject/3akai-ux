/* NOTE: Despite the version in the header saying 2.1, this is the 2.2 version */

/*
 * jQuery JSON Plugin
 * version: 2.1 (2009-08-14)
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 * Brantley Harris wrote this plugin. It is based somewhat on the JSON.org
 * website's http://www.json.org/json2.js, which proclaims:
 * "NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.", a sentiment that
 * I uphold.
 *
 * It is also influenced heavily by MochiKit's serializeJSON, which is
 * copyrighted 2005 by Bob Ippolito.
 */

/*
 * 2010-04-15 - Eli Cochran
 * This file has been modified from the origial in $.evalJSON()
 * to only parse the JSON if it is text. If it is already an object
 * it gets passed back as-is.
 */

(function($) {
    /**
     * jQuery.toJSON( json-serializble )
     *  Converts the given argument into a JSON respresentation.
     *
     *  If an object has a "toJSON" function, that will be used to get the representation.
     *  Non-integer/string keys are skipped in the object, as are keys that point to a function.
     *
     *  json-serializble:
     *  The *thing* to be converted.
     */
    $.toJSON = function(o)
    {
        if (typeof(JSON) == 'object' && JSON.stringify)
            return JSON.stringify(o);

        var type = typeof(o);

        if (o === null)
            return "null";

        if (type == "undefined")
            return undefined;

        if (type == "number" || type == "boolean")
            return o + "";

        if (type == "string")
            return $.quoteString(o);

        if (type == 'object')
        {
            if (typeof o.toJSON == "function")
                return $.toJSON( o.toJSON() );

            if (o.constructor === Date)
            {
                var month = o.getUTCMonth() + 1;
                if (month < 10) month = '0' + month;

                var day = o.getUTCDate();
                if (day < 10) day = '0' + day;

                var year = o.getUTCFullYear();

                var hours = o.getUTCHours();
                if (hours < 10) hours = '0' + hours;

                var minutes = o.getUTCMinutes();
                if (minutes < 10) minutes = '0' + minutes;

                var seconds = o.getUTCSeconds();
                if (seconds < 10) seconds = '0' + seconds;

                var milli = o.getUTCMilliseconds();
                if (milli < 100) milli = '0' + milli;
                if (milli < 10) milli = '0' + milli;

                return '"' + year + '-' + month + '-' + day + 'T' +
                             hours + ':' + minutes + ':' + seconds +
                             '.' + milli + 'Z"';
            }

            if (o.constructor === Array)
            {
                var ret = [];
                for (var i = 0; i < o.length; i++)
                    ret.push( $.toJSON(o[i]) || "null" );

                return "[" + ret.join(",") + "]";
            }

            var pairs = [];
            for (var k in o) {
                var name;
                var type = typeof k;

                if (type == "number")
                    name = '"' + k + '"';
                else if (type == "string")
                    name = $.quoteString(k);
                else
                    continue;  //skip non-string or number keys

                if (typeof o[k] == "function")
                    continue;  //skip pairs where the value is a function.

                var val = $.toJSON(o[k]);

                pairs.push(name + ":" + val);
            }

            return "{" + pairs.join(", ") + "}";
        }
    };

})(jQuery);