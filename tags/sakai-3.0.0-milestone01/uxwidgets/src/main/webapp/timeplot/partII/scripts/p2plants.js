
// image preloader
(function() {
var preload_image_object = new Image();
var image_url = new Array("105","120","150","170","200","20","220","240","260","280","300","340","35","370","400","430","450","470","500","50","540","65","90","present");
for(var i=0; i<=image_url.length; i++) 
preload_image_object.src = "http://www.ensemble.ac.uk/dev/plants/timeplot/images/small/" + image_url[i] + "moll.jpg";
})();

var timeplot1;
var timeplot2;
var tg = new Timeplot.ReverseTimeGeometry({ gridColor: "#660066", axisLabelsPlacement: "top"});

function onLoad() {

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
  
  var gc = new Timeplot.Color("#ccccccc");
  var g1 = new Timeplot.DefaultValueGeometry({ axisLabelsPlacement: "right", gridType: "short", max: 25, min: -5, gridColor: gc });
  var g3 = new Timeplot.DefaultValueGeometry({ axisLabelsPlacement: "left", gridType: "short", max: 8000, min: 0, gridColor: gc});
  var g4 = new Timeplot.DefaultValueGeometry({ axisLabelsPlacement: "left", gridType: "short", max: 711, min: 705, gridColor: gc});
  var g5 = new Timeplot.DefaultValueGeometry({ axisLabelsPlacement: "left", gridType: "short", max: 100, min: 0, gridColor: gc});
  var g6 = new Timeplot.DefaultValueGeometry({ axisLabelsPlacement: "right", gridType: "short", max: 400, min: -100, gridColor: gc});

  var piAngiosperms = Timeplot.createPlotInfo({id: "angiosperms", dataSource: dsAngiosperms, timeGeometry: tg, valueGeometry: g5,
    lineColor: "#ffff00", dotColor: "#ffff00", showValues: false, fillColor: "#ffff00", fillGradient: false});
  var piCarbonBurial = Timeplot.createPlotInfo({id: "carbonburial", dataSource: dsCarbonBurial, timeGeometry: tg, valueGeometry: g1,
    lineColor: "#660066", dotColor: "#660066", showValues: false});
  var piCO2 = Timeplot.createPlotInfo({id: "co2", dataSource: dsCO2, timeGeometry: tg, valueGeometry: g3,
    lineColor: "#ff6600", dotColor: "#ff6600", showValues: false});
  var piCS = Timeplot.createPlotInfo({id: "cs", dataSource: dsCS, timeGeometry: tg, valueGeometry: g1,
    lineColor: "#ff00cc", dotColor: "#ff00cc", showValues: false});
  var piGymnosperms = Timeplot.createPlotInfo({id: "gymnosperms", dataSource: dsGymnosperms, timeGeometry: tg, valueGeometry: g5,
    lineColor: "#0000ff", dotColor: "#0000ff", showValues: false, fillColor: "#0000ff", fillGradient: false});
  var piO2 = Timeplot.createPlotInfo({id: "o2", dataSource: dsO2, timeGeometry: tg, valueGeometry: g5,
    lineColor: "#00ffff", dotColor: "#00ffff", showValues: false});
  var piPaleotemp = Timeplot.createPlotInfo({id: "paleotemp", dataSource: dsPaleotemp, timeGeometry: tg, valueGeometry: g1,
    lineColor: "#006666", dotColor: "#006666", showValues: false});
  var piPteridophytes = Timeplot.createPlotInfo({id: "pteridophytes", dataSource: dsPteridophytes, timeGeometry: tg, valueGeometry: g5,
    lineColor: "#224488", dotColor: "#224488", showValues: false, fillColor: "#224488", fillGradient: false});
  var piSealevel = Timeplot.createPlotInfo({id: "sealevel", dataSource: dsSealevel, timeGeometry: tg, valueGeometry: g6,
    lineColor: "#ff6622", dotColor: "#ff6622", showValues: false});
  var piTectonicActivity = Timeplot.createPlotInfo({id: "tectonicactivity", dataSource: dsTectonicActivity, timeGeometry: tg, valueGeometry: g4,
    lineColor: "#cceeaa", dotColor: "#cceeaa", showValues: false});

  var piIceage = Timeplot.createPlotInfo({id: "iceage", eventSource: esIceage, timeGeometry: tg, lineColor: "#abcdef"});
  var piImpEvents = Timeplot.createPlotInfo({id: "impevents", eventSource: esImpEvents, timeGeometry: tg, lineColor: "rgba(0,0,255,0.2)", bubbleWidth: 675, bubbleHeight: 400});
  var piPlantSpecies = Timeplot.createPlotInfo({id: "plantspecies", eventSource: esPlantSpecies, timeGeometry: tg, lineColor: "rgba(152,0,236,0.4)"});
  var piMassExtinctions = Timeplot.createPlotInfo({id: "massextinctions", eventSource: esMassExtinctions, timeGeometry: tg, lineColor: "rgba(240,0,0,0.4)"});
  var piSEDEX = Timeplot.createPlotInfo({id: "sedex", eventSource: esSEDEX, timeGeometry: tg, lineColor: "rgba(255,128,0,0.4)", valueGeometry: g1});
  var piLeafEvo = Timeplot.createPlotInfo({id: "leafevo", eventSource: esLeafEvo, timeGeometry: tg, lineColor: "rgba(0,240,0,0.4)"});
  var piLifeCycle = Timeplot.createPlotInfo({id: "lifecycle", eventSource: esLifeCycle, timeGeometry: tg, lineColor: "#33ffff", bubbleWidth: 650, bubbleHeight: 400, eventLineWidth: 10.0});

  var plotInfo1 = [
    piCarbonBurial, piCO2, piCS, piO2, piPaleotemp, piSealevel, piTectonicActivity, piIceage, piSEDEX
  ];

  var plotInfo2 = [
    piAngiosperms, piGymnosperms, piPteridophytes, piImpEvents, piPlantSpecies, piLeafEvo, piMassExtinctions, piLifeCycle
  ];

  timeplot1 = Timeplot.create(document.getElementById("timeplot1"), plotInfo1);
  timeplot2 = Timeplot.create(document.getElementById("timeplot2"), plotInfo2);

  toggler1 = BN.Toggle.create("bar", timeplot1, 4, "200px");
  toggler2 = BN.Toggle.create("foo", timeplot2, 4, "200px"); 

  toggler1.addPlot("./data/CarbonBurial.txt", piCarbonBurial, dsCarbonBurial, ",", esCarbonBurial, "txt", "#660066", source[4]);
  toggler1.addPlot("./data/CO2data.txt", piCO2, dsCO2, ",", esCO2, "txt", "#ff6600", source[1]);
  toggler1.addPlot("./data/C-S.txt", piCS, dsCS, ",", esCS, "txt", "#ff00cc", source[11] );
  toggler1.addPlot("./data/O2data.txt", piO2, dsO2, ",", esO2, "txt", "#00ffff", source[0]);
  toggler1.addPlot("./data/paleotemp.txt", piPaleotemp, dsPaleotemp, ",", esPaleotemp, "txt", "#006666", source[2]);
  toggler1.addPlot("./data/sealevel.txt", piSealevel, dsSealevel,",",esSealevel,"txt","#ff6622",source[3], true);
  toggler1.addPlot("./data/TectonicActivity.txt", piTectonicActivity, dsTectonicActivity,",",esTectonicActivity,"txt","#cceeaa", source[5]);
  toggler1.addPlot("./data/iceage.xml",piIceage, null,"",esIceage,"xml", "#abcdef", source[9], true);
  toggler1.addPlot("./data/SEDEX.xml",piSEDEX, null,"",esSEDEX,"xml","#ff8000",source[10]);
  
  toggler2.addPlot("./data/Angiosperms.txt", piAngiosperms, dsAngiosperms, ",", esAngiosperms, "txt", "#ffff00", source[14]);
  toggler2.addPlot("./data/Gymnosperms.txt", piGymnosperms, dsGymnosperms, ",", esGymnosperms, "txt", "#0000ff", source[13]);
  toggler2.addPlot("./data/Pteridophytes.txt", piPteridophytes, dsPteridophytes, ",", esPteridophytes, "txt", "#224488", source[12]);
  toggler2.addPlot("./data/ImpEvents.xml", piImpEvents, null, "", esImpEvents, "xml", "#0000ff", source[21]);
  toggler2.addPlot("./data/PlantSpecies.xml", piPlantSpecies, null, "", esPlantSpecies, "xml", "#8c00f0", source[15]);
  toggler2.addPlot("./data/LeafEvo.xml", piLeafEvo, null, "", esLeafEvo, "xml", "#00f000", source[18]);
  toggler2.addPlot("./data/MassExtinctions.xml",piMassExtinctions, null,"",esMassExtinctions,"xml","#ff0000", source[16]);
  toggler2.addPlot("./data/lifecycle.xml",piLifeCycle, null,"",esLifeCycle,"xml","#33ffff",source[19]);
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
