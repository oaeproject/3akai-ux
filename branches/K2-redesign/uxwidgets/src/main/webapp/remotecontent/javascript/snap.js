/* Snap Shots Code Copyright (c) 2009, Snap Technologies, Inc.  All rights reserved. 
 * Your use of this code is subject to the Snap Shots Terms of Service 
 * located at https://account.snap.com/print_terms.php
 */

//<!--
/*! Snap Shots Code Copyright (c) 2009, Snap Technologies, Inc.  All rights reserved. 
 * Your use of this code is subject to the Snap Shots Terms of Service 
 * located at https://account.snap.com/print_terms.php
 */
if (typeof SNAP_COM == "undefined") {
    SNAP_COM = {
        shot_main_js_called: false
    };
}
SNAP_COM.shot_config = {
    version: "3.73",
    prefix: {
        image: "http://shots.snap.com/images/v3.73/",
        cdn: "http://i.ixnp.com/",
        cdn_image: "http://i.ixnp.com/images/v3.73/",
        cdn_js: "http://i.ixnp.com/javascript/v3.73/",
        theme: "http://i.ixnp.com/images/v3.73/theme/silver/",
        link: "http://shots.snap.com/",
        options: "http://shots.snap.com/",
        preview: "http://shots.snap.com/",
        spasense: "http://shots.snap.com/",
        bg: "http://i.ixnp.com/images/v3.73/theme/silver/bg/",
        snap: "http://www.snap.com/",
        search: "http://www.snap.com/"
    },
    enabled: {
        shots: true,
        linkbubbles: false,
        engage_basic: false,
        engage_premium: false
    },
    user_id: "43af3c847e48968768f250c68a6a3d1f",
    tkn: "000349c5c36a5d97780d5255fb60c36c",
    tknd: 77760,
    tknx: 1237645546,
    dfs: "10",
    scheme: "http://",
    size: "small",
    orig_size: "small",
    theme: "silver",
    key: "f3a32a31f420f80b6a7ec2f1f1099d42",
    source: "",
    campaign: "",
    flavor: null,
    lang: "en-us",
    rtl: 0,
    force: null,
    trigger_position: "default",
    check_defer: false,
    defer_scan: false,
    observe_event: "body",
    has_marea: true,
    ad_type: "default",
    auto_preview: true,
    show_internal: false,
    preview_only: true,
    no_rss: 0,
    rich_only: false,
    plugin: false,
    rescan_after_load: false,
    thumbnail_precrawl: 0,
    show_link_icon: false,
    link_icon_types: true,
    preview_trigger: "both",
    image_trigger: false,
    shots_domain_match: null,
    shot_check: 1,
    search_type: "spasense",
    redirect_param: null,
    client_ip: "131.111.21.21",
    user_agent: "Mozilla%2F5.0+%28Macintosh%3B+U%3B+PPC+Mac+OS+X+10.4%3B+en-US%3B+rv%3A1.9.0.7%29+Gecko%2F2009021906+Firefox%2F3.0.7",
    srate: {
        main: 0.001,
        auto: 0.01,
        page: 0.001,
        inspect: 1,
        tmr: 0
    },
    close_btn: false,
    delay: {
        show: 125,
        show_sli: 125,
        hide: 500,
        move: 200,
        prefetch: 50
    },
    img: {
        cobrand: "http://i.ixnp.com/images/v3.73/t.gif",
        link_icon: "http://i.ixnp.com/images/v3.73/t.gif",
        png_palette: "http://i.ixnp.com/images/v3.73/theme/silver/palette.png",
        lb_palette: "http://i.ixnp.com/images/v3.73/lb/lb_palette.png",
        palette: "http://i.ixnp.com/images/v3.73/theme/silver/palette.gif"
    },
    pointer: {
        r_offset: 4,
        top: {
            x: 7,
            y: 1
        },
        bottom: {
            x: 7,
            y: 8
        },
        left: {
            x: 2
        },
        right: {
            x: 7
        },
        steps: "6",
        w0: 200,
        w: 20,
        x0: 5,
        x: 5
    },
    css_pos: {
        main: {
            x: 0,
            y: 0,
            w: 328,
            h: 346
        },
        bubble: {
            x: 1,
            y: 1,
            w: 322,
            h: 297
        },
        bg_div_tl: {
            x: 0,
            y: 0,
            w: 50,
            h: 50
        },
        bg_div_tr: {
            xr: 0,
            y: 0,
            w: 50,
            h: 50
        },
        bg_div_bl: {
            x: 0,
            yb: 1,
            w: 50,
            h: 50
        },
        bg_div_br: {
            xr: 0,
            yb: 1,
            w: 50,
            h: 50
        },
        bg_img_l: {
            x: 0,
            y: 50,
            w: 100,
            h: 100
        },
        bg_img_r: {
            xr: 0,
            y: 50,
            w: 100,
            h: 100
        },
        bg_img_t: {
            x: 50,
            y: 0,
            w: 100,
            h: 100
        },
        bg_img_b: {
            x: 50,
            yb: 1,
            w: 100,
            h: 100
        },
        bg_div_point: {
            x: 50,
            y: 50,
            w: 43,
            h: 41
        },
        bg_body: {
            x: 2,
            yb: 37,
            w: 320,
            h: 82
        },
        bubble_img: {
            x: 0,
            y: 0,
            w: 322,
            h: 297
        },
        body: {
            x: 0,
            y: 0,
            w: 322,
            h: 297
        },
        top_left_menu: {
            x: 1,
            y: 1,
            w: null,
            h: null
        },
        top_right_menu: {
            xr: 1,
            y: 1,
            w: null,
            h: null
        },
        option_menu: {
            xr: 20,
            y: 18,
            w: null,
            h: null
        },
        url_wrapper: {
            x: 6,
            y: 5,
            w: null,
            h: null
        },
        preview_div: {
            x: 0,
            y: 20,
            w: 320,
            h: 207
        },
        preview: {
            x: 0,
            y: 0,
            w: 320,
            h: 207
        },
        preview_img: {
            x: 0,
            y: 0,
            w: null,
            h: null
        },
        img_a: {
            x: 23,
            yb: 12,
            w: 270,
            h: 161
        },
        loading_img: {
            x: 0,
            y: 0,
            w: null,
            h: null
        },
        search: {
            x: 1,
            yb: 31,
            w: 320,
            h: 78
        },
        ribbon: {
            xr: 98,
            yb: 5,
            w: 17,
            h: 20
        },
        logo_a: {
            xr: 7,
            yb: 8,
            w: null,
            h: null
        },
        box: {
            x: 12,
            y: 24,
            w: 240,
            h: 25
        },
        submit: {
            xr: 7,
            y: 23,
            w: null,
            h: null
        },
        flash_overlay: {
            x: 0,
            y: 50,
            w: 322,
            h: 180
        },
        drag_overlay: {
            x: 0,
            y: 0,
            w: 322,
            h: 20
        },
        cobrand_img: {
            x: 9,
            yb: 6,
            w: null,
            h: null
        },
        cobrand_a: {
            x: 10,
            yb: 8,
            w: null,
            h: 15
        },
        promo: {
            x: 10,
            yb: 8,
            w: null,
            h: 15
        },
        options: {
            x: 0,
            y: 0,
            w: 322,
            h: null
        },
        option_menu_bar: {
            xr: 1,
            y: 1,
            w: null,
            h: null
        },
        option_iframe: {
            x: 0,
            y: 20,
            w: 321,
            h: 207
        },
        option_cancel: {
            xr: 54,
            y: 201,
            w: 50,
            h: 21
        },
        marea: {
            x: 1,
            yb: 30,
            w: 320,
            h: 79
        },
        link_icon: {
            x: null,
            y: null,
            w: 14,
            h: 12
        },
        pointer0: {
            w: 1,
            h: 1
        },
        pointer1: {
            w: 1,
            h: 1
        },
        pointer2: {
            w: 1,
            h: 1
        },
        pointer3: {
            w: 1,
            h: 1
        },
        pointer4: {
            w: 1,
            h: 1
        },
        pointer5: {
            w: 1,
            h: 1
        }
    },
    rtl_css_pos: {
        0 : "promo",
        1 : "logo_a",
        2 : "submit",
        3 : "box",
        4 : "option_cancel",
        5 : "cobrand_img",
        6 : "ribbon"
    },
    style: {
        link_icon: {
            padding: "1px 0 0 0",
            textDecoration: "none",
            position: "static"
        },
        favicon: {
            position: "static",
            display: "inline"
        },
        url: {
            position: "static",
            display: "inline",
            fontSize: "13px",
            fontWeight: "bold",
            textAlign: "left"
        },
        arrow: {
            position: "static",
            display: "inline"
        },
        search: {
            backgroundColor: "#eeeeee"
        },
        option_iframe: {
            backgroundColor: "#ffffff"
        },
        preview: {
            backgroundColor: "#ffffff"
        },
        marea: {
            overflow: "hidden",
            backgroundColor: "#eeeeee"
        },
        body: {
            textAlign: "left"
        },
        bg_body: {
            backgroundColor: "#d8d8d9"
        },
        share_button: {
            display: "inline"
        },
        option_button: {
            display: "inline"
        },
        zoom_img: {
            display: "inline"
        },
        option_button_disabled: {
            display: "inline"
        },
        pin_close_img: {
            display: "inline"
        },
        promo_icon: {
            display: "inline"
        },
        preview_toggle: {
            display: "inline"
        },
        rss_toggle: {
            display: "inline"
        },
        drag_overlay: {
            backgroundColor: "transparent"
        },
        flash_overlay: {
            backgroundColor: "transparent"
        },
        option_close_a: {
            fontSize: "10px",
            fontWeight: "normal",
            color: "#857a7a",
            textDecoration: "none"
        },
        option_menu: {
            fontSize: "10px",
            fontFamily: "Trebuchet",
            color: "#333",
            backgroundColor: "white",
            border: "1px solid #8b8a8a"
        },
        option_a: {
            whiteSpace: "nowrap",
            height: "17px",
            paddingLeft: "5px",
            paddingRight: "5px"
        },
        option_cancel: {
            border: "1px solid #999",
            fontSize: "11px",
            color: "#333",
            background: "url(http://i.ixnp.com/images/btn-bkgd.gif)"
        },
        disable_a: {
            whiteSpace: "nowrap",
            height: "17px",
            paddingLeft: "5px",
            paddingRight: "5px",
            borderTop: "1px solid #c0c0c0"
        },
        url_a: {
            fontSize: "13px",
            fontWeight: "bold",
            textDecoration: "underline",
            color: "#00E",
            backgroundColor: "white",
            textAlign: "left"
        },
        url_arrow: {
            backgroundColor: "white"
        },
        url_favicon: {
            backgroundColor: "white"
        },
        promo_a: {
            fontSize: "11px",
            color: "#333333",
            textDecoration: "none",
            borderBottom: "1px dotted #747274"
        },
        promo: {
            direction: "ltr"
        },
        preview_div: {
            border: "1px solid #c4c4c4",
            overflow: "hidden",
            backgroundColor: "#FFFFFF"
        },
        img_a: {
            border: "1px solid #999999",
            overflow: "hidden",
            backgroundColor: "#FFFFFF"
        },
        submit: {
            margin: "0",
            marginLeft: "5px",
            padding: "2px",
            paddingTop: "1px",
            paddingBottom: "2px",
            cursor: "pointer",
            fontSize: "11px",
            color: "#444",
            textAlign: "center"
        },
        box: {
            paddingTop: "5px",
            fontSize: "12px",
            border: "1px solid #999999",
            color: "#333333",
            visibility: "inherit",
            backgroundColor: "",
            direction: "ltr"
        }
    },
    offset: {
        marea: 79
    },
    hidden: ["link_icon", "option_menu", "top_left_menu", "lg", "ribbon", "ribbon_a", "search"],
    collapsed: ["pin_close_img"],
    t_img: ["cobrand_img"],
    retry_interval: [8000, 5000, 5000, 5000, 5000, 5000],
    lb: {
        css_pos: {
            lb_main: {
                x: 0,
                y: 0,
                w: 248,
                h: 108
            },
            lb_tl: {
                x: 0,
                y: 0,
                w: 26,
                h: 26
            },
            lb_tr: {
                xr: 0,
                y: 0,
                w: 26,
                h: 26
            },
            lb_bl: {
                x: 0,
                yb: 0,
                w: 19,
                h: 22
            },
            lb_br: {
                xr: 0,
                yb: 0,
                w: 22,
                h: 22
            },
            lb_t_img: {
                x: 26,
                y: 0,
                w: 196,
                h: 48
            },
            lb_b_img: {
                x: 19,
                yb: 0,
                w: 217,
                h: 48
            },
            lb_l_img: {
                x: 0,
                y: 26,
                w: 14,
                h: 60
            },
            lb_r_img: {
                xr: 0,
                y: 26,
                w: 14,
                h: 60
            },
            lb_point: {
                x: 20,
                y: -13,
                w: 23,
                h: 35
            },
            lb_titlebar: {
                x: 13,
                y: 7,
                w: 230,
                h: 17
            },
            lb_logo: {
                x: 5,
                y: 3,
                w: 68,
                h: 8
            },
            lb_help: {
                xr: 22,
                y: 1,
                w: 15,
                h: 15
            },
            lb_close: {
                xr: 2,
                y: 1,
                w: 15,
                h: 15
            },
            lb_content: {
                x: 7,
                y: 26,
                w: 234,
                h: 60
            }
        },
        style: {
            lb_content: {
                backgroundColor: "#FFFFFF"
            }
        }
    },
    partial_check: {
        delay: 2000,
        attempts: 5
    },
    rescan_delay: 1000,
    href: {
        logo: "http://www.snap.com/",
        cobrand: "http://www.snap.com/about/shots.php",
        shot_signup: "https://account.snap.com/signup.php",
        client_download: "http://www.snap.com/about/shotsdownload.php",
        client_about: "http://www.snap.com/about/addon.php",
        ribbon: "http://www.snap.com/snapshots.php",
        whatsnew: "http://blog.snap.com/2007/11/04/what-is-new-with-snap-shots"
    },
    attribution_split_test_suffix: "_6",
    palette: {
        promo_icon: {
            loc: "-1128px 0",
            w: 14,
            h: 12
        },
        link_icon: {
            loc: "-1128px 0",
            w: 14,
            h: 12
        },
        link_icon_wiki: {
            loc: "-1142px 0",
            w: 14,
            h: 12
        },
        link_icon_video: {
            loc: "-1072px 0",
            w: 14,
            h: 12
        },
        link_icon_music: {
            loc: "-1058px 0",
            w: 14,
            h: 12
        },
        logo_a: {
            loc: "-950px 0",
            w: 81,
            h: 15
        },
        previewby: null,
        share_button: {
            loc: "-807px 0",
            w: 50,
            h: 17
        },
        share_button_over: {
            loc: "-757px 0",
            w: 50,
            h: 17
        },
        option_button: {
            loc: "-421px 0",
            w: 27,
            h: 18
        },
        option_button_over: {
            loc: "-448px 0",
            w: 27,
            h: 18
        },
        zoom_img_plus: {
            loc: "-523px 0",
            w: 23,
            h: 18
        },
        zoom_img_plus_over: {
            loc: "-546px 0",
            w: 23,
            h: 18
        },
        zoom_img_minus: {
            loc: "-592px 0",
            w: 23,
            h: 18
        },
        zoom_img_minus_over: {
            loc: "-569px 0",
            w: 23,
            h: 18
        },
        option_close_a: {
            loc: "-711px 0",
            w: 23,
            h: 18
        },
        option_close_a_over: {
            loc: "-615px 0",
            w: 23,
            h: 18
        },
        option_button_disabled: {
            loc: "-394px 0",
            w: 27,
            h: 18
        },
        pin_close_img: {
            loc: "-711px 0",
            w: 23,
            h: 18
        },
        pin_close_img_over: {
            loc: "-615px 0",
            w: 23,
            h: 18
        },
        preview_toggle: {
            loc: "-319px 0",
            w: 25,
            h: 18
        },
        preview_toggle_over: {
            loc: "-369px 0",
            w: 25,
            h: 18
        },
        preview_toggle_selected: {
            loc: "-344px 0",
            w: 25,
            h: 18
        },
        rss_toggle: {
            loc: "-475px 0",
            w: 25,
            h: 18
        },
        rss_toggle_over: {
            loc: "-638px 0",
            w: 25,
            h: 18
        },
        rss_toggle_selected: {
            loc: "-686px 0",
            w: 25,
            h: 18
        },
        favicon: {
            loc: "-889px 0",
            w: 16,
            h: 16
        },
        submit: {
            loc: "-164px 0",
            w: 55,
            h: 29
        },
        arrow: {
            loc: "-1165px 0",
            w: 7,
            h: 7
        }
    },
    png_palette: {
        bg_br: {
            x: "0",
            y: "0",
            w: 50,
            h: 50
        },
        bg_tl: {
            x: "50",
            y: "0",
            w: 50,
            h: 50
        },
        bg_tr: {
            x: "100",
            y: "0",
            w: 50,
            h: 50
        },
        bg_bl: {
            x: "150",
            y: "0",
            w: 50,
            h: 50
        },
        point_l: {
            x: "200",
            y: "0",
            w: 22,
            h: 33
        },
        point_r: {
            x: "222",
            y: "0",
            w: 26,
            h: 32
        },
        point_br: {
            x: "248",
            y: "0",
            w: 28,
            h: 29
        },
        point_bl: {
            x: "276",
            y: "0",
            w: 28,
            h: 29
        },
        point_tl: {
            x: "304",
            y: "0",
            w: 27,
            h: 26
        },
        point_tr: {
            x: "331",
            y: "0",
            w: 29,
            h: 26
        }
    },
    lb_palette: {
        lb_bg_tr: {
            x: "1",
            y: "1",
            w: 26,
            h: 26
        },
        lb_bg_tl: {
            x: "28",
            y: "1",
            w: 26,
            h: 26
        },
        lb_bg_bl: {
            x: "55",
            y: "1",
            w: 19,
            h: 22
        },
        lb_bg_br: {
            x: "75",
            y: "1",
            w: 22,
            h: 22
        },
        lb_point_b: {
            x: "98",
            y: "1",
            w: 23,
            h: 21
        },
        lb_point_t: {
            x: "122",
            y: "1",
            w: 23,
            h: 19
        },
        lb_btn_close: {
            x: "146",
            y: "1",
            w: 15,
            h: 15
        },
        lb_btn_help: {
            x: "162",
            y: "1",
            w: 15,
            h: 15
        },
        lb_linkbubble: {
            x: "178",
            y: "1",
            w: 85,
            h: 8
        }
    },
    rich_shot_re: {
        wiki: ["\\.wikipedia.org/wiki/"],
        music: ["\\.mp3$"],
        video: ["youtube\\.com/v/", "youtube\\.com/\\?v=", "youtube\\.com/watch\\?v=", "video\\.google\\.(com|ca|cn|co\\.uk|com\\.au|de|es|fr|it|jp|nl|pl)/googleplayer\\.swf\\?docId=", "video\\.google\\.(com|ca|cn|co\\.uk|com\\.au|de|es|fr|it|jp|nl|pl)/url\\?docid", "video\\.google\\.(com|ca|cn|co\\.uk|com\\.au|de|es|fr|it|jp|nl|pl)/videoplay\\?", "metacafe\\.com/watch/", "one\\.revver\\.com/watch/", "revver\\.com/video/", "video\\.xanga\\.com/.+/video.html", "vids\\.myspace\\.com/", "veoh\\.com/videos/"],
        other: ["imdb\\.com.*\\/(title|name)\\/(tt|nm)[\\d]+(\\/\\w*)?$", "finance\\.yahoo\\.com/q(/bc)?\\?s=", "finance\\.google\\.com/finance\\?q=", "moneycentral\\.msn\\.com/detail/stock_quote\\?Symbol=", "money\\.cnn\\.com/quote/quote\\.html", "marketwatch\\.com/quotes/", "quote\\.morningstar\\.com/Quote/Quote\\.aspx\\?ticker=", "quotes\\.nasdaq\\.com/asp/SummaryQuote.asp\\?symbol=", "www\\.nyse\\.com/about/listed/lcddata.html\\?ticker=", "photobucket\\.com/albums", "amazon\\.com/(gp/product|dp)/[A-Z0-9]{10}/", "amazon\\.com\\/.+\\/(ASIN|asin)\\/[A-Z0-9]{10}", "amazon\\.com/exec/obidos/(ASIN|asin)/[A-Z0-9]{10}/", "amazon\\.com/[^/]+/dp/[A-Z0-9]{10}/", "amazon\\.com/-/[A-Z0-9]{10}/", "amazon\\.com/[^/]+/dp/", "amazon\\.com%2F[^/]+%2Fdp%2F", "flickr\\.com/photos/", "seekingalpha.com/symbol/.+", "stocks\\.us\\.reuters\\.com/stocks/(overview|charts)\\.asp\\?(symbol|ticker)=", "stocks\\.us\\.reuters\\.com/stocks/companyNews\\.asp\\?symbol=", "myspace\\.com/", "maps\\.google\\.com/maps", "picasaweb\\.google\\.(com|ca|co\\.uk|com\\.au|de|es|fr|it|nl|pl)/.+/.+", "wowhead\\.com.+item=", "wowarmory\\.com/item-info.xml", "thottbot\\.com/i", "wow\\.allakhazam\\.com/db/item.html", "goblinworkshop\\.com/beta-items/", "crunchbase\\.com/(company|person|financial-organization|service-provider)/.+"]
    },
    img_url_exclude_re: ["photobucket\\.com/albums", "flickr\\.com/photos/", "picasaweb\\.google\\.(com|ca|co\\.uk|com\\.au|de|es|fr|it|nl|pl)/.+", "maps\\.google\\.com/.+", "^[^/]*\\.tomshardware.com", "^[^/]*\\.tomsguide.com", "^[^/]*\\.tomsgames.com", "^[^/]*\\.thetorquereport.com", "^[^/]*\\.techdarling.com"],
    url_exclude_re: ["www\\.facebook\\.com/share\\.php", "www\\.digg\\.com/submit\\?", "del\\.icio\\.us/post", "technorati\\.com/tags/", "technorati\\.com/search/", "www\\.addthis\\.com/bookmark\\.php", "www\\.addthis\\.com/feed\\.php", "feeds\\.feedburner\\.com/", "www\\.feedburner\\.com/fb/a/emailFlare\\?", "www\\.feedburner\\.com/fb/a/survey\\?", "twitthis\\.com/twit\\?", "www\\.blogger\\.com/email-post\\.g\\?", "outside\\.in/stories/submit\\?", "reddit\\.com/submit\\?", "www\\.stumbleupon\\.com/submit\\?", "www\\.sphere\\.com/search\\?", "photo\\.xanga\\.com/.+", "x..\\.xanga\\.com/.+", "www\\.addtoany\\.com/", "buzz\\.yahoo\\.com/article/", "ping\\.fm/ref/\\?", "traffic\\.outbrain\\.com/network/redir\\?"],
    rich_shot_exceptions: null,
    resize: {
        img_sized: {
            large: "size_462/",
            small: "size_305/"
        },
        w: 150,
        h: 95,
        w_list: ["main", "preview_div", "preview", "bubble", "search", "box", "options", "option_iframe", "marea", "flash_overlay", "drag_overlay", "img_a", "body", "bubble_img", "bg_body"],
        h_list: ["main", "preview_div", "preview", "bubble", "flash_overlay", "img_a", "body", "bubble_img", "bg_body"],
        rz: false,
        rz_w: 1250,
        rz_h: 530,
        lb: {
            rz: false,
            w: 300,
            h: 250
        }
    },
    auto_shot: {
        on: false,
        treatment: "2px dotted",
        color_opt: "",
        color: "#447722",
        rlimit_re: null,
        item_limit: 1,
        spacing: 0,
        plimit: 0,
        plimit_re: null,
        limit: "7",
        rescan: false,
        target: "",
        list: [],
        list_tid: {},
        timestamp: 0,
        inspect: false
    },
    rnd: "fe65dc8fbbda6cfcd7987c645637f506",
    url_max: 37,
    text: {
        Options: "Options",
        Disable: "Disable",
        SearchTheWeb: "Search the Web on Snap.com",
        GetFreePreviews: "Get Free Shots",
        SearchButton: "Search",
        GoToURL: "Go to %URL",
        SubmitSearch: "Submit your search",
        SignUpLink: "Sign Up and add Free Snap Shots to your site in less than 5 min!",
        SnapLogoTooltip: "Powered by Snap",
        OptionsTooltip: "Snap Shots Options",
        OptionsClose: "Close Options",
        EnlargeShotSize: "Make this Shot larger",
        ReduceShotSize: "Make this Shot smaller",
        ClickToPlay: "Click to play"
    },
    fl: ""
};
SNAP_COM.hash = function(str) {
    var h = 5003;
    for (var i = 0; i < str.length; ++i) {
        h += str.charCodeAt(i);
        h += (h << 10);
        h ^= (h >> 6);
    }
    h += (h << 3);
    h ^= (h >> 11);
    h += (h << 15);
    return Math.abs(h);
};
SNAP_COM.size = function() {
    var e, e2;
    if (e = document.getElementById('alpha')) {
        if (e2 = document.getElementById('beta')) {
            return e.innerHTML.length + e2.innerHTML.length;
        }
        return e.innerHTML.length;
    }
    if (e = document.getElementById('beta')) {
        return e.innerHTML.length;
    }
    if (e = document.getElementById('blogbody')) {
        return e.innerHTML.length;
    }
    if (e = document.getElementById('main')) {
        return e.innerHTML.length;
    }
    if (e = document.getElementById('content')) {
        return e.innerHTML.length;
    }
    if (e = document.getElementsByTagName('body')[0]) {
        return e.innerHTML.length;
    }
    return 0;
};
SNAP_COM.marea = {
    ad_src_base: 'http://ad.doubleclick.net/pfadj/ss.fls/;dcmt=text/javascript;sk=f3a32a31f420f80b6a7ec2f1f1099d42;sov=0;bub=0;ord=1111111111?',
    ad_type: 'doubleclick-fallback'
};
SNAP_COM.shot_main_js = function() {
    if (SNAP_COM.shot_main_js_called === true) return;
    SNAP_COM.shot_main_js_called = true;
    var s = document.getElementsByTagName("script")[0];
    var js = document.createElement("script");
    js.type = "text/javascript";
    js.src = "http://i.ixnp.com/shot_main_js/v3.73/";
    s.parentNode.insertBefore(js, s);
    var js = document.createElement("script");
    js.type = "text/javascript";
    js.src = "http://shots.snap.com/asj/v1/f3a32a31f420f80b6a7ec2f1f1099d42/" + SNAP_COM.hash(document.location.href) + "/auto_shot.js?sz=" + SNAP_COM.size() + "&lm=" + escape(document.lastModified) + "&size=small&ad_only=1&accept=shots";
    s.parentNode.insertBefore(js, s);
}
SNAP_COM.window_onload = function() {
    SNAP_COM.window_loaded = true;
};
if (window.addEventListener) {
    window.addEventListener("load", SNAP_COM.window_onload, false);
} else if (window.attachEvent) {
    window.attachEvent("onload", SNAP_COM.window_onload);
}
SNAP_COM.shot_main_js(); //-->



if (typeof SNAP_COM == "undefined") {
    SNAP_COM = {}
}
SNAP_COM.get_js_src = function() {
    var D, C, E = null;
    var B = /\/(snap_preview_anywhere|snap_shots).js/;
    var A = document.getElementsByTagName("script");
    C = A.length;
    for (D = 0; D < C; D++) {
        if (A[D].src.search(B) != -1) {
            if (!E || (E && A[D].src.search(/plugin=1/))) {
                E = A[D].src
            }
        }
    }
    return E
};
SNAP_COM.timer_obj = function() {
    var A = {
        events: {},
        on: false,
        logged: false,
        el: null,
        id: null,
        reset: function() {
            this.events = {}
        },
        set_id: function(B) {
            this.id = B
        },
        enabled: function(B) {
            this.on = B ? true: false
        },
        mark: function(B) {
            if (!this.on) {
                return
            }
            this.events[B] = (new Date()).getTime()
        },
        sequence: function() {
            var E, B, H, F = [],
            D = {};
            if (!this.on) {
                return undefined
            }
            for (E in this.events) {
                if (this.events.hasOwnProperty(E)) {
                    F.push(E)
                }
            }
            var C = this.events;
            function G(J, I) {
                return C[J] - C[I]
            }
            F.sort(G);
            H = this.events[F[0]];
            B = F.length;
            for (E = 0; E < B; E++) {
                D[F[E]] = (this.events[F[E]] - H)
            }
            return D
        },
        log: function(E) {
            var D, I, H, C;
            if (!this.on || this.logged || !this.events.show) {
                return
            }
            var F = {
                mouseover: "a",
                mouseout: "b",
                show: "c",
                hide: "d",
                doubleclick_start: "e",
                doubleclick_end: "f",
                preview_start: "g",
                preview_end: "h",
                rss_check_start: "i",
                rss_check_end: "j",
                shot_iframe_start: "k",
                shot_iframe_end: "l",
                marea_start: "m",
                marea_end: "n",
                shotsense_start: "o",
                shotsense_end: "p",
                click: "q"
            };
            var B = this.sequence();
            var G = "";
            for (D in F) {
                if (F.hasOwnProperty(D) && B[D] !== undefined) {
                    G += F[D] + B[D]
                }
            }
            H = E.cfg.prefix.image + "snip/tmr/" + G + "/" + this.id + "/" + E.cfg.key + "/" + E.dfs() + "/tmr";
            I = "snap_com_shot_tmr_img";
            C = document.getElementById(I);
            if (!C) {
                C = document.createElement("img");
                C.id = I;
                C.style.position = "absolute";
                C.style.visiblility = "hidden";
                C.style.zIndex = "0";
                C.src = H;
                E.div.main.insertBefore(C, null)
            } else {
                C.src = H
            }
            this.logged = true
        }
    };
    return A
};
SNAP_COM.snap_shot_obj = function() {
    var A = {};
    A = {
        div: null,
        lb: null,
        timer_id: null,
        div_added: null,
        lb_added: null,
        current_element: null,
        current_url: null,
        current_tag: null,
        current_orientation: "lr",
        other_bubbles: new Array,
        thumbnail_precrawl_list: new Array,
        num_precrawl_sent: 0,
        retry_url_list: {},
        body_loaded: false,
        init: function() {
            var D, C, E, B, H;
            this.div = {};
            this.lb = {};
            this.observer_array = new Array;
            this.timer_id = {
                show: null,
                partial: null,
                prefetch: null,
                tok: null
            };
            this.div_added = false;
            this.current_element = null;
            this.current_url = null;
            this.view = {
                id: null,
                time: null,
                confirm: false
            };
            this.imp = {
                icon: 0,
                link: 0,
                auto: 0
            };
            this.cfg = SNAP_COM.shot_config;
            this.long_hide = false;
            this.autoshot_tag_exclude_re = /^(a|area|h\d+|noscript|script|style|head|option|applet|code|link|input|map|textarea|iframe)$/i;
            this.autoshot_plimit_re = null;
            this.autoshot_rlimit_re = null;
            this.first_scan = true;
            this.as_id_count = 0;
            this.as_id = 1;
            this.shotsense_shown = 0;
            this.tmr = new SNAP_COM.timer_obj();
            this.tmr_on = (Math.random() < this.cfg.srate.tmr) ? true: false;
            this.pre_tmr;
            this.marea = {};
            this.hooks = {
                onHide: []
            };
            if (this.cfg.shots_domain_match) {
                H = this.cfg.shots_domain_match.replace(/[^-\w\.]/g, "");
                this.is_internal_re = new RegExp("^(http|file)s?://.*" + H + "/")
            } else {
                B = document.location.href.match(/^(http|file)s?:\/\/(www\.)?(.*?)\//);
                this.is_internal_re = new RegExp("^(http|file)s?://(www.)?" + B[3] + "/")
            }
            if (this.cfg.rtl) {
                for (D in this.cfg.rtl_css_pos) {
                    var G = this.cfg.rtl_css_pos[D];
                    if (this.cfg.css_pos[G].x != undefined && this.cfg.css_pos[G].x != null) {
                        this.cfg.css_pos[G].xr = this.cfg.css_pos[G].x;
                        this.cfg.css_pos[G].x = null
                    } else {
                        if (this.cfg.css_pos[G].xr != undefined && this.cfg.css_pos[G].xr != null) {
                            this.cfg.css_pos[G].x = this.cfg.css_pos[G].xr;
                            this.cfg.css_pos[G].xr = null
                        }
                    }
                }
            }
            this.rich_shot_type_re = {};
            if (!this.cfg.rich_shot_re) {
                this.preview_re = new RegExp("(.)", "i")
            } else {
                var F = [];
                for (D in this.cfg.rich_shot_re) {
                    if (this.cfg.rich_shot_re.hasOwnProperty(D)) {
                        this.rich_shot_type_re[D] = new RegExp("(" + this.cfg.rich_shot_re[D].join("|") + ")", "i");
                        F = F.concat(this.cfg.rich_shot_re[D])
                    }
                }
                this.preview_re = new RegExp("(" + F.join("|") + ")", "i")
            }
            this.rich_shot_exceptions_re = new RegExp("(" + this.cfg.rich_shot_exceptions + ")", "i");
            this.img_url_exclude_re = new RegExp("(" + this.cfg.img_url_exclude_re.join("|") + ")", "i");
            this.url_exclude_re = new RegExp("^https?://(" + this.cfg.url_exclude_re.join("|") + ")", "i");
            if (this.cfg.auto_shot) {
                if (this.cfg.auto_shot.plimit_re) {
                    this.autoshot_plimit_re = new RegExp(this.cfg.auto_shot.plimit_re)
                }
                if (this.cfg.auto_shot.rlimit_re) {
                    this.autoshot_rlimit_re = new RegExp(this.cfg.auto_shot.rlimit_re)
                }
            }
            if (SNAP_COM.window_loaded) {
                this.onload();
                return
            }
            this.observe(window, "load", this.onload);
            if (this.cfg.check_defer) {
                E = document.getElementById("snap_preview_anywhere");
                if (!E || !E.defer) {
                    return
                }
            }
            if (document.defaultView && document.defaultView.getComputedStyle) {
                this.getStyle = this.getStyleW3C
            } else {
                if (document.documentElement.currentStyle && this.isIE) {
                    this.getStyle = this.getStyleIE
                }
            }
            this.timer_id.partial = this.later(this.cfg.partial_check.delay, this.partial_check);
            if (this.cfg.plugin) {
                SNAP_COM.clientActive = true
            } else {
                SNAP_COM.original_key = this.cfg.key
            }
        },
        autoshot_init: function(J) {
            var F, H, D, E, I = [],
            B,
            G = this.cfg.auto_shot,
            C = SNAP_COM.autoshot;
            if (!G.list_tid === undefined) {
                G.list_tid = {}
            }
            if (!G.color && G.color_opt == "site") {
                B = document.getElementsByTagName("a");
                if (B.length) {
                    B = B[0];
                    G.color = this.getStyle(B, "color")
                }
            }
            if (!G.timestamp) {
                G.timestamp = 0
            }
            if (SNAP_COM.autoshot_inspect) {
                if (!C) {
                    C = {}
                }
                if (!C.Results) {
                    C.Results = {}
                }
                if (!C.Results.Matches) {
                    C.Results.Matches = []
                }
                C.Results.Matches = C.Results.Matches.concat(SNAP_COM.autoshot_inspect)
            }
            if (C && C.Results && C.Results.Matches) {
                H = C.Results.Matches.length;
                for (F = 0; F < H; F++) {
                    D = C.Results.Matches[F].Match;
                    if (!G.inspect && D.inspect) {
                        continue
                    }
                    if ((D.pt == "lb" && !this.cfg.enabled.linkbubbles) || (D.pt == "pe" && !this.cfg.enabled.engage_premium) || (D.pt == "be" && !this.cfg.enabled.engage_basic)) {
                        continue
                    }
                    if (!D.link && D.svc.match(/\bsnap_(linkbubbles?|shots?_(custom|wikipedia))/i)) {
                        D.link = true
                    }
                    E = {
                        id: this.as_id++,
                        re: new RegExp(D.pat, "i"),
                        pat: D.pat,
                        type: D.svc,
                        value: D.tag,
                        product: D.pt,
                        trigger: ((D.pt == "lb") ? "link": "both"),
                        target: D.target || G.target || "",
                        linkbubble: (D.pt == "lb") ? true: false,
                        tid: D.tid,
                        eid: D.eid,
                        link: D.link,
                        found: 0,
                        gfound: 0,
                        active: 0,
                        limit: ((D.limit !== undefined) ? D.limit: G.item_limit),
                        inspect: ((D.inspect || G.inspect_all) ? 1 : 0),
                        testset: D.testset ? 1 : 0
                    };
                    if (G.list_tid[D.tid] !== undefined) {
                        if (D.inspect) {
                            G.list[G.list_tid[D.tid]].testset = 1
                        } else {
                            G.list[G.list_tid[D.tid]] = E
                        }
                    } else {
                        G.list_tid[D.tid] = G.list.length;
                        G.list.push(E)
                    }
                    if (!G.timestamp && D.timestamp) {
                        G.timestamp = D.timestamp
                    }
                }
                SNAP_COM.autoshot = undefined
            }
            H = G.list.length;
            for (F = 0; F < H; F++) {
                I.push(G.list[F].pat)
            }
            if (I.length) {
                this.autoshot_re = new RegExp("(" + I.join("|") + ")", "ig")
            } else {
                this.autoshot_re = undefined
            }
            if (J && !this.cfg.partial_check.attempts && this.body_loaded) {
                this.add_main_div();
                this.shot_scan()
            }
        },
        later: function(D, E) {
            var C = this;
            var B = Array.prototype.slice.apply(arguments, [2]);
            return this.sto(function() {
                E.apply(C, B)
            },
            D)
        },
        observe: function(E, C, H) {
            var D = this;
            var B = Array.prototype.slice.apply(arguments, [3]);
            B.unshift(undefined);
            var G = function(I) {
                B[0] = I;
                H.apply(D, B)
            };
            var F;
            if (E.addEventListener) {
                if (C == "mousewheel") {
                    C = "DOMMouseScroll"
                }
                E.addEventListener(C, G, false)
            } else {
                if (E.attachEvent) {
                    E.attachEvent("on" + C, G)
                }
            }
            this.observer_array.push({
                element: E,
                name: C,
                method: G
            })
        },
        unobserve_all: function() {
            var D = this.observer_array.length;
            for (var B = 0; B < D; B++) {
                var C = this.observer_array.pop();
                if (C.element.removeEventListener) {
                    C.element.removeEventListener(C.name, C.method, false)
                } else {
                    if (C.element.detachEvent) {
                        C.element.detachEvent("on" + C.name, C.method)
                    }
                }
            }
        },
        el_prop: function(C, B, D) {
            if (D !== undefined) {
                if (!C.snap_com_shot) {
                    C.snap_com_shot = {}
                }
                C.snap_com_shot[B] = D
            }
            try {
                return C.snap_com_shot && C.snap_com_shot[B]
            } catch(E) {
                return null
            }
        },
        now: function() {
            return (new Date()).getTime()
        },
        clear_timer: function(B) {
            if (this.timer_id[B]) {
                clearTimeout(this.timer_id[B]);
                this.timer_id[B] = 0
            }
        },
        campaign: function(B) {
            return B
        },
        is_internal_link: function(D) {
            var B, C;
            if (D.href.match(this.is_internal_re)) {
                if (this.cfg.redirect_param) {
                    B = "[\\?&]" + this.cfg.redirect_param + "=([^&#]*)";
                    C = new RegExp(B);
                    if (C.exec(D.href) === null) {
                        return true
                    } else {
                        return false
                    }
                } else {
                    return true
                }
            } else {
                return false
            }
        },
        is_valid_link: function(C) {
            var D = C.href.match(/^(http)s?:\/\/([^#]*)/);
            var B = document.location.href.match(/^(http|file)s?:\/\/([^#]*)/);
            if (!D || !B || (D[2] == B[2]) || (D[1] !== "http")) {
                return false
            }
            return true
        },
        add_link_icon: function(D, B) {
            var C = this.div.link_icon.cloneNode(false);
            C.style.verticalAlign = "top";
            C.style.display = "inline";
            C.style.visibility = "visible";
            C.style.zIndex = D.style.zIndex;
            this.el_prop(C, "activated", true);
            this.el_prop(C, "is_link_icon", true);
            this.el_prop(C, "shot_parent", D);
            this.el_prop(D, "link_icon", C);
            if (this.cfg.link_icon_types && B && B.match(/^(video|music|wiki)$/)) {
                this.changePaletteImg(C, "link_icon_" + B, null)
            }
            if (this.el_prop(D, "markup") && (D.style.visibility == "hidden" || D.style.display == "none")) {
                D.parentNode.insertBefore(C, D.nextSibling)
            } else {
                D.appendChild(C)
            }
            return C
        },
        activate: function(D) {
            var H, B, F, J, C;
            if (this.el_prop(D, "done")) {
                return
            }
            B = D.childNodes;
            var G = false;
            for (H = 0; H < B.length; H++) {
                var E = B[H];
                if (E.nodeType == 3) {
                    var I = E.nodeValue;
                    I = I.replace(/[ \t\r\n]/g, "");
                    if (I.length != 0) {
                        G = true
                    }
                } else {
                    if (E.tagName != "IMG") {
                        G = true
                    }
                }
            }
            if (D.tagName.match(/^AREA$/i) || !G) {
                this.el_prop(D, "trigger", "link")
            }
            if (D.tagName.toLowerCase() == "a") {
                for (H in this.rich_shot_type_re) {
                    if (this.rich_shot_type_re.hasOwnProperty(H)) {
                        if (this.rich_shot_type_re[H].test(D.href)) {
                            C = H;
                            break
                        }
                    }
                }
            }
            switch (this.el_prop(D, "trigger")) {
            case "both":
                F = D;
                this.add_link_icon(D, C);
                this.imp.icon++;
                this.imp.link++;
                break;
            case "icon":
                F = this.add_link_icon(D, C);
                this.imp.icon++;
                break;
            default:
                F = D;
                this.imp.link++;
                break
            }
            this.el_prop(F, "activated", true);
            if (this.cfg.observe_event == "link") {
                this.observe(F, "mouseover", this.show_delay, this.cfg.delay.show, this.cfg.delay.move);
                this.observe(F, "mouseout", this.hide_delay, this.cfg.delay.hide);
                this.observe(F, "click", this.hide_delay, 0)
            }
            this.el_prop(D, "done", true)
        },
        conditional_activate: function(C, D) {
            if (this.el_prop(C, "done") || !this.is_valid_link(C)) {
                this.el_prop(C, "done", true);
                return false
            }
            if (!this.cfg.image_trigger) {
                var B = C.href.match(/\w+:\/\/([^#]*)/);
                if (B && B[1].match(this.img_url_exclude_re)) {
                    if (C.getElementsByTagName("img").length) {
                        this.el_prop(C, "done", true);
                        return false
                    }
                }
            }
            if (D.shot[0] && C.href.indexOf("https://") == -1 && !C.href.match(this.url_exclude_re) && (this.cfg.show_internal || !this.is_internal_link(C))) {
                this.activate(C);
                return true
            } else {}
            return false
        },
        autoshot_match: function(H, G) {
            var E, D, F, C;
            var B = [];
            if (!this.autoshot_re) {
                return B
            }
            this.autoshot_re.lastIndex = 0;
            C = this.cfg.auto_shot.list.length;
            while ((D = this.autoshot_re.exec(H)) != null) {
                for (F = 0; F < C; F++) {
                    E = this.cfg.auto_shot.list[F];
                    if (E.re.test(D[1])) {
                        if (G) {
                            E.gfound++
                        } else {
                            B.push({
                                pos: (this.autoshot_re.lastIndex - D[1].length),
                                len: D[1].length,
                                text: D[1],
                                as: E
                            })
                        }
                        break
                    }
                }
            }
            return B
        },
        autoshot_limit: function(B, F, D) {
            var G = undefined,
            E = undefined,
            C = B.as;
            if (this.imp.auto >= this.cfg.auto_shot.limit || C.inspect || C.active >= C.limit) {
                return false
            }
            if (this.cfg.auto_shot.plimit) {
                G = this.el_prop(F, "p_count") || 0;
                if (!F || G >= this.cfg.auto_shot.plimit) {
                    return false
                }
                G++
            }
            if (this.autoshot_rlimit_re) {
                D = D || F;
                E = this.el_prop(D, "r_count") || {};
                if (!D || E[C.id]) {
                    return false
                }
                E[C.id] = (E[C.id] || 0) + 1
            }
            if ((B.pos - B.last_pos) < this.cfg.auto_shot.spacing) {
                return false
            }
            this.el_prop(F, "p_count", G);
            this.el_prop(D, "r_count", E);
            C.active++;
            this.imp.auto++;
            return true
        },
        autoshot_add: function(L, S) {
            var N, O, I, B, D, E, Q, M, C, R, H, K, G, P, F, J;
            if (L.nodeType != 3 || !S.in_body[0] || S.activated[0] || !S.autoshot_ok[0] || !S.shot[0] || !this.autoshot_re) {
                return L
            }
            if (!this.cfg.auto_shot.inspect && this.imp.auto >= this.cfg.auto_shot.limit) {
                return L
            }
            Q = L.nodeValue;
            G = 0;
            C = this.autoshot_match(Q);
            O = C.length;
            for (N = 0; N < O; N++) {
                M = C[N];
                M.as.found++;
                M.last_pos = (S.as_dist * -1) + G;
                if (this.autoshot_limit(M, S.p_node[0], S.r_node[0])) {
                    S.as_dist = 0;
                    if (M.as.trigger != "icon") {
                        L.nodeValue = Q.substr(G, (M.pos - G))
                    } else {
                        L.nodeValue = Q.substr(G, (M.pos - G + M.len))
                    }
                    G = M.pos + M.len;
                    B = document.createTextNode(Q.substr(G));
                    L.parentNode.insertBefore(B, L.nextSibling);
                    D = document.createElement("span");
                    D.className = M.as.type;
                    D.style.display = "none";
                    D.innerHTML = " " + M.as.value + " ";
                    this.el_prop(D, "auto", true);
                    this.el_prop(D, "markup", true);
                    this.el_prop(D, "trigger", M.as.trigger);
                    this.el_prop(D, "autoshot_data", {
                        pattern: M.text,
                        linkbubble: M.as.linkbubble,
                        eid: M.as.eid || "",
                        tid: M.as.tid || "",
                        product: M.as.product || ""
                    }),
                    L.parentNode.insertBefore(D, L.nextSibling);
                    this.activate(D);
                    P = this.el_prop(D, "link_icon");
                    if (P) {
                        P.id = "snap_com_shot_engage_icon_" + this.as_id_count;
                        this.activate(P)
                    }
                    if (M.as.trigger != "icon") {
                        if (M.as.link) {
                            E = document.createElement("a");
                            if (M.as.link === true) {
                                F = this.get_shot_data(D);
                                J = this.dfs();
                                K = this.cfg.source;
                                H = this.cfg.campaign;
                                if (M.as.linkbubble) {
                                    J = this.dfs(this.cfg.dfs, 4);
                                    H = "linkbubble";
                                    K = this.cfg.key
                                } else {
                                    if (F.svc.match(/wikipedia/i)) {
                                        J = this.dfs(this.cfg.dfs, 2)
                                    }
                                }
                                E.href = this.cfg.prefix.preview + "explore/" + Math.floor((Math.random() * 100000)) + "/?key=" + (SNAP_COM.original_key || this.cfg.key) + "&svc=" + encodeURIComponent(F.svc) + "&tag=" + encodeURIComponent(F.tag) + "&src=" + encodeURIComponent(K) + "&cp=" + H + "&asp=" + encodeURIComponent(M.text) + "&dfs=" + J + "&tol=engage"
                            } else {
                                E.href = M.as.link
                            }
                            E.style.cursor = "pointer"
                        } else {
                            E = document.createElement("span");
                            E.style.cursor = "default"
                        }
                        if (this.cfg.auto_shot.color) {
                            E.style.color = this.cfg.auto_shot.color
                        } else {
                            if (L.parentNode) {
                                E.style.color = this.getStyle(L.parentNode, "color")
                            }
                        }
                        E.innerHTML = M.text;
                        E.target = M.as.target;
                        E.style.paddingBottom = "0px";
                        if (M.as.linkbubble) {
                            E.style.textDecoration = "underline";
                            E.style.color = "#0000ee";
                            E.style.borderBottom = "1px solid #0000ee";
                            E.style.paddingBottom = "1px";
                            this.el_prop(E, "trigger", "link");
                            R = this;
                            (function(T) {
                                R.observe(T, "mouseout",
                                function() {
                                    T.style.borderBottomWidth = "1px"
                                });
                                R.observe(T, "mouseover",
                                function() {
                                    T.style.borderBottomWidth = "2px"
                                })
                            })(E)
                        } else {
                            E.style.textDecoration = "none";
                            if (this.cfg.auto_shot.treatment) {
                                E.style.borderBottom = this.cfg.auto_shot.treatment + " " + this.cfg.auto_shot.color
                            }
                        }
                        E.id = "snap_com_shot_engage_span_" + this.as_id_count;
                        this.el_prop(E, "shot_parent", D);
                        this.activate(E);
                        this.el_prop(E, "trigger", "both");
                        L.parentNode.insertBefore(E, L.nextSibling)
                    }
                    this.as_id_count++;
                    L = B
                }
            }
            S.as_dist += (Q.length - G)
        },
        scan_tree: function(E, H) {
            var F, I, K, D = false,
            M, P, N, L, J, O, G, B = {},
            C;
            if (E && E.tagName) {
                F = E.className.match(/(snap_\w+)/ig);
                if (F) {
                    K = F.length;
                    for (I = 0; I < K; I++) {
                        switch (F[I].toLowerCase()) {
                        case "snap_preview":
                        case "snap_shot":
                        case "snap_shots":
                            if (B.shot !== false) {
                                B.shot = true
                            }
                            break;
                        case "snap_nopreview":
                        case "snap_noshot":
                        case "snap_noshots":
                            B.shot = false;
                            break;
                        case "snap_no_icon":
                            B.trigger = "link";
                            break;
                        case "snap_trigger_icon":
                            B.trigger = "icon";
                            break;
                        case "snap_trigger_both":
                            B.trigger = "both";
                            break;
                        default:
                            if (F[I].match(/snap_(linkbubble|shots?_(?!attribute))/i)) {
                                D = true;
                                if (this.lb_is_linkbubble(F[I]) && !this.lb_added) {
                                    this.lb_add_div()
                                }
                            }
                            break
                        }
                    }
                }
                if (E.getAttribute("itxtdid")) {
                    B.shot = false
                }
                M = E.tagName.match(/^(A|AREA)$/i) ? true: false;
                if (this.autoshot_tag_exclude_re.exec(E.tagName)) {
                    B.autoshot_ok = false
                }
                if (E.tagName.toLowerCase() == "body") {
                    B.in_body = true
                }
                if (E.tagName.toLowerCase() == "p" || (this.autoshot_plimit_re && this.autoshot_plimit_re.exec(E.className))) {
                    B.p_node = E
                }
                if (this.autoshot_rlimit_re && this.autoshot_rlimit_re.exec(E.className)) {
                    B.r_node = E
                }
                for (I in B) {
                    if (B.hasOwnProperty(I) && B[I] !== undefined) {
                        H[I].unshift(B[I])
                    }
                }
                if (this.cfg.enabled.shots && (M || D) && !this.el_prop(E, "done")) {
                    this.el_prop(E, "trigger", H.trigger[0]);
                    if (!this.cfg.rich_only || D || (E.href && !this.is_preview_url(E.href))) {
                        if (B.shot === false) {
                            this.el_prop(E, "done", true)
                        } else {
                            if (D) {
                                if (!M) {
                                    this.el_prop(E, "trigger", "icon")
                                }
                                this.el_prop(E, "markup", true);
                                this.activate(E);
                                B.activated = true
                            } else {
                                if (B.shot === true) {
                                    this.activate(E);
                                    B.activated = true
                                } else {
                                    if (this.conditional_activate(E, H)) {
                                        B.activated = true
                                    }
                                }
                            }
                        }
                    }
                    if (this.cfg.thumbnail_precrawl == 1) {
                        this.cfg.thumbnail_precrawl = 10
                    }
                    if (this.cfg.thumbnail_precrawl != 0 && E.href && this.is_preview_url(E.href) && B.activated && this.thumbnail_precrawl_list.length < this.cfg.thumbnail_precrawl && (E.id == null || E.id.indexOf("snap_com_shot") == -1)) {
                        this.thumbnail_precrawl_list.push(E.href)
                    }
                    if (!B.activated) {
                        this.el_prop(E, "trigger", false)
                    }
                }
                if (this.el_prop(E, "trigger")) {
                    H.activated.unshift(true);
                    B.activated = true
                }
            }
            G = undefined;
            E = E.firstChild;
            while (E) {
                C = E.nextSibling;
                if (E.nodeType == 3 && E.parentNode && this.autoshot_re && !this.el_prop(E.parentNode, "autoshot_done")) {
                    this.autoshot_add(E, H);
                    G = E.parentNode
                } else {
                    this.scan_tree(E, H)
                }
                E = C
            }
            if (G && !this.cfg.auto_shot.rescan) {
                this.el_prop(G, "autoshot_done", true)
            }
            for (I in B) {
                if (B.hasOwnProperty(I) && B[I] !== undefined) {
                    H[I].shift()
                }
            }
        },
        shot_scan: function(C) {
            var D, B;
            if (this.cfg.defer_scan) {
                return
            }
            if (!C || C == document) {
                C = document
            }
            var F = {
                shot: [this.cfg.auto_preview],
                trigger: [],
                activated: [false],
                autoshot_ok: [true],
                p_node: [],
                r_node: [],
                as_dist: 99999,
                in_body: [false]
            };
            var E = C;
            while (E = E.parentNode) {
                if (E.tagName) {
                    if (E.tagName.toLowerCase() == "body") {
                        F.in_body[0] = true
                    } else {
                        if (this.autoshot_tag_exclude_re.exec(E.tagName)) {
                            F.autoshot_ok[0] = false
                        }
                    }
                }
            }
            if (SNAP_COM.autoshot) {
                this.autoshot_init()
            }
            if (this.cfg.show_link_icon) {
                F.trigger.push(this.cfg.preview_trigger)
            } else {
                F.trigger.push("link")
            }
            if (this.cfg.enabled.linkbubbles) {
                this.lb_add_div()
            }
            this.scan_tree(C, F);
            if (this.cfg.auto_shot.inspect) {
                B = this.cfg.auto_shot.list.length;
                for (D = 0; D < B; D++) {
                    this.cfg.auto_shot.list[D].gfound = 0
                }
                this.autoshot_match(this.get_inner_text(document.getElementsByTagName("html")[0]), true)
            }
            if (this.cfg.thumbnail_precrawl) {
                this.sendPrecrawlList()
            }
        },
        partial_check: function() {
            var F;
            var C;
            var B;
            var E = 0;
            var D = this.cfg.partial_check.delay;
            if (this.cfg.rescan_after_load && this.body_loaded) {
                this.cfg.partial_check.attempts = 1;
                D = this.cfg.rescan_delay
            }
            this.clear_timer("partial");
            if (this.cfg.partial_check.attempts <= 0) {
                return
            }
            if (document.getElementsByTagName("body").length) {
                if (!this.div_added) {
                    this.add_main_div()
                }
                E = document.getElementsByTagName("*").length;
                if (E !== this.last_partial_check_count) {
                    F = this.now();
                    this.shot_scan();
                    C = this.now() - F;
                    E = document.getElementsByTagName("*").length;
                    B = C * 3;
                    if (B > 10000) {
                        B = 10000
                    }
                    D += B;
                    this.last_partial_check_count = E
                }
                if (this.first_scan) {
                    this.first_scan = false
                } else {
                    this.sample()
                }
            }
            this.timer_id.partial = this.later(D, this.partial_check);
            this.cfg.partial_check.attempts--
        },
        onload: function() {
            this.clear_timer("partial");
            this.cfg.partial_check.attempts = 0;
            this.body_loaded = true;
            if (this.cfg.rescan_after_load) {
                this.partial_check()
            }
            if (!this.div_added) {
                this.add_main_div()
            }
            this.shot_scan();
            this.sample()
        },
        get_all_shot_nodes: function(D, F, G) {
            var C = D.getElementsByTagName("*");
            for (var B = 0; B < C.length; B++) {
                if (C[B].id) {
                    var E = C[B].id.match(/^snap_com_shot_(\w+)/);
                    if (E) {
                        F[E[1]] = C[B]
                    }
                }
            }
            return F
        },
        reset_css: function(B) {
            var C = B.style;
            C.maxHeight = "2000px";
            C.maxWidth = "2000px";
            C.minWidth = "0px";
            C.minHeight = "0px";
            C.margin = "0 0 0 0";
            C.padding = "0 0 0 0";
            C.border = "0";
            C.fontStyle = "normal";
            C.fontWeight = "normal";
            C.fontFamily = '"trebuchet ms", arial, helvetica, sans-serif';
            C.cssFloat = "none";
            C.styleFloat = "none";
            C.position = "static";
            C.left = "auto";
            C.top = "auto";
            C.lineHeight = "normal";
            C.backgroundImage = "url(" + this.cfg.prefix.cdn_image + "t.gif)";
            C.backgroundColor = "transparent"
        },
        set_loc: function(G, F) {
            var C, B = {
                x: "left",
                xr: "right",
                y: "top",
                yb: "bottom",
                w: "width",
                h: "height"
            };
            for (C in G) {
                if (!G.hasOwnProperty(C)) {
                    continue
                }
                var E = G[C];
                F[C].style.position = "absolute";
                for (var D in B) {
                    if (((typeof B[D]) == "string") && (E[D] !== null) && (E[D] !== undefined)) {
                        F[C].style[B[D]] = E[D] + "px"
                    }
                }
            }
        },
        set_css: function(C) {
            var G, E, I, F;
            var H = this.get_active_div(C);
            var B = this.get_active_cfg(C);
            for (F in H) {
                if (!H[F] || !H.hasOwnProperty(F)) {
                    continue
                }
                if (!H[F].style) {
                    continue
                }
                this.reset_css(H[F]);
                G = H[F].style;
                if (F != "main" && !G.visibility) {
                    G.visibility = "inherit"
                }
                G.zIndex = Number(G.zIndex) + (H.demoshot ? 0 : 99999)
            }
            this.set_loc(B.css_pos, H);
            if (this.isIE && document.compatMode && document.compatMode != "CSS1Compat") {
                I = B.css_pos.preview_div;
                H.preview_div.style.width = (I.w + 2) + "px";
                H.preview_div.style.height = (I.h + 2) + "px";
                H.preview.style.width = (I.w + 2) + "px";
                H.preview.style.height = (I.h + 2) + "px";
                I = B.css_pos.img_a;
                H.img_a.style.width = (I.w + 2) + "px";
                H.img_a.style.height = (I.h + 2) + "px";
                H.option_menu.style.width = "1px"
            }
            if (this.isIE) {
                H.option_cancel.style.top = "200px";
                H.option_cancel.style.height = "20px"
            }
            if (document.compatMode && document.compatMode == "CSS1Compat") {
                H.box.style.height = (B.css_pos.box.h - 5) + "px";
                H.box.style.width = (B.css_pos.box.w - 8) + "px"
            }
            for (E = 0; E < B.t_img.length; E++) {
                if (!B.t_img.hasOwnProperty(E)) {
                    continue
                }
                H[B.t_img[E]].src = B.prefix.cdn_image + "t.gif"
            }
            H.loading_img.src = B.prefix.cdn_image + B.resize.img_sized[B.size] + "loading.gif";
            H.cobrand_img.src = B.img.cobrand;
            if (this.needs_png_fix) {
                H.ribbon.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + B.prefix.cdn_image + "ribbon.png',sizingMethod='scale')"
            } else {
                H.ribbon.src = B.prefix.cdn_image + "ribbon.png"
            }
            B.palette.zoom_img = (B.size == "large") ? B.palette.zoom_img_minus: B.palette.zoom_img_plus;
            for (E in B.palette) {
                if (!B.palette.hasOwnProperty(E) || !H[E] || B.palette[E] == null) {
                    continue
                }
                G = H[E].style;
                G.backgroundColor = "transparent";
                G.backgroundImage = "url(" + B.img.palette + ")";
                G.backgroundPosition = B.palette[E].loc;
                G.backgroundRepeat = "no-repeat";
                G.width = B.palette[E].w + "px";
                G.height = B.palette[E].h + "px"
            }
            H.box.style.padding = "3px 0 0 6px";
            for (E in B.style) {
                if (!B.style.hasOwnProperty(E)) {
                    continue
                }
                for (var D in B.style[E]) {
                    if ((typeof B.style[E][D]) == "string") {
                        if (!H[E]) {
                            continue
                        }
                        H[E].style[D] = B.style[E][D]
                    }
                }
            }
            this.share_url = B.prefix.options + "share.php?source=" + encodeURIComponent(B.source) + "&key=" + B.key + "&sb=" + (B.has_marea ? "1": "0") + "&lang=" + B.lang + "&th=" + B.theme + "&rtl=" + B.rtl;
            this.opt_url = B.prefix.options + "options.php?source=" + encodeURIComponent(B.source) + "&key=" + B.key + "&sb=" + (B.has_marea ? "1": "0") + "&lang=" + B.lang + "&th=" + B.theme + "&rtl=" + B.rtl + "&dfs=" + B.dfs;
            H.option_button.alt = B.text.OptionsTooltip;
            H.option_button.title = B.text.OptionsTooltip;
            H.option_a.innerHTML = B.text.Options;
            H.option_a.alt = B.text.OptionsTooltip;
            H.option_a.title = B.text.OptionsTooltip;
            H.disable_a.innerHTML = B.text.Disable;
            H.option_close_a.alt = "Close";
            H.option_close_a.title = "Close";
            H.promo_a.innerHTML = B.text.GetFreePreviews;
            H.promo_a.alt = B.text.SignUpLink;
            H.promo_a.title = B.text.SignUpLink;
            H.logo_a.alt = B.text.SnapLogoTooltip;
            H.logo_a.title = B.text.SnapLogoTooltip;
            H.box.value = B.text.SearchTheWeb;
            H.zoom_img.title = (B.size == "large") ? B.text.ReduceShotSize: B.text.EnlargeShotSize;
            H.ribbon.alt = "Snap Shares for charity";
            H.ribbon.title = "Portions of Snap Shares Ad Impressions on this site are donated to Charity";
            for (E = 0; E < B.hidden.length; E++) {
                if (!B.hidden.hasOwnProperty(E)) {
                    continue
                }
                H[B.hidden[E]].style.visibility = "hidden"
            }
            if ((C == undefined) || SNAP_COM.shot.other_bubbles[C].demoshot) {
                for (E = 0; E < B.collapsed.length; E++) {
                    if (!B.collapsed.hasOwnProperty(E)) {
                        continue
                    }
                    H[B.collapsed[E]].style.display = "none"
                }
            }
        },
        add_main_div: function() {
            var E, F, D = this;
            if (this.div_added) {
                return
            }
            if (F = document.getElementById("snap_com_shot_main")) {
                F.parentNode.removeChild(F)
            }
            var C = document.getElementsByTagName("html")[0];
            C.style.position = "static";
            this.div.main = document.createElement("div");
            this.div.main.id = "snap_com_shot_main";
            this.div.main.style.position = "absolute";
            this.div.main.style.visibility = "hidden";
            if (this.cfg.force != "yes" && !this.isOpera && !this.isSafari) {
                this.div.main.style.top = 0;
                this.sto(function() {
                    if (D.div.main.offsetTop !== 0) {
                        D.div.main.innerHTML = ""
                    }
                },
                0)
            }
            var B = document.getElementsByTagName("body")[0];
            B.insertBefore(this.div.main, B.firstChild);
            this.div.main.className = "snap_noengage snap_noshots";
            this.el_prop(this.div.main, "done", true);
            if (this.cfg.observe_event != "link") {
                this.observe(B, "mouseover", this.show_delay, this.cfg.delay.show, this.cfg.delay.move);
                this.observe(B, "mouseout", this.hide_delay, this.cfg.delay.hide);
                this.observe(B, "click", this.hide_delay, 0)
            }
            this.div_added = true;
            this.div.main.innerHTML = '<img id="snap_com_shot_link_icon" class="snap_preview_icon" style="margin:0 !important" src="__T_GIF__" />\n<div id="snap_com_shot_bg_div_tl"><img id="snap_com_shot_bg_img_tl" src="__T_GIF__" /></div>\n<div id="snap_com_shot_bg_div_tr"><img id="snap_com_shot_bg_img_tr" src="__T_GIF__" /></div>\n<div id="snap_com_shot_bg_div_bl"><img id="snap_com_shot_bg_img_bl" src="__T_GIF__" /></div>\n<div id="snap_com_shot_bg_div_br"><img id="snap_com_shot_bg_img_br" src="__T_GIF__" /></div>\n<img id="snap_com_shot_bg_img_l" src="__T_GIF__" />\n<img id="snap_com_shot_bg_img_r" src="__T_GIF__" />\n<img id="snap_com_shot_bg_img_t" src="__T_GIF__" />\n<img id="snap_com_shot_bg_img_b" src="__T_GIF__" />\n<div id="snap_com_shot_bg_div_point" style="z-index: 1"><img id="snap_com_shot_bg_img_point" src="__T_GIF__" /></div>\n<div id="snap_com_shot_bg_body"></div>\n\n<img style="z-index: 2" id="snap_com_shot_pointer0" src="__T_GIF__" />\n<img style="z-index: 2" id="snap_com_shot_pointer1" src="__T_GIF__" />\n<img style="z-index: 2" id="snap_com_shot_pointer2" src="__T_GIF__" />\n<img style="z-index: 2" id="snap_com_shot_pointer3" src="__T_GIF__" />\n<img style="z-index: 2" id="snap_com_shot_pointer4" src="__T_GIF__" />\n<img style="z-index: 2" id="snap_com_shot_pointer5" src="__T_GIF__" />\n<div id="snap_com_shot_bubble">\n<img id="snap_com_shot_bubble_img" src="__T_GIF__" />\n<div id="snap_com_shot_body">\n <table id="snap_com_shot_drag_overlay" title="drag to move" style="display:none; z-index:9; cursor:move !important; "><tr><td style="background-color:transparent;border:0;">&#160;</td></tr></table>\n <div id="snap_com_shot_top_left_menu" style="z-index:10"><img id="snap_com_shot_preview_toggle" src="__T_GIF__" style="cursor:pointer !important" /><img id="snap_com_shot_rss_toggle" src="__T_GIF__" align="top" style="cursor:pointer !important" /></div>\n <div id="snap_com_shot_top_right_menu" style="z-index:10"><img id="snap_com_shot_share_button" src="__T_GIF__" align="top" style="cursor:pointer !important" /><img id="snap_com_shot_option_button" src="__T_GIF__" style="cursor:pointer !important" /><img id="snap_com_shot_zoom_img" src="__T_GIF__" align="top" style="cursor:pointer !important" /><img id="snap_com_shot_pin_close_img" title="Close" src="__T_GIF__" align="top" style="cursor:pointer !important" /></div>\n <div id="snap_com_shot_option_menu" style="z-index:10">\n  <div id="snap_com_shot_option_a" style="cursor:pointer !important" ></div>\n  <div id="snap_com_shot_disable_a" style="cursor:pointer !important" ></div>\n </div>\n <div id="snap_com_shot_search" style="margin:0 !important; padding:0 !important">\n  <div id="snap_com_shot_search_form" style="margin:0 !important; padding:0 !important" action="#" method="GET" accept-charset="UTF8" target="_blank">\n   <input id="snap_com_shot_box" type="text" name="snap_com_shot_box_name" autocomplete="off" style="visibility:inherit !important" />\n   <button type="submit" name="snap_com_shot_submit" id="snap_com_shot_submit"></button>\n   <a href="about:blank" id="snap_com_shot_hidden_link"></a>\n  </div>\n </div>\n <div id="snap_com_shot_promo"><a class="snap_nopreview" id="snap_com_shot_promo_a"></a><img id="snap_com_shot_promo_icon" src="__T_GIF__" style="border-bottom:none !important; cursor:pointer !important" /></div>\n <div id="snap_com_shot_preview_div">\n  <div style="white-space: nowrap !important;" id="snap_com_shot_url_wrapper"><a class="snap_nopreview" id="snap_com_shot_url_favicon" href="#"><img id="snap_com_shot_favicon" src="__T_GIF__" /></a>&#160;<a class="snap_nopreview" id="snap_com_shot_url_a" href="#"><span id="snap_com_shot_url"></span></a>&#160;<a class="snap_nopreview" id="snap_com_shot_url_arrow" href="#"><img id="snap_com_shot_arrow" src="__T_GIF__" /></a></div>\n  <a class="snap_nopreview" id="snap_com_shot_img_a" href="#"><img id="snap_com_shot_preview_img" src="__T_GIF__"/></a>\n  <iframe name="snap_com_shot_preview" id="snap_com_shot_preview" scrolling="no" frameborder="no" src="about:blank"></iframe><img id="snap_com_shot_loading_img" src="__T_GIF__" />\n </div>\n <div id="snap_com_shot_marea">&#160;</div>\n <img id="snap_com_shot_cobrand_img" src="__T_GIF__"/>\n  <table id="snap_com_shot_flash_overlay" title="click to play" style="display:none; z-index:11; cursor:pointer !important;"><tr><td>&#160;</td></tr></table>\n</div><div id="snap_com_shot_options" >\n <iframe id="snap_com_shot_option_iframe"  width="265" height="190" frameborder="0" scrolling="no" src="about:blank"></iframe>\n <div id="snap_com_shot_option_menu_bar"><img class="snap_nopreview" id="snap_com_shot_option_button_disabled" src="__T_GIF__" /><img class="snap_nopreview" id="snap_com_shot_option_close_a" src="__T_GIF__" style="cursor:pointer !important" /></div>\n<input id="snap_com_shot_option_cancel" style="visibility:inherit" name="snap_com_shot_option_cancel_name" type="button" value="Cancel" title="Close" />\n</div>\n <a class="snap_nopreview" id="snap_com_shot_cobrand_a" href="" target="_blank"><div style="display:none"></div></a>\n <a class="snap_nopreview" id="snap_com_shot_logo_a" href="" style="height: 5px" target="_blank"><div style="display:none"></div></a>\n <a class="snap_nopreview" id="snap_com_shot_ribbon_a" href=""><img id="snap_com_shot_ribbon" src="__T_GIF__" /></a>\n <img id="snap_com_shot_lg" src="__T_GIF__" />\n</div>\n'.replace(/__T_GIF__/g, this.cfg.prefix.cdn_image + "t.gif");
            this.get_all_shot_nodes(this.div.main, this.div);
            this.set_css();
            this.visible(this.div, false);
            this.div.flash_overlay.title = this.cfg.text.ClickToPlay;
            if (this.cfg.size == "large") {
                this.div.zoom_img.style.display = "none"
            }
            this.div.share_button.style.display = "none";
            this.raise_loading_img();
            this.observe(this.div.bubble, "mouseover", this.rollover);
            this.observe(this.div.bubble, "mouseout", this.rollout);
            this.observe(this.div.option_iframe, "mouseover", this.rollover);
            this.observe(this.div.option_iframe, "mouseout", this.rollout);
            for (E = 0; E < this.cfg.pointer.steps; E++) {
                this.observe(this.div["pointer" + E], "mouseover", this.rollover);
                this.observe(this.div["pointer" + E], "mouseout", this.rollout)
            }
            this.observe(this.div.preview, "load", this.preview_iframe_loaded);
            this.observe(this.div.preview_img, "load", this.preview_img_loaded);
            this.observe(this.div.option_iframe, "mouseout",
            function(I) {
                I.returnValue = false;
                I.cancelBubble = true
            });
            this.addMenuEvents(this.div);
            this.observe(this.div.promo_a, "mouseover",
            function() {
                this.div.promo_a.style.borderBottom = "none"
            });
            this.observe(this.div.promo_a, "mouseout",
            function() {
                this.div.promo_a.style.borderBottom = "1px dotted #747274"
            });
            var H = ["img_a", "url_a", "url_favicon", "url_arrow"];
            for (var E = 0; E < H.length; E++) {
                this.observe(this.div[H[E]], "mouseup", this.link_click);
                this.observe(this.div[H[E]], "click", this.link_click)
            }
            this.observe(this.div.url_wrapper, "mouseover", this.title_mouseover);
            this.observe(this.div.url_wrapper, "mouseout", this.title_mouseout);
            this.dragFunction = function(I) {
                D.dragMove(I)
            };
            this.dragStopFunction = function(I) {
                D.dragStop(I)
            };
            this.observe(document, "mousemove", this.dragFunction);
            this.observe(document, "mouseup", this.dragStopFunction);
            this.observe(this.div.flash_overlay, "click", this.startFlash);
            this.observe(this.div.drag_overlay, "mousedown", this.dragStart);
            this.observe(document, "mousewheel",
            function(I) {
                if (this.visible(this.div)) {
                    D.hide_delay(null, D.cfg.delay.hide)
                }
                D.disabled = true;
                clearTimeout(D.disableTimer);
                D.disableTimer = D.sto(function() {
                    D.disabled = false
                },
                200)
            });
            this.observe(this.div.submit, "click", this.form_submit);
            this.observe(this.div.box, "keydown", this.form_submit);
            this.observe(this.div.box, "focus",
            function(I) {
                if (D.div.box.value === D.cfg.text.SearchTheWeb) {
                    D.div.box.value = ""
                }
            });
            var G = "?source=" + encodeURIComponent(this.cfg.source) + "&campaign=";
            this.div.logo_a.href = this.cfg.href.logo + G + this.campaign("snap-shots-logo");
            switch (this.cfg.attribution_split_test_suffix) {
            case "_1":
            case "_2":
            case "_3":
            case "_4":
                this.div.promo_a.href = this.cfg.href.client_download;
                break;
            case "_7":
                this.div.promo_a.href = this.cfg.href.client_about;
                break;
            case "_8":
                this.div.promo_a.href = this.cfg.href.whatsnew;
                break;
            default:
                this.div.promo_a.href = this.cfg.href.shot_signup + "?source=" + document.location.host + "&campaign=viral-foot"
            }
            this.div.cobrand_a.href = this.cfg.prefix.preview + "explore/" + Math.floor((Math.random() * 100000)) + "/?key=" + this.cfg.key + "&src=" + document.location.host + "&cp=pub-logo&url=" + encodeURIComponent(this.cfg.href.cobrand);
            this.div.ribbon_a.href = this.cfg.href.ribbon + "?source=" + document.location.host + "&campaign=charity-ribbon#shares";
            if (this.div.promo_a.href.indexOf(this.cfg.prefix.snap) === 0) {
                this.div.promo_a.href += G + this.campaign("link")
            }
            this.div.search_form.action = this.cfg.prefix.search;
            this.orientation("bl");
            this.draw_bubble();
            this.marea_init(null);
            this.tknr()
        },
        draw_bubble: function(D) {
            var F, H;
            var I = this.get_active_div(D);
            var C = this.get_active_cfg(D);
            if (!this.bubble_drawn) {
                var E = {
                    t: "tb",
                    b: "tb",
                    l: "lr",
                    r: "lr"
                };
                for (F in E) {
                    if (E.hasOwnProperty(F) && E[F] !== undefined) {
                        H = C.prefix.bg + "bg_" + E[F] + ".png";
                        if (this.needs_png_fix) {
                            I["bg_img_" + F].runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + H + "',sizingMethod='scale')"
                        } else {
                            if (this.isSafari) {
                                I["bg_img_" + F].src = H
                            } else {
                                I["bg_img_" + F].style.backgroundImage = "url(" + H + ")";
                                I["bg_img_" + F].style.backgroundRepeat = "repeat"
                            }
                        }
                    }
                }
                E = ["tl", "tr", "bl", "br"];
                for (F = 0; F < E.length; F++) {
                    this.set_palette_img(I["bg_div_" + E[F]], "bg_" + E[F], D)
                }
            } else {
                this.bubble_drawn = true
            }
            var B = I.main.style.width.replace(/\D/g, "") - (C.css_pos.bg_div_tl.w * 2);
            var G = I.main.style.height.replace(/\D/g, "") - (C.css_pos.bg_div_tl.h * 2);
            if (this.needs_png_fix || (this.isIE && document.compatMode && document.compatMode != "CSS1Compat")) {
                if (G % 2 == 0) {
                    G--
                }
            }
            I.bg_img_t.style.width = B + "px";
            I.bg_img_b.style.width = B + "px";
            I.bg_img_l.style.height = G + "px";
            I.bg_img_r.style.height = G + "px";
            I.bubble.style.height = (I.main.style.height.replace(/\D/g, "") - 8) + "px";
            I.body.style.height = (I.main.style.height.replace(/\D/g, "") - 8) + "px"
        },
        addMenuEvents: function(D, B) {
            var C = this;
            this.observe(D.share_button, "click", this.share_frame, true, false, B);
            this.observe(D.share_button, "mouseover", this.handleMenuRoll, "share_button", true, B);
            this.observe(D.share_button, "mouseout", this.handleMenuRoll, "share_button", false, B);
            this.observe(D.option_button, "click", this.option_frame, true, false, B);
            this.observe(D.option_button, "mouseover", this.handleMenuRoll, "option_button", true, B);
            this.observe(D.option_button, "mouseout", this.handleMenuRoll, "option_button", false, B);
            this.observe(D.option_a, "click", this.option_frame, true, false, B);
            this.observe(D.option_a, "mouseover", this.handleMenuRoll, "option_a", true, B);
            this.observe(D.option_a, "mouseout", this.handleMenuRoll, "option_a", false, B);
            this.observe(D.disable_a, "click", this.option_frame, true, true, B);
            this.observe(D.disable_a, "mouseover", this.handleMenuRoll, "disable_a", true, B);
            this.observe(D.disable_a, "mouseout", this.handleMenuRoll, "disable_a", false, B);
            this.observe(D.zoom_img, "click",
            function(E) {
                if (!C.no_opt_menu) {
                    C.resize(null, B)
                }
            });
            this.observe(D.zoom_img, "mouseover", this.handleMenuRoll, "zoom_img", true, B);
            this.observe(D.zoom_img, "mouseout", this.handleMenuRoll, "zoom_img", false, B);
            this.observe(D.option_close_a, "click", this.destroy_bubble, B);
            this.observe(D.option_close_a, "mouseover", this.handleMenuRoll, "option_close_a", true, B);
            this.observe(D.option_close_a, "mouseout", this.handleMenuRoll, "option_close_a", false, B);
            this.observe(D.option_cancel, "click", this.option_frame, false, false, B);
            this.observe(D.preview_toggle, "click", this.rss_toggle, "preview", B);
            this.observe(D.preview_toggle, "mouseover", this.handleMenuRoll, "preview_toggle", true, B);
            this.observe(D.preview_toggle, "mouseout", this.handleMenuRoll, "preview_toggle", false, B);
            this.observe(D.rss_toggle, "click", this.rss_toggle, "rss", B);
            this.observe(D.rss_toggle, "mouseover", this.handleMenuRoll, "rss_toggle", true, B);
            this.observe(D.rss_toggle, "mouseout", this.handleMenuRoll, "rss_toggle", false, B);
            this.observe(D.pin_close_img, "mouseover", this.handleMenuRoll, "pin_close_img", true, B);
            this.observe(D.pin_close_img, "mouseout", this.handleMenuRoll, "pin_close_img", false, B);
            if (B == null || B == undefined) {
                this.observe(D.pin_close_img, "click", this.hide)
            } else {
                this.observe(D.pin_close_img, "click", this.destroy_bubble, B)
            }
        },
        rss_toggle: function(G, F, D) {
            var H = this.get_active_div(D);
            if (G != null && this.current_rss != F) {
                this.logFeatureClick("shot_default_view_toggle_" + F)
            }
            if (F == "preview") {
                this.current_rss = "preview";
                this.changePaletteImg("preview_toggle", "preview_toggle_selected", D);
                this.changePaletteImg("rss_toggle", "rss_toggle", D);
                this.shot_type = "preview";
                if (G != null && !this.preview_viewed) {
                    this.cfg.shot_check = 0;
                    this.preview_viewed = true;
                    var C = this.shot_data;
                    var B = this.shot_base;
                    if (C.url == "" && C.svc && C.svc.indexOf("Snap_Shot_RSS") != -1) {
                        C.url = C.tag;
                        C.redir_url = C.url;
                        B = B.replace("url=&", "url=" + C.url + "&");
                        B = B.replace("tok=.*?&", "tok=" + this.tok(C.redir_url) + "&");
                        this.update_preview_links(C)
                    }
                    this.tmr.mark("preview_start");
                    E = B + "&view_id=" + this.view.id + "&goto=" + encodeURIComponent(this.cfg.text.GoToURL);
                    H.preview_img.src = this.cfg.prefix.preview + "preview" + E + "&direct=1&sc=0&nl=1";
                    this.view.confirm = false
                }
                this.raise_shot("preview", D)
            } else {
                this.current_rss = "rss";
                this.changePaletteImg("preview_toggle", "preview_toggle", D);
                this.changePaletteImg("rss_toggle", "rss_toggle_selected", D);
                if (G != null && !this.iframe_viewed) {
                    this.cfg.shot_check = 1;
                    this.iframe_viewed = true;
                    var C = this.shot_data;
                    var E = this.cfg.prefix.preview + "shot" + this.shot_base + "&w=" + this.cfg.css_pos.preview_div.w + "&h=" + this.cfg.css_pos.preview_div.h + "&target=" + C.target + "&tag=" + encodeURIComponent(C.tag) + "&goto=" + encodeURIComponent(this.cfg.text.GoToURL) + "&rt=" + this.now() + "&sc=0&log=0&";
                    this.setPreviewIframeSrc(E, D)
                }
                this.raise_shot("iframe", D)
            }
        },
        hideTopLeftMenu: function(B) {
            var C = this.get_active_div(B);
            C.top_left_menu.style.visibility = "hidden";
            C.url_favicon.style.display = ""
        },
        showTopLeftMenu: function(B) {
            var C = this.get_active_div(B);
            C.top_left_menu.style.visibility = "";
            C.url_favicon.style.display = "none"
        },
        resize: function(L, B, K, D, S) {
            var O, P, M, E, N, T;
            var J = this.get_active_div(B);
            var F = this.get_active_cfg(B);
            var C = this.get_active_element(B);
            var R = this.get_active_orientation(B);
            if (L == null && this.isIE && window.event) {
                var I;
                var Q = window.event;
                if (Q.target) {
                    I = Q.target
                } else {
                    if (Q.srcElement) {
                        I = Q.srcElement
                    }
                }
                if (J.zoom_img !== I) {
                    return
                }
            }
            var H = J.main.style.left.replace(/[^-\d]/g, ""),
            G = J.main.style.top.replace(/[^-\d]/g, "");
            this.visible(J, false);
            E = 0;
            if (D === undefined || D === null) {
                D = false
            }
            if (!D) {
                if (L === undefined || L === null) {
                    F.size = (F.size == "large") ? "small": "large"
                } else {
                    if (F.size == L) {
                        return
                    } else {
                        F.size = L
                    }
                }
                E = (F.size == "large") ? 1 : -1;
                P = F.resize.w_list.length;
                for (O = 0; O < P; O++) {
                    F.css_pos[F.resize.w_list[O]].w += (E * F.resize.w)
                }
                P = F.resize.h_list.length;
                for (O = 0; O < P; O++) {
                    F.css_pos[F.resize.h_list[O]].h += (E * F.resize.h)
                }
            }
            this.set_css(B);
            N = R;
            if (N.substr(0, 1) == "b") {
                G -= (E * F.resize.h)
            }
            if (N.substr(0, 1) == "r") {
                H -= (E * F.resize.w)
            }
            this.move(H, G, B);
            this.draw_bubble(B);
            this.orientation(N, false, B);
            if (!K) {
                this.show_shot(this.get_shot_data(C), B, true);
                if (F.size == "small") {
                    T = this;
                    T.long_delay = true;
                    this.later(200,
                    function() {
                        T.long_delay = false
                    })
                }
                this.visible(J, true)
            }
            if (S != null) {
                this.visible(J, S == "visible")
            }
        },
        share_frame: function(F, C, G, B) {
            var D;
            var E = this;
            var H = this.get_active_div(B);
            if (!this.no_opt_menu) {
                H.option_close_a.style.display = (B === undefined) ? "none": "";
                H.body.style.visibility = C ? "hidden": "";
                H.options.style.visibility = C ? "": "hidden";
                H.option_button_disabled.style.visibility = "hidden";
                H.option_iframe.src = "about:blank";
                if (C) {
                    D = this.share_url + "&url=" + encodeURIComponent(this.current_url) + (G ? "&hl=disable": "") + "&size=" + this.cfg.size + "&js_src=" + encodeURIComponent(SNAP_COM.get_js_src()) + (this.shot_type ? "&shot_type=" + this.shot_type: "");
                    if (this.shot_data.svc.match(/\bsnap_shots?_(custom|wikipedia)/i)) {
                        D += "&svc=" + encodeURIComponent(this.shot_data.svc) + "&tag=" + encodeURIComponent(this.shot_data.tag);
                        if (this.shot_data.auto.pattern !== undefined) {
                            D += "&asp=" + encodeURIComponent(this.shot_data.auto.pattern)
                        }
                    }
                    this.sto(function() {
                        H.option_iframe.src = D
                    },
                    0)
                }
            }
            F.returnValue = false;
            if (F.preventDefault) {
                F.preventDefault()
            }
            return false
        },
        option_frame: function(F, C, G, B) {
            var D;
            var E = this;
            var H = this.get_active_div(B);
            if (!this.no_opt_menu) {
                H.option_close_a.style.display = (B === undefined) ? "none": "";
                H.body.style.visibility = C ? "hidden": "";
                H.options.style.visibility = C ? "": "hidden";
                H.option_button_disabled.style.visibility = "";
                H.option_cancel.style.display = C ? "": "none";
                H.option_iframe.src = "about:blank";
                if (C) {
                    D = this.opt_url + "&url=" + encodeURIComponent(this.current_url) + (G ? "&hl=disable": "") + "&size=" + this.cfg.size + "&vid=" + this.view.id + "&js_src=" + encodeURIComponent(SNAP_COM.get_js_src()) + (this.shot_type ? "&shot_type=" + this.shot_type: "");
                    this.sto(function() {
                        H.option_iframe.src = D
                    },
                    0)
                }
            }
            F.returnValue = false;
            if (F.preventDefault) {
                F.preventDefault()
            }
            return false
        },
        raise_loading_img: function() {
            this.div.loading_img.style.zIndex = Number(this.div.preview_img.style.zIndex) + 10;
            this.div.loading_img.style.display = "inline"
        },
        lower_loading_img: function(B, C) {
            if (C == "iframe" && this.shot_trigger_is_preview) {
                return
            }
            this.div.loading_img.style.zIndex = Number(this.div.preview_img.style.zIndex) - 10;
            this.div.loading_img.style.display = "none"
        },
        move: function(B, F, D) {
            var E = this.get_active_div(D);
            var C = this.get_active_cfg(D);
            E.main.style.left = B + "px";
            E.main.style.top = F + "px"
        },
        get_activated_element: function(D) {
            var C, B;
            if (D.srcElement) {
                B = D.srcElement
            } else {
                if (D.target) {
                    B = D.target
                }
            }
            for (var C = 0;
            (C < 5) && B; C++) {
                if (this.el_prop(B, "activated")) {
                    return B
                }
                try {
                    B = B.parentNode
                } catch(E) {}
            }
            return null
        },
        hide_delay: function(C, B) {
            if ((C !== null && !this.get_activated_element(C))) {
                return
            }
            if (this.long_delay) {
                B = 1500;
                this.long_delay = false
            }
            this.clear_timer("show");
            this.clear_timer("prefetch");
            if (this.lb_active()) {
                this.timer_id.show = this.later(B, this.lb_hide)
            } else {
                this.timer_id.show = this.later(B, this.hide)
            }
            this.tmr.mark("mouseout")
        },
        hide: function(B) {
            this.tmr.mark("hide");
            this.tmr.log(this);
            this.raise_loading_img();
            if (this.visible(this.div)) {
                if (!B) {
                    this.confirm_shot_load("pf")
                }
            }
            this.visible(this.div, false);
            this.marea_hide();
            this.run_hooks("hide");
            if (this.isSafari) {
                if (this.div.preview) {
                    this.later(0,
                    function() {
                        this.div.preview.src = "about:blank"
                    })
                }
            } else {
                if (this.div.preview.contentWindow) {
                    this.div.preview.contentWindow.location.replace("about:blank")
                }
            }
        },
        run_hooks: function(F) {
            var E = [],
            B;
            F = "on" + F.substr(0, 1).toUpperCase() + F.substr(1).toLowerCase();
            if (B = this.hooks[F]) {
                for (var C = 0; C < B.length; C++) {
                    var D = B[C];
                    D.fn();
                    if (D.keep) {
                        E.push(D)
                    }
                }
                this.hooks[F] = E
            }
        },
        show_delay: function(G, E, F) {
            if (typeof SNAP_COM != "undefined" && SNAP_COM.clientActive && !this.cfg.plugin) {
                if (this.div.main && this.div.main.parentNode) {
                    this.unobserve_all();
                    this.div.main.parentNode.removeChild(this.div.main)
                }
                return
            }
            var C, H = null;
            var D = this.get_activated_element(G);
            if (this.disabled || !D) {
                if (this.isOpera && this.in_shot(G)) {
                    this.clear_timer("show")
                }
                return
            }
            this.current_ex = this.getPageX(G);
            this.current_ey = this.getPageY(G);
            var I = null,
            B = this.el_prop(D, "shot_parent") || D;
            if (this.el_prop(B, "auto")) {
                I = this.el_prop(B, "autoshot_data").linkbubble
            }
            C = I ? this.lb.lb_main: this.div.main;
            this.clear_timer("show");
            this.clear_timer("prefetch");
            H = this.el_prop(D, "shot_parent") || D;
            if (!this.el_prop(H, "markup") && !this.is_valid_link(H)) {
                return
            }
            var K = this.cfg.orig_size;
            if (this.cfg.size != K) {
                this.resize(K, null, true)
            }
            if (this.cfg.size == "small" && parseInt(this.div.main.style.width.replace(/\D/g, "")) > this.cfg.css_pos.main.w) {
                this.set_css(null);
                this.draw_bubble(null)
            }
            if (this.el_prop(D, "is_link_icon")) {
                E = this.cfg.delay.show_sli
            }
            if (C.style.visibility == "visible") {
                if (this.current_element != H) {
                    E = F
                } else {
                    return
                }
            }
            if (C.style.visibility == "visible") {
                this.pre_tmr = new SNAP_COM.timer_obj();
                this.pre_tmr.enabled(this.tmr_on);
                this.pre_tmr.mark("mouseover")
            } else {
                this.view.id = this.rand_hash(this.cfg.rnd + G.clientX + G.clientY);
                this.view.confirm = true;
                this.tmr = new SNAP_COM.timer_obj();
                this.tmr.enabled(this.tmr_on);
                this.tmr.mark("mouseover");
                this.tmr.set_id(this.view.id)
            }
            var J = true;
            if (B && B.className && B.className.match(/\bsnap_shots?_custom/i) && !B.className.match(/WithAds$/i)) {
                J = false
            }
            this.shot_data = this.get_shot_data(D);
            if (J && !I && this.cfg.has_marea) {
                if (!this.lb_is_linkbubble(this.shot_data.svc)) {
                    this.timer_id.prefetch = this.later(Math.min(this.cfg.delay.prefetch, E), this.marea_prepare, null, this.cfg.ad_type)
                }
            }
            if (decodeURIComponent(this.shot_data.svc).match(/linkbubble_shopping/i)) {
                E = 750
            }
            this.timer_id.show = this.later(E, this.show, D)
        },
        visible: function(C, B) {
            if (B != undefined) {
                C.main.style.visibility = B ? "visible": "hidden",
                C.box.style.display = B ? "": "none";
                if (!B) {
                    C.option_cancel.style.display = "none"
                }
            }
            return (C.main.style.visibility == "visible")
        },
        show: function(H) {
            var C = ((this.cfg.trigger_position == "icon") && this.el_prop(H, "link_icon"));
            var G;
            var D;
            if ((this.cfg.trigger_position == "icon") && this.el_prop(H, "link_icon")) {
                var I = this.getXY(this.el_prop(H, "link_icon") || H);
                G = I[0];
                D = I[1]
            } else {
                G = this.current_ex;
                D = this.current_ey
            }
            if (this.visible(this.div) || this.lb_active()) {
                this.view.id = this.rand_hash(this.cfg.rnd + G + D);
                this.view.confirm = true
            }
            if (this.lb_active()) {
                this.lb_hide()
            }
            var B = this.get_shot_data(H);
            this.current_element = B.element;
            if (B.svc.match(/linkbubble/i)) {
                this.lb_show(H, B);
                return
            }
            if (this.pre_tmr) {
                this.tmr.mark("hide");
                this.tmr.log(this);
                this.tmr = this.pre_tmr;
                this.pre_tmr = undefined
            } else {
                if (!this.tmr) {
                    this.tmr = new SNAP_COM.timer_obj();
                    this.tmr.enabled(this.tmr_on)
                }
            }
            this.tmr.mark("show");
            this.tmr.set_id(this.view.id);
            if (this.other_bubbles) {
                for (var F = 0; F < this.other_bubbles.length; F++) {
                    if ((B.url == this.other_bubbles[F].current_url && B.svc == "") || (B.svc != "" && B.tag == this.other_bubbles[F].current_tag)) {
                        return
                    }
                }
            }
            this.div.body.style.display = "inline";
            this.div.body.style.visibility = "";
            this.div.options.style.visibility = "hidden";
            this.div.option_iframe.src = "about:blank";
            var E = this.fit(G, D);
            this.orientation(E.orientation);
            this.div.box.value = this.cfg.text.SearchTheWeb;
            this.div.box.blur();
            this.show_shot(B);
            this.move(E.x, E.y);
            this.visible(this.div, true)
        },
        fit: function(H, F, C) {
            var D, R = {
                h: this.getViewportHeight(),
                w: this.getViewportWidth()
            },
            M,
            S,
            K = {},
            E,
            L,
            G = 5,
            O,
            N,
            P = {},
            B,
            Q,
            J,
            I;
            if (window.pageXOffset !== undefined) {
                O = H - window.pageXOffset;
                N = F - window.pageYOffset
            } else {
                O = H - (document.body.scrollLeft || document.documentElement.scrollLeft);
                N = F - (document.body.scrollTop || document.documentElement.scrollTop)
            }
            if (C == "linkbubble") {
                D = {
                    h: parseInt(this.lb.lb_main.style.height.replace(/\D/g, "")),
                    w: parseInt(this.lb.lb_main.style.width.replace(/\D/g, ""))
                };
                B = this.cfg.lb_palette.lb_point_t;
                Q = this.cfg.lb_palette.lb_point_b;
                S = Math.round(Q.h / 2) + 3;
                K.t = this.cfg.lb.css_pos.lb_content.y + S;
                K.size = parseInt(this.lb.lb_content.style.height.replace(/\D/g, "")) - (S * 2);
                K.b = D.h - (K.t + K.size);
                J = 28;
                I = 5
            } else {
                D = {
                    h: parseInt(this.div.body.style.height.replace(/\D/g, "")),
                    w: parseInt(this.div.body.style.width.replace(/\D/g, ""))
                };
                B = this.cfg.png_palette.point_tl;
                Q = this.cfg.png_palette.point_l;
                S = Math.round(Q.h / 2) + 3;
                K.t = this.cfg.css_pos.preview_div.y + S;
                K.size = this.cfg.css_pos.preview_div.h - (S * 2);
                K.b = D.h - (K.t + K.size);
                J = 9;
                I = 5
            }
            P.orientation = (N > (2 * R.h / 5)) ? "b": "t";
            P.orientation += (O > (R.w / 2)) ? "r": "l";
            P.y = (P.orientation.substr(0, 1) == "t") ? (F + B.h + I) : (F - D.h - B.h - I);
            P.x = (P.orientation.substr(1, 1) == "l") ? (H - J) : (H - D.w + J);
            M = {
                h: (D.h + B.h),
                w: (D.w + B.w)
            };
            if (C != "linkbubble" && ((P.orientation.substr(0, 1) == "t") && ((N + M.h) > R.h) || (P.orientation.substr(0, 1) == "b") && ((N - M.h) < 0))) {
                if (R.h > (D.h + (2 * G)) && ((O + D.w) < R.w || (O - D.w) > 0) && N > (K.t + G) && N < (R.h - K.b - G)) {
                    E = K.t;
                    L = R.h - (N + (D.h - E) + S);
                    if (L < 0) {
                        E -= L
                    }
                    P.orientation = P.orientation.substr(1, 1);
                    if (P.orientation == "l") {
                        P.x = H + Q.w + 3
                    } else {
                        P.x = H - D.w - Q.w - 3
                    }
                    P.y = F - E;
                    P.orientation += "_" + E
                }
            }
            return P
        },
        orientation: function(D, E, B) {
            var T, L, O, Q, R, J, G, U, C, W, V = 1;
            var X, M;
            var N = this.cfg.pointer;
            var S, P, F;
            var K = this.get_active_div(B);
            var I = parseInt(K.body.style.height.replace(/\D/g, ""));
            if (B == null) {
                this.current_orientation = D
            } else {
                this.other_bubbles[B].current_orientation = D
            }
            if (P = D.match(/^([lr])_(\d+)$/)) {
                D = P[1];
                F = P[2]
            }
            E = false;
            J = (D.substr(0, 1) == "t") ? "top": "bottom";
            G = (D.substr(1, 1) == "l") ? "left": "right";
            S = K.bg_div_point;
            this.set_palette_img(S, "point_" + D, B);
            S.style.top = "auto";
            S.style.left = "auto";
            S.style.bottom = "auto";
            S.style.right = "auto";
            X = parseInt(K.bg_div_point.style.height.replace(/\D/g, ""));
            M = parseInt(K.bg_div_point.style.width.replace(/\D/g, ""));
            if (D == "pin") {
                S.style.visibility = "hidden"
            } else {
                S.style.visibility = "inherit";
                if (D == "l") {
                    S.style.top = (F - Math.round(X / 2)) + "px";
                    S.style.left = "-" + (M - N.left.x) + "px"
                } else {
                    if (D == "r") {
                        S.style.top = (F - Math.round(X / 2)) + "px";
                        S.style.right = "-" + (M - N.right.x) + "px"
                    } else {
                        if (J == "top") {
                            S.style.top = "-" + (X - N[J].y) + "px"
                        } else {
                            S.style.bottom = "-" + (X - N[J].y) + "px"
                        }
                        if (G == "left") {
                            S.style.left = N[J].x + "px"
                        } else {
                            S.style.right = N[J].x + N.r_offset + "px"
                        }
                    }
                }
            }
            Q = (N.x - N.x0) / (N.steps - 1);
            L = (N.w - N.w0) / (N.steps - 1);
            O = X / N.steps;
            W = N.x + (G == "right" ? N.r_offset: 0);
            C = 5 - N[J].y;
            for (T = 0; T < N.steps; T++) {
                R = K["pointer" + T].style;
                R.left = "auto";
                R.right = "auto";
                R.top = "auto";
                R.bottom = "auto";
                if (D.match(/^(pin|l|r)$/)) {
                    R.visibility = "hidden";
                    R.top = "50px";
                    R.left = "50px";
                    R.width = "0px";
                    R.height = "0px"
                } else {
                    R.visibility = "inherit";
                    R.width = Math.floor(N.w0 + (L * T)) + "px";
                    R.height = Math.floor(O + 1) + "px";
                    R[J] = (Math.floor(C + (O * T)) * -1) + "px";
                    R[G] = Math.floor(W - (Q * T)) + "px"
                }
            }
            if (D.match(/^(l|r)$/) && (N.steps > 0)) {
                R = K.pointer0.style;
                R.visibility = "inherit";
                var H = ["height", "width", "top", "left", "bottom", "right"];
                for (T = 0; T < H.length; T++) {
                    R[H[T]] = S.style[H[T]]
                }
            }
        },
        highlight: function(B) {
            this.clear_timer("show");
            this.clear_timer("prefetch");
            if (!this.lb_active()) {
                this.orientation(this.current_orientation, B)
            }
        },
        handleMenuRoll: function(E, G, F, B) {
            var H = this.get_active_div(B);
            if (G == this.current_rss + "_toggle") {
                return
            }
            if (H[G].tagName.toLowerCase() == "img" || G == "option_close_a") {
                var C = G;
                if (G == "zoom_img") {
                    C = (this.cfg.size == "large") ? "zoom_img_minus": "zoom_img_plus"
                }
                if (F) {
                    C += "_over"
                }
                this.changePaletteImg(G, C, B);
                if (G == "option_button") {
                    if (F) {
                        this.clear_timer("hideOptionMenu" + B);
                        this.timer_id["showOptionMenu" + B] = this.later(250, this.showOptionMenu, B)
                    } else {
                        this.clear_timer("showOptionMenu" + B);
                        this.timer_id["hideOptionMenu" + B] = this.later(250, this.hideOptionMenu, B)
                    }
                }
            } else {
                var D = H[G].style;
                if (F) {
                    D.backgroundColor = "#d9d9d9"
                } else {
                    D.backgroundColor = "white"
                }
                if (G == "option_a" || G == "disable_a") {
                    if (F) {
                        this.clear_timer("hideOptionMenu" + B)
                    } else {
                        this.timer_id["hideOptionMenu" + B] = this.later(250, this.hideOptionMenu, B)
                    }
                }
            }
        },
        showOptionMenu: function(C) {
            var E = this.get_active_div(C);
            E.option_menu.style.visibility = "";
            if (this.isIE && document.compatMode && document.compatMode != "CSS1Compat") {
                var B = this.getWidth(E.option_a);
                var D = this.getWidth(E.disable_a);
                if (B > D) {
                    E.disable_a.style.width = B
                } else {
                    if (D > B) {
                        E.option_a.style.width = D
                    }
                }
            }
        },
        hideOptionMenu: function(B) {
            var C = this.get_active_div(B);
            C.option_menu.style.visibility = "hidden"
        },
        changePaletteImg: function(F, D, C) {
            var G = this.get_active_div(C);
            var B = this.cfg;
            if (B.palette[D] == null) {
                return
            }
            var E = (F && F.style) ? F.style: G[F].style;
            E.backgroundColor = "transparent";
            E.backgroundImage = "url(" + B.img.palette + ")";
            E.backgroundPosition = B.palette[D].loc;
            E.backgroundRepeat = "no-repeat";
            E.width = B.palette[D].w + "px";
            E.height = B.palette[D].h + "px"
        },
        set_palette_img: function(E, I, C) {
            var D;
            var H = this.get_active_div(C);
            var B = this.get_active_cfg(C);
            var G, F = null;
            if (B.png_palette[I]) {
                F = B.png_palette;
                G = B.img.png_palette
            } else {
                if (B.lb_palette[I]) {
                    F = B.lb_palette;
                    G = B.img.lb_palette
                } else {
                    return
                }
            }
            D = E.getElementsByTagName("img")[0];
            E.style.height = F[I].h + "px";
            E.style.width = F[I].w + "px";
            E.style.overflow = "hidden";
            if (this.needs_png_fix) {
                D.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + G + "',sizingMethod='image')";
                D.src = B.prefix.cdn_image + "t.gif"
            } else {
                D.src = G
            }
            D.style.position = "absolute";
            D.style.left = "-" + F[I].x + "px";
            D.style.top = "-" + F[I].y + "px"
        },
        tok: function(B) {
            return this.cfg.tkn + "02" + this.hash32(this.cfg.tkn + "32c93aae" + B)
        },
        tknr: function(B) {
            if (B === undefined) {
                B = Math.min(this.cfg.tknd, (this.cfg.tknx - parseInt(this.now() / 1000)));
                if (B < 0) {
                    B = 0
                }
            }
            var C = this.cfg.prefix.preview + "tkr.js?key=" + this.cfg.key + "&tk=" + this.tok(this.cfg.tkn + this.cfg.key) + "&v=" + this.cfg.version + "&r=" + Math.random();
            this.clear_timer("tok");
            this.timer_id.tok = this.later((B * 1000), this.add_js, C, "tkn")
        },
        hash32: function(D) {
            var C = 5003;
            D = D.toString();
            for (var B = 0; B < D.length; ++B) {
                C += D.charCodeAt(B);
                C += (C << 10);
                C ^= (C >> 6)
            }
            C += (C << 3);
            C ^= (C >> 11);
            C += (C << 15);
            C = Math.abs(C).toString(16);
            while (C.length < 8) {
                C = "0" + C
            }
            return C
        },
        rand_hash: function(B) {
            return SNAP_COM.hex_sha1(B.toString() + Math.random() + this.now() + navigator.userAgent + document.location.href).substr(0, 32)
        },
        raise_shot: function(D, B) {
            var F = this.get_active_div(B);
            var E = "hidden",
            C = "";
            if (D == "preview") {
                E = "";
                C = "hidden"
            }
            F.preview.style.visibility = C;
            F.preview_img.style.visibility = E;
            F.url_a.style.visibility = E
        },
        disable_marea_once: function(B) {
            var C = this;
            var D = function() {
                this.cfg.css_pos.preview.h -= this.cfg.offset.marea;
                this.cfg.css_pos.preview_div.h -= this.cfg.offset.marea;
                this.cfg.css_pos.marea.h += this.cfg.offset.marea;
                this.resize(this.cfg.size, B, true, true, "hidden");
                this.div.marea.style.display = "";
                this.cfg.has_marea = true;
                this.marea_show(B, "none")
            };
            if (this.cfg.has_marea) {
                this.cfg.css_pos.preview.h += this.cfg.offset.marea;
                this.cfg.css_pos.preview_div.h += this.cfg.offset.marea;
                this.cfg.css_pos.marea.h -= this.cfg.offset.marea;
                this.cfg.has_marea = false;
                this.resize("custom", B, true, true, "visible");
                this.div.marea.style.display = "none";
                this.marea_hide(B);
                this.hooks.onHide.push({
                    fn: function() {
                        D.apply(C)
                    },
                    keep: false
                })
            }
        },
        show_shot: function(K, B, S) {
            var E, C, U, V, R, Y, X, P, W, J, M, L = false,
            Q = false;
            var O = this.get_active_div(B);
            var F = this.get_active_cfg(B);
            var D = 0,
            Z = this,
            N = K.element.getElementsByTagName("img");
            for (var T = 0; T < N.length; T++) {
                if (!this.el_prop(N[T], "is_link_icon")) {
                    D = 1;
                    break
                }
            }
            this.current_url = K.url;
            O.share_button.style.display = this.current_url.length ? "inline": "none";
            this.current_tag = K.tag;
            this.shot_type = "";
            this.raise_loading_img();
            var I = O.preview_img.src;
            this.current_rss = null;
            this.hideTopLeftMenu(B);
            this.run_hooks("hide");
            this.view.time = this.now();
            if (K.svc && K.svc.toLowerCase().indexOf("snap_shot_wikipedia") !== -1) {
                O.share_button.style.display = "inline"
            }
            if (K.svc && K.svc.toLowerCase().indexOf("snap_shot_custom") !== -1) {
                L = true;
                O.share_button.style.display = "inline"
            }
            R = "/?url=" + encodeURIComponent(K.redir_url) + "&key=" + F.key + "&src=" + encodeURIComponent(F.source) + "&cp=" + F.campaign + "&sb=" + (F.has_marea ? "1": "0") + "&v=" + F.version + "&size=" + F.size + "&lang=" + F.lang + "&search_type=" + F.search_type + "&vis=" + (O.main.style.visibility == "visible" ? "1": "0") + "&origin=shots_bubble&act=" + K.trigger + "&po=" + (F.preview_only ? "1": "0") + "&rp=" + encodeURIComponent(F.redirect_param) + "&tok=" + this.tok(K.redir_url) + "&has_img=" + D + "&ol=0&ex=0&ad=unknown&ip=" + F.client_ip + "&ua=" + F.user_agent + "&vid=" + this.view.id + "&nl=" + (S ? "1": "0") + "&referrer=" + encodeURIComponent(location.href) + "&svc=" + encodeURIComponent(K.svc) + "&rt=" + this.now();
            this.shot_base = R;
            this.pin_check(K);
            this.preview_viewed = false;
            this.iframe_viewed = false;
            if (K.is_preview) {
                this.shot_type = "preview";
                V = R + "&view_id=" + this.view.id + "&goto=" + encodeURIComponent(F.text.GoToURL);
                this.raise_shot("preview", B);
                this.clear_timer("retry");
                if (this.retry_url_list[K.url]) {
                    this.tmr.mark("preview_start");
                    O.preview_img.src = this.retry_url_list[K.url]
                } else {
                    this.tmr.mark("preview_start");
                    O.preview_img.src = F.prefix.preview + "preview" + V + "&direct=1&sc=" + (F.shot_check == 1 ? "2": "0") + "&rss=" + (F.no_rss ? "": "1");
                    if (F.shot_check == 0 && !F.no_rss) {
                        var H = F.prefix.preview + "rss_check.js" + V.replace(/^\//, "") + "&bub=" + B;
                        this.add_js(H, "rss", B);
                        this.preview_viewed = true
                    }
                }
                this.update_preview_links(K, B)
            }
            this.shot_data = K;
            if (!K.is_preview || F.shot_check == 1) {
                if (!K.is_preview) {
                    this.raise_shot("iframe", B)
                }
                if (K.svc && K.svc.indexOf("Snap_Shot_IFrame") != -1) {
                    V = K.tag;
                    if (K.svc.indexOf("IFrameSized") != -1) {
                        V = V + "?w=" + F.css_pos.preview_div.w + "&h=" + F.css_pos.preview_div.h
                    }
                } else {
                    if (K.svc && K.svc.match(/^Snap_Shot_Custom.*CustomJS.*/i)) {
                        var G = this.cfg.prefix.spasense + "module.js?svc=" + encodeURIComponent(K.svc) + "&tag=" + encodeURIComponent(K.tag) + "&vid=" + this.view.id + "&key=" + F.key + "&referrer=" + encodeURIComponent(location.href) + "&w=" + F.css_pos.preview_div.w + "&h=" + F.css_pos.preview_div.h;
                        V = "about:blank";
                        Q = true;
                        L = false;
                        this.add_js(G, "custom_shot", B);
                        X = "done"
                    } else {
                        V = F.prefix.preview + "shot" + R + "&w=" + F.css_pos.preview_div.w + "&h=" + F.css_pos.preview_div.h + "&target=" + K.target + "&tag=" + encodeURIComponent(K.tag) + "&goto=" + encodeURIComponent(F.text.GoToURL) + (S ? "&log=0": "") + "&sc=" + (K.is_preview ? "1": "0")
                    }
                }
                if (K.auto && !Q) {
                    V += "&as=1&asp=" + encodeURIComponent(K.auto.pattern) + "&aseid=" + encodeURIComponent(K.auto.eid) + "&astid=" + encodeURIComponent(K.auto.tid)
                }
                C = "";
                if (B !== undefined && B !== null) {
                    C += "#autoplay"
                }
                this.iframe_viewed = true;
                this.setPreviewIframeSrc(V + C, B);
                if (I == O.preview_img.src) {
                    this.lower_loading_img()
                }
                if (K.svc && K.svc.indexOf("Snap_Shot_RSS") != -1) {
                    this.showTopLeftMenu(B);
                    this.rss_toggle(null, "rss", B)
                }
            }
            this.shot_trigger_is_preview = K.is_preview;
            this.shot_url = V;
            if (F.has_marea && !F.no_mjs) {
                if (L && !K.svc.match(/(JS|WithAds)$/i)) {
                    X = "custom"
                }
                this.marea_show(B, (X || this.cfg.ad_type), K.product)
            }
        },
        get_active_div: function(B) {
            if (B == null || B == undefined) {
                return this.div
            }
            return this.other_bubbles[parseInt(B)]
        },
        get_active_cfg: function(C) {
            if (C == null || C == undefined) {
                var B = this.cfg
            } else {
                var B = this.other_bubbles[parseInt(C)].cfg
            }
            return B
        },
        get_active_orientation: function(B) {
            if (B == null || B == undefined) {
                var C = this.current_orientation
            } else {
                var C = this.other_bubbles[parseInt(B)].current_orientation
            }
            return C
        },
        get_active_element: function(B) {
            if (B == null || B == undefined) {
                var C = this.current_element
            } else {
                var C = this.other_bubbles[parseInt(B)].current_element
            }
            return C
        },
        shotsense_url: function() {
            var D, C = this.cfg;
            var B = this.shot_data;
            D = "http://shots.snap.com/rk.php?url=" + encodeURIComponent(B.url) + "&key=" + C.key + "&lang=" + C.lang + "&th=" + C.theme + "&src=" + encodeURIComponent(C.source) + "&cp=Shotsense&s=" + C.size + "&svc=" + encodeURIComponent(B.svc) + "&tag=" + encodeURIComponent(B.tag) + "&atext=" + encodeURIComponent(this.get_inner_text(B.element, 500)) + "&title=" + encodeURIComponent(document.title) + "&dfs=" + ((B.auto && B.svc.match(/wikipedia/i)) ? this.dfs(C.dfs, 1) : this.dfs()) + "&call=" + this.shotsense_shown + "&uid=" + C.user_id + "&vid=" + this.view.id + "&fl=" + encodeURIComponent(this.cfg.flavor);
            return D
        },
        custom_shot_bottom_url: function() {
            var D, C = this.cfg;
            var B = this.shot_data;
            D = "http://shots.snap.com/cs.php?url=&svc=" + encodeURIComponent(B.svc) + "&tag=" + encodeURIComponent(B.tag) + "&cp=" + C.campaign + "&key=" + C.key + "&referrer=" + encodeURIComponent(location.href) + "&sb=1&search_type=" + C.search_type + "&act=" + B.trigger + "&lang=" + C.lang + "&vid=" + this.view.id + "&ad=unknown&ip=" + C.client_ip + "&ua=" + C.user_agent + "&size=" + C.size + "&src=" + encodeURIComponent(C.source);
            if (B.auto) {
                D += "&as=1&asp=" + encodeURIComponent(B.auto.pattern) + "&aseid=" + encodeURIComponent(B.auto.eid) + "&astid=" + encodeURIComponent(B.auto.tid)
            }
            return D
        },
        cgi_suffix_from_options: function(C) {
            var D = "";
            if (C) {
                for (var B in C.cgi_params) {
                    if (C.cgi_params.hasOwnProperty(B)) {
                        D += "&" + encodeURIComponent(B) + "=" + encodeURIComponent(C.cgi_params[B])
                    }
                }
            }
            return D
        },
        add_tp: function(F, C, B) {
            var G = this.get_active_div(B);
            C = "snap_com_shot_" + C + "_tp";
            var E = document.getElementById(C);
            if (E) {
                try {
                    G.main.removeChild(E)
                } catch(D) {}
            }
            E = document.createElement("img");
            E.id = C;
            E.src = F;
            G.main.appendChild(E);
            return E
        },
        add_js: function(F, E, B) {
            var G = this.get_active_div(B);
            E = "snap_com_shot_" + E + "_js";
            var D = document.getElementById(E);
            if (D) {
                try {
                    G.main.removeChild(D)
                } catch(C) {}
            }
            D = document.createElement("script");
            D.id = E;
            D.type = "text/javascript";
            D.src = F;
            G.main.appendChild(D);
            return D
        },
        replace_marea_js: function(C, B) {
            this.set_load_tmr_js(this.add_js(C, "marea", B), C)
        },
        dc_ad: function(H) {
            var I = (H.bubble_id == "null") ? null: H.bubble_id;
            var D, J = this.marea_data(I),
            F,
            B = this.get_active_div(I),
            E,
            C = {
                snap: "",
                client: ""
            };
            C.snap = H.beacon_snap + (H.nl ? "": this.cfg.prefix.preview + "images/dc_t.gif?adv_id=" + H.advertiser_id + "&ad_id=" + H.ad_id + "&c_id=" + H.creative_id + "&key=" + H.shotkey + "&src=" + encodeURIComponent(this.cfg.source) + "&cp=" + encodeURIComponent(this.cfg.campaign) + "&rand=" + Math.random());
            if (H.beacon_client && H.beacon_client.indexOf("http") === 0) {
                C.client = H.beacon_client
            }
            F = H.pane_id;
            if (F === undefined) {
                this.marea_pane_data(I, F, "type", "search_box")
            } else {
                if (H.marea_type == "shotsense") {
                    J.pane[F].shotsense_opts = {
                        cgi_params: {
                            geo: H.params,
                            bcn: C.snap,
                            bcnc: C.client
                        }
                    }
                } else {
                    E = "<div>";
                    var G = ["snap", "client"];
                    for (i = 0; i < G.length; i++) {
                        if (C[G[i]]) {
                            E += '<img src="' + C[G[i]] + '" alt="" style="position: absolute; bottom:0;right:0; width:1px;height:1px;" />'
                        }
                    }
                    E += "</div>";
                    this.marea_set_beacon(I, F, E)
                }
                this.marea_pane_data(I, F, "action", H.marea_type)
            }
            this.marea_process(I)
        },
        update_preview_links: function(C, E) {
            var B, F;
            var G = this.get_active_div(E);
            var D = this.get_active_cfg(E);
            F = C.redir_url.replace(/\w+:\/\/(www\.)?/, "");
            F = F.replace(/^([-\w.]*)\/$/, "$1");
            B = D.url_max ? D.url_max: 50;
            if (F.length > B) {
                F = F.substr(0, B) + "..."
            }
            G.url.innerHTML = F;
            G.url_a.href = C.url;
            G.url_favicon.href = C.url;
            G.url_arrow.href = C.url;
            G.img_a.href = C.url;
            G.url_a.target = C.target;
            G.url_favicon.target = C.target;
            G.url_arrow.target = C.target;
            G.img_a.target = C.target;
            G.url_a.title = D.text.GoToURL.replace(/%URL/, F);
            G.url_favicon.title = D.text.GoToURL.replace(/%URL/, F);
            G.url_arrow.title = D.text.GoToURL.replace(/%URL/, F);
            G.img_a.title = G.url_a.title
        },
        is_preview_url: function(C) {
            if (this.cfg.rich_shot_exceptions != "") {
                if (C.match(this.rich_shot_exceptions_re)) {
                    return true
                }
            }
            var B = C.match(/\w+:\/\/([^#]*)/);
            if (B && B[1].match(this.preview_re)) {
                return false
            }
            return true
        },
        get_inner_text: function(B, C) {
            var D = "";
            if (B.innerText !== undefined) {
                D = B.innerText
            } else {
                if (B.textContent !== undefined) {
                    D = B.textContent
                }
            }
            if (C === undefined) {
                return this.trim(D).substr(0)
            } else {
                return this.trim(D).substr(0, C)
            }
        },
        get_shot_data: function(B) {
            var I, H, F, G;
            var E;
            var J, D;
            var C = [];
            var K = {
                svc: "",
                tag: "",
                url: "",
                target: "",
                element: B,
                trigger: "",
                product: "",
                auto: false
            };
            if (this.el_prop(B, "is_link_icon")) {
                K.trigger = "icon"
            } else {
                K.trigger = "link"
            }
            B = this.el_prop(B, "shot_parent") || B;
            K.element = B;
            K.trigger = (this.el_prop(B, "trigger") == "both" ? "both": "only") + "_" + K.trigger;
            if (B.href !== undefined) {
                K.url = B.href;
                K.target = B.target
            }
            if (typeof SNAP_COM != "undefined" && SNAP_COM.translateURL) {
                if (K.target.toLowerCase() == "_search") {
                    K.target = "_SELF"
                }
                K.url = SNAP_COM.translateURL(K.url);
                K.redir_url = K.url
            }
            if (this.cfg.redirect_param) {
                regexS = "[\\?&]" + this.cfg.redirect_param + "=([^&#]*)";
                regex = new RegExp(regexS);
                F = K.url.match(regex);
                if (F) {
                    K.redir_url = decodeURIComponent(F[1])
                } else {
                    K.redir_url = K.url
                }
            } else {
                K.redir_url = K.url
            }
            if (this.el_prop(B, "markup")) {
                if ((B.innerText !== undefined) && B.innerText.length) {
                    K.tag = this.trim(B.innerText).substr(0, 500).replace(String.fromCharCode(164), "&curren")
                } else {
                    if (B.textContent !== undefined) {
                        K.tag = this.trim(B.textContent).substr(0, 500)
                    } else {
                        K.tag = this.trim(B.innerHTML).substr(0, 500)
                    }
                }
                C.push(encodeURIComponent(B.className.match(/\bsnap_(shots?_\S+|linkbubble?\S+)/ig).join("|")));
                E = B.firstChild;
                while (E) {
                    if (E.tagName) {
                        F = E.className.match(/\bsnap_shots?_\S+/ig);
                        if (F) {
                            J = encodeURIComponent(F.join("|"));
                            D = encodeURIComponent(this.get_inner_text(E, 500));
                            C.push(J + "=" + D)
                        }
                    }
                    E = E.nextSibling
                }
                K.svc = C.join("&")
            } else {
                K.is_preview = this.is_preview_url(K.redir_url)
            }
            if (this.el_prop(B, "auto")) {
                K.auto = this.el_prop(B, "autoshot_data");
                K.product = K.auto.product
            } else {
                K.product = "s"
            }
            return K
        },
        set_load_tmr_js: function(C, D) {
            var B;
            if ((B = D.match(/^http:\/\/ad.(doubleclick).net\//)) || (B = D.match(/\/(marea).js\?/))) {
                this.set_load_tmr(C, B[1])
            }
        },
        set_load_tmr: function(C, D) {
            var B = this;
            this.tmr.mark(D + "_start");
            this.observe(C, "load",
            function(E) {
                B.tmr.mark(D + "_end")
            })
        },
        confirm_shot_load: function(B) {
            if (this.view.confirm) {
                this.div.arrow.src = this.cfg.prefix.image + "snip/arrow-contd/" + this.view.id + "/d/" + B + "/p" + (this.now() - this.view.time) + "/arrow/"
            }
            this.view.confirm = false
        },
        preview_iframe_loaded: function(B) {
            this.tmr.mark("shot_iframe_end");
            this.lower_loading_img()
        },
        preview_img_loaded: function(H, G) {
            this.tmr.mark("preview_end");
            if (H.currentTarget) {
                var E = H.currentTarget
            } else {
                var E = H.srcElement
            }
            if (E.height < 10 && E.width < 10) {
                this.view.confirm = false
            }
            if ((E.width == 6 && E.height == 3) || (E.width == 1 && E.height == 3)) {
                this.lower_loading_img();
                this.raise_shot("iframe", G);
                if (this.isSafari) {
                    this.later(300, this.lower_loading_img)
                }
                if (E.width == 1) {
                    this.rss_toggle(null, "rss", G);
                    this.showTopLeftMenu(G)
                }
            } else {
                if (!E.src.match(/\/t.gif/)) {
                    this.lower_loading_img()
                }
                if (E.height > 1 && E.width > 1 && E.src.indexOf("&vid=nolog") == -1) {
                    this.confirm_shot_load("ps")
                }
                if (this.div.preview_img.width == 274 || this.div.preview_img.width == 431) {
                    var B = 1;
                    var C = this.div.preview_img.src;
                    var I = /retry=(\d+)/;
                    var F = C.match(I);
                    if (F) {
                        B = Number(F[1]) + 1;
                        C = C.replace(I, "retry=" + B)
                    } else {
                        C += "&retry=" + B
                    }
                    if (B > this.cfg.retry_interval.length) {
                        return
                    }
                    if (B == this.cfg.retry_interval.length) {
                        C += "&final=1"
                    }
                    var J = this;
                    var D = this.cfg.retry_interval[B - 1];
                    if (this.retry_url_list[this.div.url_a.href] != C) {
                        this.retry_url_list[this.div.url_a.href] = C;
                        if (this.visible(this.div)) {
                            this.clear_timer("retry");
                            this.timer_id.retry = this.sto(function() {
                                J.div.preview_img.src = C
                            },
                            D)
                        }
                    }
                }
            }
        },
        link_click: function(F) {
            var E = this;
            var G = false;
            var D = this.current_url;
            switch (F.type) {
            case "mouseup":
                var B = 0;
                if (typeof(F.which) == "number") {
                    B = F.which
                } else {
                    if (typeof(F.button) == "number") {
                        B = F.button
                    }
                }
                if ((this.isIE && B == 4) || (!this.isIE && B == 2)) {
                    G = true
                }
                break;
            case "click":
                G = true;
                break
            }
            if (G) {
                this.tmr.mark("click");
                this.tmr.log(this);
                var C = this.cfg.prefix.preview + "explore/" + Math.floor((Math.random() * 100000)) + "/?url=" + encodeURIComponent(D) + "&key=" + this.cfg.key + "&src=" + encodeURIComponent(this.cfg.source) + "&cp=" + this.cfg.campaign;
                this.div.url_a.href = C + "&tol=url";
                this.div.url_favicon.href = C + "&tol=url_favicon";
                this.div.url_arrow.href = C + "&tol=url_arrow";
                this.div.img_a.href = C + "&tol=image";
                this.sto(function() {
                    E.div.url_a.href = E.current_url;
                    E.div.url_favicon.href = E.current_url;
                    E.div.url_arrow.href = E.current_url;
                    E.div.img_a.href = E.current_url
                },
                0)
            }
        },
        sample: function() {
            var F, H, C, E = [],
            B = [],
            D = this.cfg.auto_shot.list.length;
            var G = Math.random();
            if (this.sampled) {
                return
            }
            this.sampled = true;
            if (this.cfg.srate) {
                if (this.cfg.srate.main >= G) {
                    E.push("m" + this.cfg.srate.main)
                }
                if (this.cfg.auto_shot.list.length && (this.cfg.srate.auto >= G)) {
                    E.push("a" + this.cfg.srate.auto)
                }
                if (this.cfg.auto_shot.inspect) {
                    E.push("i" + this.cfg.srate.inspect);
                    for (F = 0; F < D; F++) {
                        C = this.cfg.auto_shot.list[F];
                        B.push([C.eid, C.tid, C.gfound, C.found, C.limit, C.active, C.inspect, C.testset].join(","))
                    }
                }
                if (E.length) {
                    H = document.createElement("img");
                    H.src = this.cfg.prefix.image + "spl/l" + this.imp.link + "_i" + this.imp.icon + "_a" + this.imp.auto + "_al" + this.cfg.auto_shot.limit + "/" + E.join("_") + "/" + this.cfg.key + "/e" + B.join(":") + "_t" + this.cfg.auto_shot.timestamp + "/" + this.now() + Math.random() + "/s.gif";
                    H.style.visibility = "hidden";
                    H.style.position = "absolute";
                    this.div.main.parentNode.insertBefore(H, this.div.main.nextSibling)
                }
            }
        },
        rollover: function(B) {
            this.highlight(true)
        },
        rollout: function(B) {
            var C = B.relatedTarget || B.toElement;
            if (C == null) {
                return
            }
            if (this.isOpera && this.in_shot(B)) {
                return
            }
            this.highlight(false);
            this.hide_delay(null, this.cfg.delay.hide)
        },
        in_shot: function(J) {
            var I, F, K, C, H, E;
            var B = J.pageX || (J.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
            var L = J.pageY || (J.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
            var D = this.lb_active() || this.get_active_div();
            var G = {
                left: this.getLeft(D.main),
                right: this.getRight(D.main),
                top: this.getTop(D.main),
                bottom: this.getBottom(D.main)
            };
            if (B > G.left && B < G.right && L > G.top && L < G.bottom) {
                return true
            }
            if (!this.lb_active()) {
                for (H = 0; H < this.cfg.pointer.steps; H++) {
                    E = this.div["pointer" + H];
                    if (B > (this.getLeft(E) + G.left) && B < (this.getRight(E) + G.left) && L > (this.getTop(E) + G.top) && L < (this.getBottom(E) + G.top)) {
                        return true
                    }
                }
            }
            return false
        },
        title_mouseover: function(B) {
            this.div.url_a.style.color = "#009933"
        },
        title_mouseout: function(B) {
            this.div.url_a.style.color = "#0000EE"
        },
        pin: function(B) {
            var C = this.get_active_div(B);
            this.orientation("pin", false, B);
            C.pin_close_img.style.display = "inline"
        },
        destroy_bubble: function(C, B) {
            if (this.other_bubbles[B]) {
                this.other_bubbles[B].current_url = null;
                this.other_bubbles[B].current_tag = null;
                this.other_bubbles[B].main.style.display = "none";
                this.other_bubbles[B].main.parentNode.removeChild(this.other_bubbles[B].main)
            }
        },
        pin_check: function(C) {
            this.hideFlashOverlay();
            this.div.pin_close_img.style.display = this.cfg.close_btn ? "inline": "none";
            try {
                try {
                    var B = this.current_url.split("//")[1].split("/")[0];
                    var F = this.current_url.split("//")[1].split("/")[1];
                    var D = this.current_url.split("?")[0].split(".");
                    var G = D[D.length - 1]
                } catch(E) {}
                if ((C.svc && C.svc.indexOf("Snap_Shot_") != -1 && (C.svc.match(/Video(?!_Engage)/i) || C.svc.indexOf("Audio") != -1)) || (B.toLowerCase().indexOf("youtube.com") != -1 && F.indexOf("v") != -1 && F.indexOf("view_play_list?") == -1) || (B.toLowerCase().indexOf("video.google.") != -1 && F.indexOf("videoplay") != -1) || (B.toLowerCase().indexOf("metacafe.com") != -1 && F.indexOf("watch") != -1) || (B.toLowerCase().indexOf("revver.com") != -1 && F.indexOf("watch") != -1) || (B.toLowerCase().indexOf("revver.com") != -1 && F.indexOf("video") != -1) || (B.toLowerCase().indexOf("video.xanga.com") != -1) || (B.toLowerCase().indexOf("photobucket.com") != -1 && this.current_url.indexOf("action=view") != -1) || (B.toLowerCase().indexOf("veoh.com") != -1 && F.indexOf("videos") != -1) || (B.toLowerCase().indexOf("vids.myspace.com") != -1) || G.toLowerCase() == "mp3") {
                    this.showFlashOverlay()
                }
            } catch(E) {}
        },
        cloneBubble: function() {
            var E = this;
            this.marea_hide(null);
            this.div.preview_img.src = "about:blank";
            var H = this.div.main.cloneNode(true);
            var B = document.getElementsByTagName("body")[0];
            B.insertBefore(H, this.div.main);
            var C = this.other_bubbles.length;
            this.other_bubbles[C] = new Object();
            this.other_bubbles[C].main = H;
            this.get_all_shot_nodes(this.other_bubbles[C].main, this.other_bubbles[C]);
            this.other_bubbles[C].current_url = this.current_url;
            this.other_bubbles[C].current_tag = this.current_tag;
            this.other_bubbles[C].current_element = this.current_element;
            this.other_bubbles[C].current_orientation = this.current_orientation;
            this.other_bubbles[C].cfg = this.cfg;
            this.marea_init(C);
            var I = this.other_bubbles[C];
            this.observe(I.submit, "click", this.form_submit, C);
            this.observe(I.box, "keydown", this.form_submit, C);
            var G = I.box;
            this.observe(G, "focus",
            function(J) {
                if (G.value === E.cfg.text.SearchTheWeb) {
                    G.value = ""
                }
            });
            this.observe(I.preview_img, "load", this.preview_img_loaded, C);
            var F = I.main.getElementsByTagName("input");
            for (var D = 0; D < F.length; D++) {
                if (F[D].tagName.toLowerCase() == "input" && F[D].id.indexOf("box") == -1 && F[D].id.indexOf("submit") == -1 && F[D].id.indexOf("cancel") == -1) {
                    F[D].type = "hidden"
                }
            }
            I.preview_img.src = this.div.preview_img.src.replace("&nl=0", "&nl=1");
            this.draw_bubble(C);
            I.zoom_img.bubble_id = C;
            return C
        },
        startFlash: function() {
            if (this.isSafari) {
                this.div.preview.src = "about:blank"
            }
            this.showDragOverlay();
            this.div.preview_img.src = this.cfg.prefix.cdn_image + "t.gif";
            var B = this.cloneBubble();
            var E = this.other_bubbles[B];
            this.observe(E.drag_overlay, "mousedown", this.dragStart, B);
            this.addMenuEvents(E, B);
            var D = E.preview;
            var C = this.shot_url;
            C = C.replace(/&vid=[^&]+&/, "&vid=nolog&");
            C += "&log=0#autoplay";
            if (this.isSafari) {
                if (this.div.preview) {
                    D.src = "about:blank";
                    this.later(50,
                    function() {
                        D.src = C
                    })
                }
            } else {
                D.contentWindow.location.replace(C)
            }
            this.pin(B);
            this.hide();
            this.marea_show(B)
        },
        pinAndClone: function() {
            this.showDragOverlay();
            var B = this.cloneBubble();
            var C = this.other_bubbles[B];
            this.observe(C.drag_overlay, "mousedown", this.dragStart, B);
            this.addMenuEvents(C, B);
            this.show_shot(this.get_shot_data(this.other_bubbles[B].current_element), B, true);
            this.pin(B);
            this.hide(true)
        },
        showFlashOverlay: function() {
            this.div.flash_overlay.style.display = "";
            this.div.drag_overlay.style.display = ""
        },
        hideFlashOverlay: function() {
            this.div.flash_overlay.style.display = "none";
            this.div.drag_overlay.style.display = ""
        },
        showDragOverlay: function() {
            this.div.flash_overlay.style.display = "none";
            this.div.drag_overlay.style.display = ""
        },
        dragStart: function(E, C) {
            var F = this.get_active_div(C);
            var B = this.get_active_cfg(C);
            if (C == null && (this.dragged_bubble != null || this.shot_data.svc.match(/customJS/i))) {
                return
            }
            var D = this;
            this.drag_state = "start";
            this.dragged_bubble = C;
            this.dragStartX = this.pointerX(E);
            this.dragStartY = this.pointerY(E);
            F.drag_overlay.style.left = (B.css_pos.drag_overlay.x - 300) + "px";
            F.drag_overlay.style.top = (B.css_pos.drag_overlay.y - 300) + "px";
            F.drag_overlay.style.width = (B.css_pos.drag_overlay.w + 600) + "px";
            F.drag_overlay.style.height = (B.css_pos.drag_overlay.h + 600) + "px";
            this.orientation("pin", false, C)
        },
        dragMove: function(H) {
            if (this.dragged_bubble == null) {
                var B = this.div
            } else {
                var B = this.other_bubbles[this.dragged_bubble]
            }
            this.current_ex = this.getPageX(H);
            this.current_ey = this.getPageY(H);
            if (this.isOpera && this.visible(B.main) && H.target.tagName.toLowerCase() != "a" && H.target.className.indexOf("Snap_Shot_") == -1 && H.target.className.indexOf("snap_preview_icon") == -1 && !this.in_shot(H)) {
                this.hide_delay(null, this.cfg.delay.hide)
            }
            if (this.drag_state != "start") {
                return
            }
            var L = B.main;
            var J = this.pointerX(H);
            var G = this.pointerY(H);
            J = J - this.dragStartX;
            G = G - this.dragStartY;
            var K = L.offsetLeft;
            var I = L.offsetTop;
            var F = K - 0 + J;
            var E = I - 0 + G;
            var D = -1 * B.bubble.offsetLeft;
            if (F < D) {
                F = D
            }
            var C = -1 * B.bubble.offsetTop;
            if (E < C) {
                E = C
            }
            L.style.left = F + "px";
            L.style.top = E + "px";
            if (F != D) {
                this.dragStartX = this.pointerX(H)
            }
            if (E != C) {
                this.dragStartY = this.pointerY(H)
            }
            if (!H) {
                var H = window.event
            }
            H.cancelBubble = true;
            if (H.stopPropagation) {
                H.stopPropagation()
            }
        },
        dragStop: function(C) {
            if (this.drag_state != "start") {
                return
            }
            this.drag_state = "off";
            if (this.dragged_bubble == null) {
                var D = this.div;
                var B = this.cfg
            } else {
                var D = this.other_bubbles[this.dragged_bubble];
                var B = this.other_bubbles[this.dragged_bubble].cfg
            }
            D.drag_overlay.style.left = B.css_pos.drag_overlay.x + "px";
            D.drag_overlay.style.top = B.css_pos.drag_overlay.y + "px";
            D.drag_overlay.style.width = B.css_pos.drag_overlay.w + "px";
            D.drag_overlay.style.height = B.css_pos.drag_overlay.h + "px";
            if (this.dragged_bubble == null) {
                D.preview_img.src = B.prefix.cdn_image + "t.gif";
                if (this.isSafari) {
                    D.preview.src = "about:blank"
                }
                this.pinAndClone()
            }
            this.dragged_bubble = null
        },
        pointerX: function(B) {
            return B.pageX || (B.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft))
        },
        pointerY: function(B) {
            return B.pageY || (B.clientY + (document.documentElement.scrollTop || document.body.scrollTop))
        },
        form_submit: function(E, D) {
            var I = this.get_active_div(D);
            var G = false;
            var H = "bsb";
            if (I.box.value === this.cfg.text.SearchTheWeb) {
                H = this.campaign("defaulttext");
                if (this.cfg.search_type != "adult") {
                    G = true
                }
            } else {
                if (I.box.value === "") {
                    H = this.campaign("emptybox");
                    G = true
                } else {
                    H = this.campaign("bsb")
                }
            }
            var C = this.cfg.prefix.search + "?source=" + encodeURIComponent(this.cfg.source) + "&campaign=" + H;
            if (G) {
                if (this.cfg.search_type == "image") {
                    C += "&query=sunflower"
                }
            } else {
                C += "&query=" + encodeURIComponent(I.box.value);
                C += "&spa_key=" + encodeURIComponent(this.cfg.key);
                if (this.cfg.search_type == "adult") {
                    C += "&spa_adult=1"
                }
            }
            var F = (window.event) ? E.srcElement: E.target;
            if (F == I.box) {
                var B = E.keyCode;
                if (B == 13) {
                    E.returnValue = false;
                    if (E.preventDefault) {
                        E.preventDefault()
                    }
                    location.href = C
                }
                return
            } else {
                if (F == I.submit) {
                    window.open(C, "_blank");
                    E.returnValue = false;
                    if (E.preventDefault) {
                        E.preventDefault()
                    }
                    return false
                }
            }
        },
        sendPrecrawlList: function() {
            var D = "?key=" + this.cfg.key;
            for (var C = this.num_precrawl_sent; C < this.thumbnail_precrawl_list.length; C++) {
                D += "&";
                var B = this.thumbnail_precrawl_list[C];
                if (typeof SNAP_COM != "undefined" && SNAP_COM.translateURL) {
                    B = SNAP_COM.translateURL(B)
                }
                if ((D.length + B.length) > 1800) {
                    break
                }
                D += "url" + (C + 1) + "=" + encodeURIComponent(B)
            }
            this.num_precrawl_sent = C;
            D += "&url_count=" + this.thumbnail_precrawl_list.length;
            this.div.lg.src = this.cfg.prefix.preview + "thumbnail_precrawl.php" + D;
            if (this.num_precrawl_sent != this.thumbnail_precrawl_list.length) {
                this.later(1000, this.sendPrecrawlList)
            }
        },
        logFeatureClick: function(B) {
            this.div.lg.src = this.cfg.prefix.preview + "halo_proxy.php?feature_type=" + B + "&img=1&r=" + this.now() + "&vid=" + this.view.id
        },
        setPreviewIframeSrc: function(C, B) {
            this.tmr.mark("shot_iframe_start");
            var D = this.get_active_div(B);
            if (this.isSafari) {
                if (D.preview) {
                    this.later(50,
                    function() {
                        D.preview.src = (C)
                    });
                    if (this.shot_data && !this.shot_data.is_preview) {
                        this.later(300, this.lower_loading_img)
                    }
                }
            } else {
                if (D.preview.contentWindow) {
                    D.preview.contentWindow.location.replace(C)
                }
            }
        },
        sto: function(C, B) {
            if (this.cfg.flavor == "xanga") {
                if (window.restrictedSetTimeout) {
                    return window.restrictedSetTimeout(C, B)
                } else {
                    return window.setTimeout(C, B)
                }
            } else {
                return window.setTimeout(C, B)
            }
        },
        dfs: function(C, B) {
            if (C === undefined) {
                C = this.cfg.dfs
            }
            C += "";
            if (B) {
                while (C.length < 2) {
                    C = "0" + C
                }
                C = B + "" + C
            }
            return C
        },
        empty: function(D) {
            var C, B = D.childNodes;
            for (C = B.length - 1; C >= 0; C--) {
                D.removeChild(B[C])
            }
        },
        marea_init: function(B) {
            var D, C, F = this.get_active_div(B),
            E = {
                queue: {
                    free: [],
                    in_use: [],
                    pending: []
                },
                pane: [],
                element: []
            };
            this.empty(F.marea);
            this.marea_data(B, E);
            for (D = 0; D < 2; D++) {
                C = document.createElement("div");
                this.reset_css(C);
                C.style.position = "absolute";
                C.style.top = "0px";
                C.style.left = "0px";
                C.style.width = "100%";
                C.style.height = "100%";
                C.style.backgroundColor = "#EEEEEE";
                C.style.overflow = "hidden";
                C.style.display = "none";
                E.queue.free.push(C);
                this.el_prop(C, "pid", D);
                this.el_prop(C, "bubble_id", B);
                E.element[D] = C;
                F.marea.appendChild(C);
                this.marea_init_pane(B, D)
            }
        },
        marea_init_pane: function(B, C) {
            var D = this.marea_data(B);
            D.pane[C] = {
                type: null,
                beacon: null,
                product: null,
                action: null
            };
            this.empty(D.element[C])
        },
        marea_data: function(B, C) {
            if (B == null || B == undefined) {
                B = "null"
            }
            if (C !== undefined) {
                this.marea[B] = C
            }
            return this.marea[B]
        },
        marea_prepare: function(L, M) {
            var D, B, K, E, C = this.get_active_div(L),
            I = this.marea_data(L),
            H,
            F,
            J,
            G,
            N = this.shot_data.product || "";
            this.clear_timer("prefetch");
            if (!I.queue.free.length || !this.cfg.has_marea) {
                return
            }
            for (G = 0; G < I.queue.pending.length; G++) {
                H = I.queue.pending[G];
                J = this.el_prop(H, "pid");
                if (this.marea_pane_data(L, J, "type") == M && this.marea_pane_data(L, J, "product") == N) {
                    return
                }
            }
            I.queue.pending.push(H = I.queue.free.shift());
            J = this.el_prop(H, "pid");
            this.empty(H);
            this.marea_pane_data(L, J, "type", M);
            this.marea_pane_data(L, J, "product", this.shot_data.product);
            if (M == "none" || M == "searchbox" || M == "shotsense" || M == "shares" || M == "custom" || M == "done") {
                this.marea_pane_data(L, J, "action", M)
            } else {
                if (SNAP_COM.marea.ad_type.match(/^doubleclick/)) {
                    D = new String(parseInt(Math.random() * 10000000000));
                    while (D.length < 10) {
                        D = "0" + D
                    }
                    B = SNAP_COM.marea.ad_src_base.replace(/;ord=(\d+)/, ";pt=" + N + ";ord=" + D);
                    B = B.replace(/;sov=(\d+)/, ";sov=" + parseInt(Math.random() * 10));
                    B = B.replace(/;bub=(\d+)/, ";bub=" + ((L == null) ? "null": L));
                    B = B.replace(/\/ad(.)\//, "/pfadj/");
                    B = B.replace(/\bsz=(\d+)/, "sz=" + parseInt(C.marea.style.width.replace(/\D/g, "")));
                    E = this.cfg.prefix.cdn_js.replace(/http:\/\//, "") + "motif_beacon.js";
                    B = B.replace(/;snap_survey_url=[^;]*/, ";snap_survey_url=" + escape(E));
                    K = "javascript:(function () { document.write(unescape('%3Cstyle%20type%3D%22text%2Fcss%22%3Ebody%20%7Bmargin%3A%200%3B%7D%3C%2Fstyle%3E%3Cscript%20type%3D%22text%2Fjavascript%22%3E%28function%28%29%20%7Bvar%20pdom%20%3D%20%22__PARENT_DOMAIN__%22%3Bif%20%28%20document.domain%20%21%3D%20pdom%20%26%26%20document.domain.indexOf%28pdom%29%20%21%3D%20-1%29%20%7Bdocument.domain%20%3D%20pdom%3B%7D%7D%29%28%29%3BinDapMgrIf%3Dtrue%3BinDapIF%3Dtrue%3BSNAP_COM%20%3D%20%7Bpane_id%3A%20__PANE_ID__%2Cshot%3A%20%7Bdc_ad%3A%20function%28args%29%20%7Bif%20%28args%29%20%7Bargs.pane_id%20%3D%20SNAP_COM.pane_id%3Bwindow.parent.SNAP_COM.shot.dc_ad%28args%29%3B%7D%7D%2Cset_marea_beacon%3A%20function%28beacon%2C%20bub_id%29%20%7Bwindow.parent.SNAP_COM.shot.marea_set_beacon%28bub_id%2C%20SNAP_COM.pane_id%2C%20beacon%29%3B%7D%2Cshow_marea%3A%20function%28%29%20%7B%7D%2Cmarea_resize%3A%20function%28bubble_id%2C%20size%29%20%7Bwindow.parent.SNAP_COM.shot.marea_resize%28bubble_id%2C%20size%29%3B%7D%7D%2Cad_load_done%3A%20function%28%29%20%7Bwindow.parent.SNAP_COM.shot.tmr.mark%28%22doubleclick_end%22%29%3Bdocument.close%28%29%3B%7D%7D%3Bwindow.parent.SNAP_COM.shot.tmr.mark%28%22doubleclick_start%22%29%3B%3C%2Fscript%3E%3Cscript%20src%3D%22__AD_SRC__%22%20type%3D%22text%2Fjavascript%22%20onload%3D%22SNAP_COM.ad_load_done%28%29%3B%22%3E%3C%2Fscript%3E')); })();";
                    K = K.replace(/__AD_SRC__/, escape(B));
                    K = K.replace(/__PANE_ID__/, escape(J));
                    K = K.replace(/__PARENT_DOMAIN__/, document.domain);
                    F = document.createElement("iframe");
                    this.reset_css(F);
                    F.setAttribute("scrolling", "no");
                    F.frameBorder = "0";
                    F.style.overflow = "hidden";
                    F.style.height = "100%";
                    F.style.width = "100%";
                    if (this.isSafari) {
                        H.appendChild(F);
                        F.src = K
                    } else {
                        F.src = K;
                        H.appendChild(F)
                    }
                } else {
                    this.marea_pane_data(L, J, "action", "search_box");
                    this.marea_pane_data(L, J, "type", "search_box")
                }
            }
            return J
        },
        marea_show: function(I, H, J) {
            if (!this.cfg.has_marea) {
                return
            }
            var D, B = this.get_active_div(I),
            C = this.marea_data(I),
            F,
            E,
            G = false;
            H = H || this.cfg.ad_type;
            this.marea_resize(I, "default");
            do {
                this.marea_hide(I);
                if (!C.queue.pending.length) {
                    F = this.marea_prepare(I, H);
                    G = true
                }
                C.queue.in_use.push(D = C.queue.pending.pop());
                F = this.el_prop(D, "pid")
            } while ( H != "done" && ! G && ( H != this . marea_pane_data ( I , F , "type") || (J && J != this.marea_pane_data(I, F, "product"))));
            if (C.pane[F].type == "search_box") {
                this.marea_searchbox(I);
                return
            }
            this.marea_add_beacon(I, F);
            this.marea_process(I);
            B.search.style.visibility = "hidden";
            B.marea.style.visibility = "inherit";
            D.style.display = ""
        },
        marea_resize: function(C, D) {
            var E = this.get_active_div(C),
            B = this.get_active_cfg(C);
            switch (D) {
            case "full":
                E.marea.style.height = B.css_pos.preview.h + B.css_pos.marea.h + "px";
                break;
            case "default":
            default:
                E.marea.style.height = B.css_pos.marea.h + "px";
                break
            }
        },
        marea_set_beacon: function(B, C, D) {
            var E = this.marea_data(B);
            E.pane[C].beacon = D;
            if (E.element[C].style.display != "none") {
                this.marea_add_beacon(B, C)
            }
        },
        marea_add_beacon: function(C, D) {
            var B, E = this.marea_data(C);
            if (E.pane[D].beacon) {
                B = document.createElement("div");
                B.style.position = "absolute";
                B.style.visibility = "hidden";
                B.innerHTML = E.pane[D].beacon;
                E.element[D].appendChild(B);
                E.pane[D].beacon = null
            }
        },
        marea_pane_data: function(B, C, D, F) {
            var E = this.marea_data(B);
            if (F !== undefined) {
                E.pane[C][D] = F
            }
            return E.pane[C][D]
        },
        marea_html: function(J, H, G) {
            var E = this.marea_data(J);
            var F, C, I, B, D = E.element[H];
            C = D.childNodes;
            I = C.length;
            for (F = 0; F < I; F++) {
                if (C[F].nodeType != 3) {
                    C[F].style.display = "none"
                }
            }
            B = document.createElement("div");
            B.style.overflow = "hidden";
            B.style.height = "100%";
            B.style.width = "100%";
            if (typeof G == "string") {
                B.innerHTML = G
            } else {
                if (G.nodeType) {
                    B.appendChild(G)
                }
            }
            D.appendChild(B)
        },
        marea_process: function(L) {
            var G, H, E, K, B, C = this.get_active_div(L),
            J = this.get_active_cfg(L),
            F = this.marea_data(L),
            I,
            D = this.shot_data;
            for (H = 0; H < F.queue.in_use.length; H++) {
                G = F.queue.in_use[H];
                I = this.el_prop(G, "pid");
                K = this.marea_pane_data(L, I, "type");
                if (G.style.display != "none") {
                    this.marea_add_beacon(L, I)
                }
                switch (F.pane[I].action) {
                case "searchbox":
                case "search_box":
                    this.marea_searchbox(L);
                    break;
                case "shotsense":
                case "custom":
                    E = document.createElement("iframe");
                    E.frameBorder = "0";
                    E.setAttribute("scrolling", "no");
                    E.width = this.cfg.css_pos.marea.w;
                    E.height = this.cfg.css_pos.marea.h;
                    B = (F.pane[I].action == "shotsense" ? this.shotsense_url() : this.custom_shot_bottom_url()) + this.cgi_suffix_from_options(F.pane[I].shotsense_opts);
                    if (this.isSafari) {
                        this.marea_html(L, I, E);
                        E.src = B
                    } else {
                        E.src = B;
                        this.marea_html(L, I, E)
                    }
                    this.shotsense_shown++;
                    break;
                case "charity":
                case "shares":
                    B = J.prefix.spasense + "marea.js?key=" + J.key + "&url=" + encodeURIComponent(D.redir_url) + "&url_s=" + encodeURIComponent(document.location.href) + "&html=" + encodeURIComponent(this.get_inner_text(D.element, 500)) + "&svc=" + encodeURIComponent(D.svc) + "&tag=" + encodeURIComponent(D.tag) + "&s=" + J.size + "&ua=" + (this.isIE ? "ie": this.isFirefox ? "firefox": this.isSafari ? "safari": this.isOpera ? "opera": "unknown") + "&ao=" + (SNAP_COM.clientActive ? "1": "0") + "&rtl=" + J.rtl + "&lang=" + J.lang + "&theme=" + J.theme + "&source=" + encodeURIComponent(J.source) + "&cp=" + J.campaign + "&rnd=" + encodeURIComponent(Math.random()) + "&bub=" + L + "&pid=" + I + "&fb=" + encodeURIComponent(F.pane[I].action) + "&dfs=" + ((D.auto && D.svc.match(/wikipedia/i)) ? this.dfs(J.dfs, 1) : this.dfs()) + "&vid=" + this.view.id + this.cgi_suffix_from_options(F.pane[I].shotsense_opts);
                    this.replace_marea_js(B, L);
                    break;
                default:
                    if (K != "done") {
                        return
                    }
                    break
                }
                this.marea_pane_data(L, I, "type", "done")
            }
        },
        marea_searchbox: function(B) {
            var C = this.get_active_div(B);
            C.search.style.visibility = "inherit";
            C.marea.style.visibility = "hidden"
        },
        marea_hide: function(B) {
            var C, E = this.get_active_div(B),
            D = this.marea_data(B);
            while (C = D.queue.in_use.pop()) {
                D.queue.free.push(C);
                C.style.display = "none";
                this.marea_init_pane(B, this.el_prop(C, "pid"))
            }
        },
        lb_is_linkbubble: function(B) {
            return /linkbubble/i.test(B) ? true: false
        },
        lb_active: function() {
            if (this.lb && this.lb.lb_main && this.lb.lb_main.style.visibility == "visible") {
                return this.lb
            }
            return null
        },
        lb_add_div: function() {
            if (this.lb_added) {
                return
            }
            var G, F, H, E, D = this;
            if (F = document.getElementById("snap_com_shot_lb_main")) {
                F.parentNode.removeChild(F)
            }
            var C = document.getElementsByTagName("html")[0];
            C.style.position = "static";
            this.lb.lb_main = document.createElement("div");
            this.lb.lb_main.id = "snap_com_shot_lb_main";
            this.lb.lb_main.style.position = "absolute";
            this.lb.lb_main.style.visibility = "hidden";
            if (this.cfg.force != "yes" && !this.isOpera && !this.isSafari) {
                this.lb.lb_main.style.top = 0;
                this.sto(function() {
                    if (D.lb.lb_main.offsetTop !== 0) {
                        D.lb.lb_main.innerHTML = ""
                    }
                },
                0)
            }
            var B = document.getElementsByTagName("body")[0];
            B.insertBefore(this.lb.lb_main, B.firstChild);
            this.lb.lb_main.className = "snap_noengage snap_noshots";
            this.el_prop(this.lb.lb_main, "done", true);
            this.lb_added = true;
            this.lb.lb_main.innerHTML = '<img id="snap_com_shot_lb_fcr" src="__T_GIF__" />\n<div id="snap_com_shot_lb_tl"><img id="snap_com_shot_lb_tl_img" src="__T_GIF__" /></div>\n<div id="snap_com_shot_lb_tr"><img id="snap_com_shot_lb_tr_img" src="__T_GIF__" /></div>\n<div id="snap_com_shot_lb_bl"><img id="snap_com_shot_lb_bl_img" src="__T_GIF__" /></div>\n<div id="snap_com_shot_lb_br"><img id="snap_com_shot_lb_br_img" src="__T_GIF__" /></div>\n<img id="snap_com_shot_lb_t_img" src="__T_GIF__" />\n<img id="snap_com_shot_lb_b_img" src="__T_GIF__" />\n<img id="snap_com_shot_lb_l_img" src="__T_GIF__" />\n<img id="snap_com_shot_lb_r_img" src="__T_GIF__" />\n<div id="snap_com_shot_lb_point"><img id="snap_com_shot_lb_point_img" src="__T_GIF__" /></div>\n<div id="snap_com_shot_lb_titlebar">\n    <a href="http://www.snap.com/about/linkbubbles/faq.php" id="snap_com_shot_lb_logo" target="_blank"><img id="snap_com_shot_lb_logo_img" src="__T_GIF__" /></a>\n    <a href="http://www.snap.com/about/linkbubbles/faq.php" id="snap_com_shot_lb_help" target="_blank"><img id="snap_com_shot_lb_help_img" src="__T_GIF__" /></a>\n    <div id="snap_com_shot_lb_close"><img id="snap_com_shot_lb_close_img" src="__T_GIF__" /></div>\n</div>\n<div id="snap_com_shot_lb_content">&#160;</div>\n\n'.replace(/__T_GIF__/g, this.cfg.prefix.cdn_image + "t.gif");
            this.get_all_shot_nodes(this.lb.lb_main, this.lb);
            H = this.lb;
            for (F in H) {
                if (!H[F] || !H.hasOwnProperty(F)) {
                    continue
                }
                if (!H[F].style) {
                    continue
                }
                this.reset_css(H[F]);
                G = H[F].style;
                if (F != "lb_main" && !G.visibility) {
                    G.visibility = "inherit"
                }
                G.zIndex = Number(G.zIndex) + 99999
            }
            E = this.cfg.prefix.preview + "fcr.php?key=" + this.cfg.key + "&ft=";
            this.lb.lb_logo.href = E + "linkbubble_logo&url=" + encodeURIComponent(this.lb.lb_logo.href);
            this.lb.lb_help.href = E + "linkbubble_help&url=" + encodeURIComponent(this.lb.lb_help.href);
            this.set_loc(this.cfg.lb.css_pos, this.lb);
            this.observe(this.lb.lb_main, "mouseover", this.rollover);
            this.observe(this.lb.lb_main, "mouseout", this.rollout);
            this.observe(this.lb.lb_close, "click", this.lb_hide, true);
            this.lb_draw_bubble()
        },
        lb_draw_bubble: function() {
            var D, E, F = this.lb;
            var C = {
                t: "tb",
                b: "tb",
                l: "lr",
                r: "lr"
            };
            for (D in C) {
                if (C.hasOwnProperty(D) && C[D] !== undefined) {
                    E = this.cfg.prefix.image + "lb/lb_" + C[D] + ".png";
                    if (this.needs_png_fix) {
                        F["lb_" + D + "_img"].runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + E + "',sizingMethod='scale')"
                    } else {
                        if (this.isSafari) {
                            F["lb_" + D + "_img"].src = E
                        } else {
                            F["lb_" + D + "_img"].style.backgroundImage = "url(" + E + ")";
                            F["lb_" + D + "_img"].style.backgroundRepeat = "repeat"
                        }
                    }
                }
            }
            C = ["tl", "tr", "bl", "br"];
            for (D = 0; D < C.length; D++) {
                this.set_palette_img(F["lb_" + C[D]], "lb_bg_" + C[D])
            }
            this.set_palette_img(F.lb_logo, "lb_linkbubble");
            this.set_palette_img(F.lb_help, "lb_btn_help");
            this.set_palette_img(F.lb_close, "lb_btn_close");
            this.set_palette_img(F.lb_point, "lb_point_t");
            for (D in this.cfg.lb.style) {
                if (!this.cfg.lb.style.hasOwnProperty(D)) {
                    continue
                }
                for (var B in this.cfg.lb.style[D]) {
                    if ((typeof this.cfg.lb.style[D][B]) == "string") {
                        if (!F[D]) {
                            continue
                        }
                        F[D].style[B] = this.cfg.lb.style[D][B]
                    }
                }
            }
        },
        lb_resize: function(B, D) {
            var C = this.cfg.lb.css_pos;
            var F = this.lb;
            var E = 0;
            if (this.isIE && document.compatMode && document.compatMode != "CSS1Compat") {
                E = -1
            }
            F.lb_content.style.height = D + "px";
            F.lb_content.style.width = E + B + "px";
            D = D + C.lb_tr.h + C.lb_br.h;
            B = B + C.lb_l_img.w;
            F.lb_main.style.height = D + "px";
            F.lb_main.style.width = B + "px";
            F.lb_t_img.style.width = B - (C.lb_tl.w + C.lb_tr.w) + "px";
            F.lb_b_img.style.width = B - (C.lb_bl.w + C.lb_br.w) + "px";
            F.lb_l_img.style.height = D - (C.lb_tl.h + C.lb_bl.h) + "px";
            F.lb_r_img.style.height = D - (C.lb_tr.h + C.lb_br.h) + "px";
            F.lb_titlebar.style.width = B - 26 + "px"
        },
        lb_orientation: function(E) {
            var B = this.lb.lb_point,
            C = (E.substr(0, 1) == "t") ? "top": "bottom",
            D = (E.substr(1, 1) == "l") ? "left": "right";
            this.set_palette_img(this.lb.lb_point, "lb_point_" + (C == "top" ? "t": "b"));
            B.style.top = B.style.left = B.style.bottom = B.style.right = "auto";
            this.lb.lb_point.style[C] = "-13px";
            this.lb.lb_point.style[D] = "20px"
        },
        lb_show: function(H, E) {
            var M, D, G, I, K, F, B, C = false,
            N = this.current_ex,
            L = this.current_ey,
            O = 234,
            J = 60;
            if (F = decodeURIComponent(E.svc).toLowerCase().match(/snap_linkbubble_\S+?\|(\d+)x(\d+)/)) {
                O = parseInt(F[1]);
                J = parseInt(F[2]);
                C = true
            } else {
                if (this.cfg.resize.lb.rz) {
                    O = this.cfg.resize.lb.w;
                    J = this.cfg.resize.lb.h
                }
            }
            if (this.visible(this.div)) {
                this.hide()
            }
            if (!E) {
                E = this.get_shot_data(H)
            }
            this.lb_resize(O, J);
            M = this.fit(N, L, "linkbubble");
            this.lb_orientation(M.orientation);
            this.lb.lb_main.style.left = M.x + "px";
            this.lb.lb_main.style.top = M.y + "px";
            G = document.createElement("iframe");
            G.frameBorder = "0";
            G.setAttribute("scrolling", "no");
            G.style.width = O + "px";
            G.style.height = J + "px";
            if (C) {
                B = this.cfg.prefix.preview + "lbc?&referrer=" + encodeURIComponent(location.href) + "&aseid=" + encodeURIComponent(E.auto.eid) + "&astid=" + encodeURIComponent(E.auto.tid)
            } else {
                B = this.cfg.prefix.preview + "snap_keylinks?"
            }
            if ((typeof E.auto.pattern != "undefined") && (Math.random() < 0.5)) {
                B += "dfs=" + this.dfs(this.cfg.dfs, 3) + "&hints=" + encodeURIComponent(E.auto.pattern)
            } else {
                B += "dfs=" + this.dfs(this.cfg.dfs, 5)
            }
            B += "&key=" + (SNAP_COM.original_key || this.cfg.key) + "&size=" + O + "x" + J + "&svc=" + encodeURIComponent(E.svc) + "&tag=" + encodeURIComponent(E.tag) + "&cp=linkbubble&rnd=" + Math.random() + "&uid=" + this.cfg.user_id + "&vid=" + this.view.id + "&pat=" + encodeURIComponent(E.auto.pattern);
            this.empty(this.lb.lb_content);
            if (this.isSafari) {
                this.lb.lb_content.appendChild(G);
                G.src = B
            } else {
                G.src = B;
                this.lb.lb_content.appendChild(G)
            }
            this.lb.lb_main.style.visibility = "visible"
        },
        lb_hide: function(B) {
            if (B) {
                this.lb.lb_fcr.src = this.cfg.prefix.preview + "fcr.php?key=" + this.cfg.key + "&ft=linkbubble_close&r=" + Math.random() + "&url=" + encodeURIComponent(this.cfg.prefix.cdn_image + "t.gif")
            }
            this.hide();
            this.lb.lb_main.style.visibility = "hidden"
        },
        needs_png_fix: (navigator.userAgent.match(/msie (5\.5|6)/i) && navigator.platform == "Win32"),
        isFirefox: (navigator.userAgent.match(/firefox/i)),
        isSafari: (/Safari|Konqueror|KHTML/gi).test(navigator.userAgent),
        isIE: (!this.isSafari && !navigator.userAgent.match(/opera/gi) && navigator.userAgent.match(/msie/gi)),
        isOpera: (navigator.userAgent.match(/Opera/gi)),
        isWin: (navigator.appVersion.match(/win/gi)),
        getXY: function(E) {
            var C = null;
            var H = [];
            var F, D, B;
            if (E.getBoundingClientRect) {
                F = E.getBoundingClientRect();
                D = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
                B = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
                return [F.left + B, F.top + D]
            } else {
                H = [E.offsetLeft, E.offsetTop];
                C = E.offsetParent;
                var G = (this.getStyle(E, "position") == "absolute");
                if (C != E) {
                    while (C) {
                        H[0] += C.offsetLeft;
                        H[1] += C.offsetTop;
                        if (this.isSafari && !G && (this.getStyle(C, "position") == "absolute")) {
                            G = true
                        }
                        C = C.offsetParent
                    }
                }
                if (this.isSafari && G) {
                    H[0] -= document.body.offsetLeft;
                    H[1] -= document.body.offsetTop
                }
            }
            return H
        },
        getPageX: function(C) {
            var B = C.pageX;
            if (!B && 0 !== B) {
                B = C.clientX || 0;
                if (this.isIE) {
                    B += this._getScrollLeft();
                    if (document.body.clientLeft) {
                        B -= document.body.clientLeft
                    }
                }
            }
            return B
        },
        getPageY: function(B) {
            var C = B.pageY;
            if (C && document.body.style && this.getStyle(document.body, "position") == "relative") {
                C -= 10
            }
            if (!C && 0 !== C) {
                C = B.clientY || 0;
                if (this.isIE) {
                    C += this._getScrollTop();
                    if (document.body.clientTop) {
                        C -= document.body.clientTop
                    }
                }
            }
            return C
        },
        _getScrollLeft: function() {
            return this._getScroll()[1]
        },
        _getScrollTop: function() {
            return this._getScroll()[0]
        },
        _getScroll: function() {
            var B = document.documentElement,
            C = document.body;
            if (B && (B.scrollTop || B.scrollLeft)) {
                return [B.scrollTop, B.scrollLeft]
            } else {
                if (C) {
                    return [C.scrollTop, C.scrollLeft]
                } else {
                    return [0, 0]
                }
            }
        },
        getViewportHeight: function() {
            var B = -1;
            var C = document.compatMode;
            if ((C || this.isIE) && !this.isOpera) {
                if (C === "CSS1Compat") {
                    B = document.documentElement.clientHeight
                } else {
                    B = document.body.clientHeight
                }
            } else {
                B = self.innerHeight
            }
            return B
        },
        getViewportWidth: function() {
            var B = -1;
            var C = document.compatMode;
            if (C || this.isIE) {
                if (C === "CSS1Compat") {
                    B = document.documentElement.clientWidth
                } else {
                    B = document.body.clientWidth
                }
            } else {
                B = self.innerWidth
            }
            return B
        },
        getWidth: function(B) {
            var C = parseInt(B.offsetWidth);
            if (B == document.body || B == document || B == window) {
                return window.getWidth()
            } else {
                if (B) {
                    var C = parseInt(B.offsetWidth);
                    return (C == 0) ? parseInt(B.style.width) : C
                } else {
                    return null
                }
            }
        },
        getHeight: function(C) {
            if (C == document.body || C == document || C == window) {
                return window.getHeight()
            } else {
                if (C) {
                    var B = parseInt(C.offsetHeight);
                    return (B == 0) ? parseInt(C.style.height) : B
                } else {
                    return null
                }
            }
        },
        getLeft: function(B) {
            return B.offsetLeft
        },
        getRight: function(B) {
            return this.getLeft(B) + this.getWidth(B)
        },
        getTop: function(B) {
            return B.offsetTop
        },
        getBottom: function(B) {
            return this.getTop(B) + this.getHeight(B)
        },
        trim: function(B) {
            return B.replace(/^\s*|\s*$/g, "")
        },
        getStyle: function(B, C) {
            return B.style[C]
        },
        getStyleW3C: function(B, E) {
            var D = null;
            if (E == "float") {
                E = "cssFloat"
            }
            var C = (document.defaultView) ? document.defaultView.getComputedStyle(B, "") : null;
            if (C) {
                D = C[E]
            }
            return B.style[E] || D
        },
        getStyleIE: function(B, D) {
            switch (D) {
            case "opacity":
                var F = 100;
                try {
                    F = B.filters["DXImageTransform.Microsoft.Alpha"].opacity
                } catch(E) {
                    try {
                        F = B.filters("alpha").opacity
                    } catch(E) {}
                }
                return F / 100;
                break;
            case "float":
                D = "styleFloat";
            default:
                var C = B.currentStyle ? B.currentStyle[D] : null;
                return (B.style[D] || C)
            }
        },
        AC_AddExtension: function(C, B) {
            if (C.indexOf("?") != -1) {
                return C.replace(/\?/, B + "?")
            } else {
                return C + B
            }
        },
        AC_Generateobj: function(F, E, B) {
            var D = "";
            if (this.isIE && this.isWin && !this.isOpera) {
                D += "<object ";
                for (var C in F) {
                    D += C + '="' + F[C] + '" '
                }
                D += ">";
                for (var C in E) {
                    D += '<param name="' + C + '" value="' + E[C] + '" /> '
                }
                D += "</object>"
            } else {
                D += "<embed ";
                for (var C in B) {
                    D += C + '="' + B[C] + '" '
                }
                D += "> </embed>"
            }
            return (D)
        },
        AC_FL_RunContent: function() {
            var B = this.AC_GetArgs(arguments, ".swf", "movie", "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000", "application/x-shockwave-flash");
            return this.AC_Generateobj(B.objAttrs, B.params, B.embedAttrs)
        },
        AC_GetArgs: function(C, F, H, E, I) {
            var B = new Object();
            B.embedAttrs = new Object();
            B.params = new Object();
            B.objAttrs = new Object();
            for (var D = 0; D < C.length; D = D + 2) {
                var G = C[D].toLowerCase();
                switch (G) {
                case "classid":
                    break;
                case "pluginspage":
                    B.embedAttrs[C[D]] = C[D + 1];
                    break;
                case "src":
                case "movie":
                    C[D + 1] = this.AC_AddExtension(C[D + 1], F);
                    B.embedAttrs.src = C[D + 1];
                    B.params[H] = C[D + 1];
                    break;
                case "onafterupdate":
                case "onbeforeupdate":
                case "onblur":
                case "oncellchange":
                case "onclick":
                case "ondblclick":
                case "ondrag":
                case "ondragend":
                case "ondragenter":
                case "ondragleave":
                case "ondragover":
                case "ondrop":
                case "onfinish":
                case "onfocus":
                case "onhelp":
                case "onmousedown":
                case "onmouseup":
                case "onmouseover":
                case "onmousemove":
                case "onmouseout":
                case "onkeypress":
                case "onkeydown":
                case "onkeyup":
                case "onload":
                case "onlosecapture":
                case "onpropertychange":
                case "onreadystatechange":
                case "onrowsdelete":
                case "onrowenter":
                case "onrowexit":
                case "onrowsinserted":
                case "onstart":
                case "onscroll":
                case "onbeforeeditfocus":
                case "onactivate":
                case "onbeforedeactivate":
                case "ondeactivate":
                case "type":
                case "codebase":
                case "id":
                    B.objAttrs[C[D]] = C[D + 1];
                    break;
                case "width":
                case "height":
                case "align":
                case "vspace":
                case "hspace":
                case "class":
                case "title":
                case "accesskey":
                case "name":
                case "tabindex":
                    B.embedAttrs[C[D]] = B.objAttrs[C[D]] = C[D + 1];
                    break;
                default:
                    B.embedAttrs[C[D]] = B.params[C[D]] = C[D + 1]
                }
            }
            B.objAttrs.classid = E;
            if (I) {
                B.embedAttrs.type = I
            }
            return B
        },
        Rescan: function(B) {
            if (B === null) {
                return
            }
            this.cfg.defer_scan = false;
            if (this.div_added) {
                this.shot_scan(B)
            }
        }
    };
    A.init();
    return A
};
(function() {
    var I = 0;
    var G = 8;
    function B(W, Q) {
        W[Q >> 5] |= 128 << (24 - Q % 32);
        W[((Q + 64 >> 9) << 4) + 15] = Q;
        var X = Array(80);
        var V = 1732584193;
        var U = -271733879;
        var T = -1732584194;
        var S = 271733878;
        var R = -1009589776;
        for (var N = 0; N < W.length; N += 16) {
            var P = V;
            var O = U;
            var M = T;
            var L = S;
            var J = R;
            for (var K = 0; K < 80; K++) {
                if (K < 16) {
                    X[K] = W[N + K]
                } else {
                    X[K] = D(X[K - 3] ^ X[K - 8] ^ X[K - 14] ^ X[K - 16], 1)
                }
                var Y = E(E(D(V, 5), A(K, U, T, S)), E(E(R, X[K]), C(K)));
                R = S;
                S = T;
                T = D(U, 30);
                U = V;
                V = Y
            }
            V = E(V, P);
            U = E(U, O);
            T = E(T, M);
            S = E(S, L);
            R = E(R, J)
        }
        return Array(V, U, T, S, R)
    }
    function A(K, J, M, L) {
        if (K < 20) {
            return (J & M) | ((~J) & L)
        }
        if (K < 40) {
            return J ^ M ^ L
        }
        if (K < 60) {
            return (J & M) | (J & L) | (M & L)
        }
        return J ^ M ^ L
    }
    function C(J) {
        return (J < 20) ? 1518500249 : (J < 40) ? 1859775393 : (J < 60) ? -1894007588 : -899497514
    }
    function E(J, M) {
        var L = (J & 65535) + (M & 65535);
        var K = (J >> 16) + (M >> 16) + (L >> 16);
        return (K << 16) | (L & 65535)
    }
    function D(J, K) {
        return (J << K) | (J >>> (32 - K))
    }
    function F(M) {
        var L = Array();
        var J = (1 << G) - 1;
        for (var K = 0; K < M.length * G; K += G) {
            L[K >> 5] |= (M.charCodeAt(K / G) & J) << (32 - G - K % 32)
        }
        return L
    }
    function H(L) {
        var K = I ? "0123456789ABCDEF": "0123456789abcdef";
        var M = "";
        for (var J = 0; J < L.length * 4; J++) {
            M += K.charAt((L[J >> 2] >> ((3 - J % 4) * 8 + 4)) & 15) + K.charAt((L[J >> 2] >> ((3 - J % 4) * 8)) & 15)
        }
        return M
    }
    SNAP_COM.hex_sha1 = function(J) {
        return H(B(F(J), J.length * G))
    }
})();
if (SNAP_COM.shot_config.version == "3.73") {
    SNAP_COM.shot = SNAP_COM.snap_shot_obj()
} else {
    SNAP_COM.vmiss = document.createElement("img");
    SNAP_COM.vmiss.src = "http://shots.snap.com/vmis.php?vcfg=" + SNAP_COM.shot_config.version + "&vjs=3.73";
    SNAP_COM.vmiss.style.positions = "absolute";
    SNAP_COM.vmiss.style.visibility = "hidden";
    (function() {
        function A() {
            var B = document.getElementsByTagName("body")[0],
            D = document.createElement("iframe"),
            C = D.style;
            D.src = SNAP_COM.get_js_src();
            C.display = "none";
            C.position = "absolute";
            C.bottom = "0px";
            C.width = "1px";
            C.height = "1px";
            B.appendChild(D);
            if (window.setTimeout) {
                window.setTimeout(function() {
                    try {
                        D.contentWindow.location.reload(true)
                    } catch(E) {}
                },
                500)
            }
        }
        if (SNAP_COM.window_loaded) {
            A()
        } else {
            if (window.addEventListener) {
                window.addEventListener("load", A, false)
            } else {
                if (window.attachEvent) {
                    window.attachEvent("onload", A)
                }
            }
        }
    })()
};

//alert(SNAP_COM.hash(document.location.href) );

//alert("tok:" + SNAP_COM.snap_shot_obj.tok('bbb'));