/*************************************************************
 * This file will be used to overwrite local.js if -Dwith-math
 * is specified at build time, resulting in imageFonts being enabled
 */

MathJax.hub.Config({
    imageFont: "TeX"
});

MathJax.Ajax.loadComplete("[MathJax]/config/local/local.js");
