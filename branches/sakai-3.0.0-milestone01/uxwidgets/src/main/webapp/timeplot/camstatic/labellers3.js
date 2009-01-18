Timeplot.MADateLabeller = function(locale, timeZone) {
  Timeline.GregorianDateLabeller.apply(this, arguments);
};

Object.extend(Timeplot.MADateLabeller.prototype, Timeline.GregorianDateLabeller.prototype);

Timeplot.MADateLabeller.prototype.labelPrecise = function(date) {
  return date.getUTCFullYear() + " Ma";
};

sdata.widgets.WidgetLoader.informOnLoad("timeplot");