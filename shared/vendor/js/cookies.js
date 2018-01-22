/* https://github.com/madmurphy/cookies.js (GPL3) */
var docCookies = {
    getItem: function(e) {
        return e
            ? decodeURIComponent(
                  document.cookie.replace(
                      new RegExp(
                          '(?:(?:^|.*;)\\s*' +
                              encodeURIComponent(e).replace(
                                  /[\-\.\+\*]/g,
                                  '\\$&',
                              ) +
                              '\\s*\\=\\s*([^;]*).*$)|^.*$',
                      ),
                      '$1',
                  ),
              ) || null
            : null;
    },
    setItem: function(e, o, n, t, r, c) {
        if (!e || /^(?:expires|max\-age|path|domain|secure)$/i.test(e))
            return !1;
        var s = '';
        if (n)
            switch (n.constructor) {
                case Number:
                    s =
                        n === 1 / 0
                            ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT'
                            : '; max-age=' + n;
                    break;
                case String:
                    s = '; expires=' + n;
                    break;
                case Date:
                    s = '; expires=' + n.toUTCString();
            }
        return (
            (document.cookie =
                encodeURIComponent(e) +
                '=' +
                encodeURIComponent(o) +
                s +
                (r ? '; domain=' + r : '') +
                (t ? '; path=' + t : '') +
                (c ? '; secure' : '')),
            !0
        );
    },
    removeItem: function(e, o, n) {
        return this.hasItem(e)
            ? ((document.cookie =
                  encodeURIComponent(e) +
                  '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' +
                  (n ? '; domain=' + n : '') +
                  (o ? '; path=' + o : '')),
              !0)
            : !1;
    },
    hasItem: function(e) {
        return !e || /^(?:expires|max\-age|path|domain|secure)$/i.test(e)
            ? !1
            : new RegExp(
                  '(?:^|;\\s*)' +
                      encodeURIComponent(e).replace(/[\-\.\+\*]/g, '\\$&') +
                      '\\s*\\=',
              ).test(document.cookie);
    },
    keys: function() {
        for (
            var e = document.cookie
                    .replace(
                        /((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g,
                        '',
                    )
                    .split(/\s*(?:\=[^;]*)?;\s*/),
                o = e.length,
                n = 0;
            o > n;
            n++
        )
            e[n] = decodeURIComponent(e[n]);
        return e;
    },
};
'undefined' != typeof module &&
    'undefined' != typeof module.exports &&
    (module.exports = docCookies);
