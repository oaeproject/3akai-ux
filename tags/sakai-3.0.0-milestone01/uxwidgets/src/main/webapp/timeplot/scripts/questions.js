
function showHideDiv(id) {
  var div = document.getElementById(id);
  if (!div.animator) {
    div.style.left = "-5000px";
    div.style.position = "absolute";
    div.style.display = "block";
    var height = div.clientHeight;
    div.style.height = "0px";
    div.style.position = "static";
    div.animator = SimileAjax.Graphics.createAnimation(function(current, delta) {
      div.style.height =  Math.round(current + delta) + "px";
    }, 0, height, 2000, function() {
      div.style.height = div.animator.to + "px";
      // now swap start + end values for next time
      var temp = div.animator.from;
      div.animator.from = div.animator.to;
      div.animator.to = temp;
      div.animator.current = div.animator.from;
      div.animator.timePassed = 0;
    });
  }
  div.animator.run();
}

sdata.widgets.WidgetLoader.informOnLoad("timeplot");