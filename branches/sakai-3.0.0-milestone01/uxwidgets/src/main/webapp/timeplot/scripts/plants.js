var timeplot1;
var timeplot2;
var tg1 = new Timeplot.ReverseTimeGeometry({ gridColor: "#660066", axisLabelsPlacement: "top", labeller: new Timeplot.MADateLabeller("en", SimileAjax.DateTime.getTimezone()),
  max: "0542-01-01", min: "0000-01-01", timeZone: 0});
var tg2 = new Timeplot.ReverseTimeGeometry({ gridColor: "#660066", axisLabelsPlacement: "top", labeller: new Timeplot.MADateLabeller("en", SimileAjax.DateTime.getTimezone()),
  max: "0542-01-01", min: "0000-01-01", timeZone: 0});

// Sakai Widget Instance

var sakai = sakai || {};

sakai.timeplot2 = {};
sakai.timeplot = function(tuid, placement, showSettings){
	var rootel = $("#" + tuid);
	if (showSettings) {
		$("#timeplot_settings",rootel).show();
	}
	else {
		$("#timeplot_output",rootel).show();
		sakai.timeplot2.onLoad();
	}
}


sakai.timeplot2.onLoad = function() {

  var toggler;
  var toggler1;

  var esAngiosperms = new Timeplot.DefaultEventSource();
  var esCarbonBurial = new Timeplot.DefaultEventSource();
  var esCO2 = new Timeplot.DefaultEventSource();
  var esCS = new Timeplot.DefaultEventSource();
  var esGymnosperms = new Timeplot.DefaultEventSource();
  var esO2 = new Timeplot.DefaultEventSource();
  var esPaleotemp = new Timeplot.DefaultEventSource();
  var esPteridophytes = new Timeplot.DefaultEventSource();
  var esSealevel = new Timeplot.DefaultEventSource();
  var esTectonicActivity = new Timeplot.DefaultEventSource();
  var esIceage = new Timeplot.DefaultEventSource();
  var esImpEvents = new Timeplot.DefaultEventSource();
  var esPlantSpecies = new Timeplot.DefaultEventSource();
  var esMassExtinctions = new Timeplot.DefaultEventSource();
  var esSEDEX = new Timeplot.DefaultEventSource();
  var esLeafEvo = new Timeplot.DefaultEventSource();
  var esLifeCycle = new Timeplot.DefaultEventSource();
  var esInsects = new Timeplot.DefaultEventSource();
  var esTetrapods = new Timeplot.DefaultEventSource();
  var esMajorGroups = new Timeplot.DefaultEventSource();

  var dsAngiosperms = new Timeplot.ColumnSource(esAngiosperms,1);
  var dsCarbonBurial = new Timeplot.ColumnSource(esCarbonBurial,1);
  var dsCO2 = new Timeplot.ColumnSource(esCO2,1);
  var dsCS = new Timeplot.ColumnSource(esCS,1);
  var dsGymnosperms = new Timeplot.ColumnSource(esGymnosperms,1);
  var dsO2 = new Timeplot.ColumnSource(esO2,1);
  var dsPaleotemp = new Timeplot.ColumnSource(esPaleotemp,1);
  var dsPteridophytes = new Timeplot.ColumnSource(esPteridophytes,1);
  var dsSealevel = new Timeplot.ColumnSource(esSealevel,1);
  var dsTectonicActivity = new Timeplot.ColumnSource(esTectonicActivity,1);
  var dsInsects = new Timeplot.ColumnSource(esInsects,1);
  var dsTetrapods = new Timeplot.ColumnSource(esTetrapods,1);
  
  var gc = new Timeplot.Color("#ccccccc");
  var g1 = new Timeplot.DefaultValueGeometry({ axisLabelsPlacement: "right", gridType: "short", max: 25, min: -5, gridColor: gc });
  var g3 = new Timeplot.DefaultValueGeometry({ axisLabelsPlacement: "left", gridType: "short", max: 8000, min: 0, gridColor: gc});
  var g4 = new Timeplot.DefaultValueGeometry({ axisLabelsPlacement: "left", gridType: "short", max: 711, min: 705, gridColor: gc});
  var g5 = new Timeplot.DefaultValueGeometry({ axisLabelsPlacement: "left", gridType: "short", max: 100, min: 0, gridColor: gc});
  var g6 = new Timeplot.DefaultValueGeometry({ axisLabelsPlacement: "right", gridType: "short", max: 400, min: -100, gridColor: gc});
  var g7 = new Timeplot.DefaultValueGeometry({ axisLabelsPlacement: "right", gridType: "short", max: 32, min: 0, gridColor: gc});
  var g8 = new Timeplot.DefaultValueGeometry({ axisLabelsPlacement: "right", gridType: "short", max: 710, min: 706, gridColor: gc});
  var g9 = new Timeplot.DefaultValueGeometry({ axisLabelsPlacement: "right", gridType: "short", max: 10, min: 0, gridColor: gc});
  var g10= new Timeplot.InverseValueGeometry({ axisLabelsPlacement: "right", gridType: "short", max: 3.2, min: -3.2, gridColor: gc});
  var g11= new Timeplot.DefaultValueGeometry({ axisLabelsPlacement: "left", gridType: "short", max: 710, min: 706, gridColor: gc});

  var piAngiosperms = Timeplot.createPlotInfo({id: "angiosperms", dataSource: dsAngiosperms, timeGeometry: tg2, valueGeometry: g5,
    lineColor: "rgba(153,51,153, 1)", dotColor: "rgba(153,51,153, 0.5)", showValues: false, fillColor: "rgba(153,51,153, 0.5)", fillGradient: false});
  var piCarbonBurial = Timeplot.createPlotInfo({id: "carbonburial", dataSource: dsCarbonBurial, timeGeometry: tg1, valueGeometry: g9,
    lineColor: "#2E8A5C", dotColor: "#2E8A5C", showValues: false});
  var piCO2 = Timeplot.createPlotInfo({id: "co2", dataSource: dsCO2, timeGeometry: tg1, valueGeometry: g3,
    lineColor: "#333399", dotColor: "#333399", showValues: false, valuesBorder: "#333399", valuesColour: "#333399", valuesText: "#ffffff"});
  var piCS = Timeplot.createPlotInfo({id: "cs", dataSource: dsCS, timeGeometry: tg1, valueGeometry: g1,
    lineColor: "#CC9966", dotColor: "#CC9966", showValues: false});
  var piGymnosperms = Timeplot.createPlotInfo({id: "gymnosperms", dataSource: dsGymnosperms, timeGeometry: tg2, valueGeometry: g5,
    lineColor: "rgba(61,184,122,1)", dotColor: "rgba(61,184,122, 0.3)", showValues: false, fillColor: "rgba(61,184,122, 0.3)", fillGradient: false});
  var piO2 = Timeplot.createPlotInfo({id: "o2", dataSource: dsO2, timeGeometry: tg1, valueGeometry: g7,
    lineColor: "#339933", dotColor: "#339933", showValues: false, valuesBorder: "#339933", valuesColour: "#339933", valuesText: "#ffffff"});
  var piPaleotemp = Timeplot.createPlotInfo({id: "paleotemp", dataSource: dsPaleotemp, timeGeometry: tg1, valueGeometry: g10,
    lineColor: "#993333", dotColor: "#993333", showValues: false, roundValues: false, valuesBorder: "#993333", valuesColour: "#993333", valuesText: "#ffffff", valuesRight: false});
  var piPteridophytes = Timeplot.createPlotInfo({id: "pteridophytes", dataSource: dsPteridophytes, timeGeometry: tg2, valueGeometry: g5,
    lineColor: "rgba(102,153,204,1)", dotColor: "rgba(102,153,204, 0.3)", showValues: false, fillColor: "rgba(102,153,204, 0.3)", fillGradient: false});
  var piSealevel = Timeplot.createPlotInfo({id: "sealevel", dataSource: dsSealevel, timeGeometry: tg1, valueGeometry: g6,
    lineColor: "#66CCCC", dotColor: "#66CCCC", showValues: false});
  var piTectonicActivity = Timeplot.createPlotInfo({id: "tectonicactivity", dataSource: dsTectonicActivity, timeGeometry: tg1, valueGeometry: g11,
    lineColor: "#6666CC", dotColor: "#6666CC", showValues: false});
  var piInsects = Timeplot.createPlotInfo({id: "insects", dataSource: dsInsects, timeGeometry: tg1, valueGeometry: g11,
    lineColor: "#CC9966", dotColor: "#CC9966", showValues: false});
  var piTetrapods = Timeplot.createPlotInfo({id: "tetrapods", dataSource: dsTetrapods, timeGeometry: tg1, valueGeometry: g11,
    lineColor: "#66CC99", dotColor: "#66CC99", showValues: false});

  var piIceage = Timeplot.createPlotInfo({id: "iceage", eventSource: esIceage, timeGeometry: tg1, lineColor: "#339999", bubbleWidth: 300, bubbleHeight: 100});
  var piImpEvents = Timeplot.createPlotInfo({id: "impevents", eventSource: esImpEvents, timeGeometry: tg2, lineColor: "rgba(204,102,153,0.2)", bubbleWidth: 700, bubbleHeight: 350});
  var piPlantSpecies = Timeplot.createPlotInfo({id: "plantspecies", eventSource: esPlantSpecies, timeGeometry: tg2, lineColor: "#8A2E5C", bubbleWidth: 700, bubbleHeight: 500, showLabel: true});
  var piMassExtinctions = Timeplot.createPlotInfo({id: "massextinctions", eventSource: esMassExtinctions, timeGeometry: tg2, lineColor: "rgba(184,61,122,0.4)", eventLineWidth: 10.0, bubbleWidth: 300, bubbleHeight: 100});
  var piSEDEX = Timeplot.createPlotInfo({id: "sedex", eventSource: esSEDEX, timeGeometry: tg1, lineColor: "rgba(204,102,102,0.4)", valueGeometry: g1, bubbleWidth: 700, bubbleHeight: 250});
  var piLeafEvo = Timeplot.createPlotInfo({id: "leafevo", eventSource: esLeafEvo, timeGeometry: tg2, lineColor: "rgba(153,204,102,0.5)", bubbleWidth: 700, bubbleHeight: 250});
  var piLifeCycle = Timeplot.createPlotInfo({id: "lifecycle", eventSource: esLifeCycle, timeGeometry: tg2, lineColor: "rgba(102,102,204,0.4)", bubbleWidth: 650, bubbleHeight: 400, eventLineWidth: 10.0});
  var piMajorGroups = Timeplot.createPlotInfo({id: "majorgroups", eventSource: esMajorGroups, timeGeometry: tg2, lineColor: "rgba(204,102,204,0.4)", bubbleWidth: 650, bubbleHeight: 400, eventLineWidth: 10.0});

  var plotInfo1 = [
    piCarbonBurial, piCO2, piCS, piO2, piPaleotemp, piSealevel, piTectonicActivity, piIceage, piSEDEX
  ];

  var plotInfo2 = [
    piAngiosperms, piGymnosperms, piPteridophytes, piImpEvents, piPlantSpecies, piLeafEvo, piMassExtinctions, piLifeCycle, piInsects, piTetrapods, piMajorGroups
  ];

  timeplot1 = Timeplot.create(document.getElementById("timeplot1"), plotInfo1);
  timeplot2 = Timeplot.create(document.getElementById("timeplot2"), plotInfo2);
  
  toggler1 = BN.Toggle.create("bar", timeplot1, 4, "200px");
  toggler2 = BN.Toggle.create("foo", timeplot2, 4, "250px"); 

  toggler1.addPlot("CO2", "/devwidgets/timeplot/data/CO2data.txt", piCO2, dsCO2, ",", esCO2, "txt", "#6666CC", source[1], true);
  toggler1.addPlot("O2", "/devwidgets/timeplot/data/O2data.txt", piO2, dsO2, ",", esO2, "txt", "#00ffff", source[0], true);
  toggler1.addPlot("paleotemp", "/devwidgets/timeplot/data/paleotemp.txt", piPaleotemp, dsPaleotemp, ",", esPaleotemp, "txt", "#006666", source[2], true);
  toggler1.addPlot("iceage", "/devwidgets/timeplot/data/iceage.xml",piIceage, null,"",esIceage,"xml", "#abcdef", source[3]);
 
  toggler2.addPlots("anggympte", [
    BN.Toggle.createItem("/devwidgets/timeplot/data/Angiosperms.txt", piAngiosperms, dsAngiosperms, ",", esAngiosperms, "txt"),
    BN.Toggle.createItem("/devwidgets/timeplot/data/Gymnosperms.txt", piGymnosperms, dsGymnosperms, ",", esGymnosperms, "txt"), 
    BN.Toggle.createItem("/devwidgets/timeplot/data/Pteridophytes.txt", piPteridophytes, dsPteridophytes, ",", esPteridophytes, "txt")], "#000000", source[4]);
  toggler2.addPlot("impevents", "/devwidgets/timeplot/data/ImpEvents.xml", piImpEvents, null, "", esImpEvents, "xml", "#0000ff", source[10]);
  toggler2.addPlot("plantspec", "/devwidgets/timeplot/data/PlantSpecies.xml", piPlantSpecies, null, "", esPlantSpecies, "xml", "#99FF00", source[7]);
  toggler2.addPlot("massex", "/devwidgets/timeplot/data/MassExtinctions.xml",piMassExtinctions, null,"",esMassExtinctions,"xml","#ff0000", source[8]);
  toggler2.addPlot("lifecycle", "/devwidgets/timeplot/data/lifecycle.xml",piLifeCycle, null,"",esLifeCycle,"xml","#00c000",source[9]);
  toggler2.addPlot("Insects", "/devwidgets/timeplot/data/Insects.txt", piInsects, dsInsects, ",", esInsects,"txt", "#F3A05A", source[11]);
  toggler2.addPlot("Tetrapods", "/devwidgets/timeplot/data/Tetrapods.txt", piTetrapods, dsTetrapods, ",", esTetrapods,"txt", "#CCFF66", source[12]);
  toggler2.addPlot("Major Groups", "/devwidgets/timeplot/data/MajorGroups.xml", piMajorGroups, null, "", esMajorGroups,"xml", "#CCFF66", source[13]);


  timeplot1.putText("title", "Phanerozoic", "", {
    left: 0,
    top: -10,
    width: 1000,
    textAlign: "center"
    });
  timeplot2.putText("title", "Phanerozoic", "", {
    left: 0,
    top: -10,
    width: 1000,
    textAlign: "center"
    });
}            

var resizeTimerID = null;
function onResize() {
  if (resizeTimerID == null) {
    resizeTimerID = window.setTimeout(function() {
      resizeTimerID = null;
      if (timeplot1) timeplot1.repaint();
    }, 0);
  }
}

sdata.widgets.WidgetLoader.informOnLoad("timeplot");