/**
 *
 * Contains all the information necessary to render the bili chart given
 * an infant with a set of bilis. Currently uses Highcharts.js
 *
 * For clean separation of concerns, only constants related to the visible
 * rendering of the chart should go here.
 *
 * We can assume Biligram.Infant and Biligram.Calculator
 *
 * */

define([
  'jquery', 'biligram/calculator', 'highcharts-core', 'highcharts-more',
], function(jquery, calculator, Highcharts) {
  // shape of the markers on the graph based on test type
  const MARKERS = {
    'Serum': 'circle',
    'POC': 'diamond',
    'TC': 'square',
  };

  const MARKERCOLORS = {
    transfusionHigh: 'DarkViolet',
    transfusionMedium: 'DarkViolet',
    transfusionLow: 'DarkViolet',
    phototherapyHigh: '#1016FF',
    phototherapyMedium: '#1016FF',
    phototherapyLow: '#1016FF',
    riskHigh: 'red',
    riskHighIntermediate: 'orange',
    riskLowIntermediate: 'yellow',
    riskLow: 'green',
    riskUndefined: 'grey',
  };

  const BILIPROPS = {
    name: 'Bilirubin level<br>(serum: \u25cf, POC: \u2666, transcut: \u25A0)<br><br>',
    color: 'black',
    type: 'line',
    fillOpacity: 1,
    lineWidth: 2,
  };

  const RISKZONEPROPS = {
    'High': {
      name: 'High risk zone',
      abbreviation: 'Hi risk',
      color: 'red',
    },
    'HighIntermediate': {
      name: 'High-intermediate risk zone',
      abbreviation: 'Hi-int risk',
      color: 'orange',
    },
    'LowIntermediate': {
      name: 'Low-intermediate risk zone',
      abbreviation: 'Lo-int risk',
      color: 'yellow',
    },
    'Low': {
      name: 'Low risk zone',
      abbreviation: 'Low risk',
      color: 'green',
    },
    'Undefined': {
      name: 'Undefined',
      abbreviation: 'Undefined',
      color: 'green',
      nograph: true,
    },
  };

  const TREATMENTZONEPROPS = {
    'phototherapyBand': {
      color: '#1016FF',
    },
    'phototherapy': {
      'High': {
        /* eslint max-len: "off" */
        name: 'Phototherapy threshold<br>\u22ef low risk infants, \u2265 38w \u0026 well<br>' + '-- med risk, \u2265 38w \u0026 risk factors<br>\u2003 \u2003 \u2003 \u2003 \u2003 or 35-37w6d \u0026 well<br>' + '\u2014 hi risk infants, 35-37w6d \u0026 risk factors<br>(isoimmune dz, G6PD, asphyxia, lethargy,<br>' + 'temp instability, sepsis, albumin < 3)<br>',
        type: 'spline',
        lineWidth: 1.5,
        color: '#1016FF',
      },
      'Medium': {
        name: 'Infants at medium risk (38+ weeks and risk factors, or 35-37w6d and well)',
        type: 'spline',
        lineWidth: 1.5,
        color: '#1016FF',
        dashStyle: 'dash',
        linkedTo: ':previous',
      },
      'Low': {
        name: 'Phototherapy threshold',
        type: 'spline',
        lineWidth: 1.5,
        color: '#1016FF',
        dashStyle: 'dot',
        linkedTo: ':previous',
      },
    },
    'transfusion': {
      'High': {
        name: 'Transfusion threshold',
        type: 'spline',
        lineWidth: 1.5,
        color: 'DarkViolet',
      },
      'Medium': {
        name: 'Infants at medium risk (38+ weeks and risk factors, or 35-37w6d and well)',
        type: 'spline',
        lineWidth: 1.5,
        color: 'DarkViolet',
        dashStyle: 'dash',
        linkedTo: ':previous',
      },
      'Low': {
        name: 'Infants at lower risk (38+ weeks and well)',
        type: 'spline',
        lineWidth: 1.5,
        color: 'DarkViolet',
        dashStyle: 'dot',
        linkedTo: ':previous',
      },
    },
  };

  return {

    /**
     * render - Main entry point to render the chart. Given an infant, render the
     * bilis in the container provided
     *
     * @param {object} infant - Biligram.Infant
     * @param {dom} container - dom ID
     * @param {dom} enableTooltips - boolean
     * @param  {fn} getTooltipText description
     * @param  {fn} getRangeName   description
     */
    render: function(infant, container, enableTooltips, getTooltipText, getRangeName) {
      // this is the object used by Highcharts to render the chart. There are a TON of properties!
      // As a summary:
      //  title & subtitle
      //  chart
      //  x-axis
      //  y-axis
      //  legend
      //  tooltips
      //  plotOptions (seems similar to chart above, but slightly different?)
      //  series - this is the actual data, an array of objects (on object for each series plotted)

      var chartOptions = {
        title: {
          // text: 'Bilirubin nomogram',
          // text: 'Bilirubin nomogram',
          text: '',
          x: -120, // center,
        },

        credits: {
          enabled: false,
        },
        chart: {
          type: 'arearange',
          // events: getBiliResults(),
          zoomType: 'xy',
          panning: true,
          panKey: 'shift',
          animation: false,
          scrollbar: {
            enabled: true,
          },
          renderTo: container,
        },
        subtitle: {
          // text: 'Source: <a href="http://pediatrics.aappublications.org/content/114/1/297">Pediatrics 2004; 114(1)</a>',
          text: 'GA ' + infant.rawGa + ' weeks, ' + infant.weight + 'kg',
          x: -145,
          align: 'right',
        },
        xAxis: [
          {
            title: {
              text: 'Age <i>(hours)</i>',
            },
            tickInterval: 24,
            minorTickInterval: 12,
            min: 0,
            max: 168,
          }, {
            title: {
              text: 'Age <i>(days)</i>',
            },
            labels: {
              formatter: function() {
                return this.value / 24;
              },
            },
            linkedTo: 0, // this secondary access just re-displays the primary (0) axis in a different format
            opposite: true,
            plotBands: makePlotBands(infant),
          },
        ],
        yAxis: {
          title: {
            text: 'Total bilirubin (mg/dL)',
          },
          plotLines: [
            {
              value: 0,
              width: 1,
              color: 'gray',
            },
          ],
          floor: 0,
          // max: 25
          ceiling: 25,
        },
        legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'middle',
          borderWidth: 0,
          useHTML: false,
          itemHoverStyle: {
            color: 'DarkGray',
          },
        },
        tooltip: {
          useHTML: true,
          opacity: 0.9,
          hideDelay: 300, // default is 500 ms until the tooltip fades
          snap: 15, // proximity snap, default 10
          enabled: enableTooltips,
          formatter: function() {
            // return this.series.name;

            return this.point.customTooltip;
          },
        },
        plotOptions: {
          series: {
            allowPointSelect: false,
            enableMouseTracking: false,
            fillOpacity: 0.6,
            lineWidth: 0,
            marker: {
              enabled: false,
            },
            animation: false,
            stickyTracking: false,
          },
        },

        series: [].concat(getRiskZoneSeries(), getTreatementZoneSeries(), getBiliSeries()),
      }; // end chartOptions definition

      // create the chart with the specified options
      new Highcharts.Chart(chartOptions);

      // ----- HELPER METHODS FOR GENERATING CHART OPTIONS

      /**
         * getBiliSeries - ???
         *
         * @return {array}
         */
      function getBiliSeries() {
        return [$.extend({}, BILIPROPS, {
            id: 'Bili',
            animation: true,
            data: makePoints(infant, getTooltipText),
            marker: {
              enabled: true,
            },
            allowPointSelect: false,
            enableMouseTracking: true,
          })];
      }

      /**
         * getRiskZoneSeries - description
         *
         * @return {array}  description
         */
      function getRiskZoneSeries() {
        var series = [];
        var RiskZone = calculator.RiskZone;

        var pairs = {
          'High': 'HighIntermediate',
          'HighIntermediate': 'LowIntermediate',
          'LowIntermediate': 'Low',
          'Low': 'Undefined',
        };

        for (var zone in RISKZONEPROPS) {
          var props = RISKZONEPROPS[zone];
          if (!props.nograph) {
            series.push($.extend({}, props, {
              id: zone,
              data: addXCoordinatesWithRange(RiskZone.getSeriesByName(pairs[zone]), RiskZone.getSeriesByName(zone), RiskZone.interval, RiskZone.startsAt),
            }));
          }
        }

        return series;
      }

      /**
         * getTreatementZoneSeries - description
         *
         * @return {array}  description
         */
      function getTreatementZoneSeries() {
        var series = [];
        var zoneTypes = [
          {
            name: 'transfusion',
            inZone: function() {
              return infant.inTreatmentZoneTransfusion();
            },
          }, {
            name: 'phototherapy',
            inZone: function() {
              return infant.inTreatmentZonePhoto();
            },
          },
        ];

        var TreatmentZone = calculator.TreatmentZone;

        for (var i = 0; i < zoneTypes.length; i++) {
          var zoneType = zoneTypes[i].name;
          // alert("Zone type: " + zoneTypes[i].name + zoneTypes[i].inZone())
          for (var zone in TREATMENTZONEPROPS[zoneType]) {
            var props = TREATMENTZONEPROPS[zoneType][zone];

            series.push($.extend({}, props, {
              id: zoneType + zone,
              // visible:zoneTypes[i].inZone(),
              visible: ((zoneTypes[i].inZone() == true)),
              data: addXCoordinates(TreatmentZone.getSeriesByName(zoneType, zone), TreatmentZone.interval, TreatmentZone.startsAt),
            }));
          }
        }

        return series;
      }

      /**
         * addXCoordinatesWithRange - // Given two arrays of y coordinates, replace it with an array of datapoint objects that includes
         * x coordinates at a given interval of hours (and low and high values for the y coordinates for a range plot)
         * We use this to make an area plot for each zone of the Bhutani nomogram (low, low-int, high-int and high)
         *
         * @param  {type} yCoordinatesLow  description
         * @param  {type} yCoordinatesHigh description
         * @param  {type} interval         description
         * @param  {type} startsAt         description
         * @return {type}                  description
         */
      function addXCoordinatesWithRange(yCoordinatesLow, yCoordinatesHigh, interval, startsAt) {
        var arrayLength = yCoordinatesHigh.length;
        var x = startsAt;
        var returnArray = [];

        for (var i = 0; i < arrayLength; i++) {
          var dataPoint = {
            x: x,
            low: yCoordinatesLow[i],
            high: yCoordinatesHigh[i],
          };

          returnArray.push(dataPoint);
          x += interval;
        }
        return (returnArray);
      }

      /**
         * addXCoordinates - Given an array of y coordinates, replace it with an array of datapoint objects that includes
         * x coordinates at a given interval of hours
         * We use this to plot the phototherapy and transfusion therapy thresholds
         *
         * @param  {type} yCoordinates description
         * @param  {type} interval     description
         * @param  {type} startsAt     description
         * @return {type}              description
         */
      function addXCoordinates(yCoordinates, interval, startsAt) {
        var arrayLength = yCoordinates.length;
        var x = startsAt;
        var returnArray = [];

        for (var i = 0; i < arrayLength; i++) {
          var dataPoint = {
            x: x,
            y: yCoordinates[i],
          };

          returnArray.push(dataPoint);
          x += interval;
        }
        return (returnArray);
      }

      /**
         * makePoints - Create the series for plotting from the infant's bili array
         *
         * @param  {object} infant
         * @param  {fn} getTooltipText
         * @return {Array}
         */
      function makePoints(infant, getTooltipText) {
        var points = $.map(infant.getBilis(), convertToPoint);

        /**
             * convertToPoint
             *
             * @param  {type} bili bili object
             * @return {type}      point object for chart
             */
        function convertToPoint(bili) {
          return {x: bili.hours, y: bili.level, marker: makeMarker(bili), dataLabels: makeLabel(bili), customTooltip: getTooltipText(bili)};
        }

        /**
             * makeLabel - create label from content
             *
             * @param  {type} bili description
             * @return {type}      description
             */
        function makeLabel(bili) {
          // Usually not visible, but display if tx indicated
          var transfusion = bili.getTreatmentZoneTransfusion()
            ? 'transfusion' + bili.getTreatmentZoneTransfusion()
            : false;
          var photo = bili.getTreatmentZonePhoto()
            ? 'phototherapy' + bili.getTreatmentZonePhoto()
            : false;
          if (transfusion || photo || 1) {
            return {
              backgroundColor: MARKERCOLORS[transfusion] || MARKERCOLORS[photo],
              color: (transfusion || photo)
                ? 'white'
                : 'contrast',
              borderRadius: '3px',
              align: 'center',
              style: {
                'textShadow': '',
                'fontWeight': 'regular',
                'textOutline': '1 px 1 px contrast',
              },
              x: 0,
              y: -6,
              enabled: true,
              formatter: function() {
                {
                  // photo will look like photoTherapyMedium, phototherapyHigh or false;
                  // similarly with transfusion
                  // We'll use that to build the data labels

                  if (transfusion) {
                    return '\u26a0 ' + bili.level; // Unicode warning sign
                  } else if (photo) {
                    return '\u2600 ' + bili.level; // + '-' + photo + "-";
                  } else {
                    return bili.level;
                  }
                  /*
                                switch (photo) {
                                    case 'phototherapyLow', 'phototherapyMedium':
                                        dataLabel = '?photo';
                                        break;
                                    case 'photoTherapyHigh':
                                        dataLabel = 'photo';
                                        break;

                                }
                                */
                }
              },
            };
          } else {
            return {};
          }
        }

        /**
             * makeMarker - make the marker for this bili mapping to correct
             symbol, color, line width, line color
             *
             * @param  {type} bili description
             * @return {type}      description
             */
        function makeMarker(bili) {
          return {
            enabled: true,
            lineWidth: 1,
            fillColor: getColor(bili),
            symbol: MARKERS[bili.method],
            lineColor: 'black',
          };
        }

        /**
             * getColor - determine color base on value
             *
             * @param  {type} bili description
             * @return {type}      description
             */
        function getColor(bili) {
          // create the index

          var index = bili.getTreatmentZoneTransfusion();
          if (index) {
            index = 'transfusion' + index;
          } else {
            index = bili.getTreatmentZonePhoto();
            if (index) {
              index = 'phototherapy' + index;
            } else {
              index = 'risk' + bili.getRiskZone();
            }
          }

          return MARKERCOLORS[index] || '';
        }

        return points;
      }

      /**
         * makePlotBands -
         *
         * @param  {type} infant description
         * @return {type}        description
         */
      function makePlotBands(infant) {
        var data = [];
        var bands = infant.getPhototherapy();

        for (var i = 0; i < bands.length; i++) {
          var band = bands[i];
          data.push({
            color: TREATMENTZONEPROPS['phototherapyBand']['color'], // Color value
            from: band.start, // Start of the plot band
            to: band.end, // End of the plot band,
          });
        }

        return data;
      }

      /*
        function makeTitle(infant) {
            var data = "";
            // infant.rawGa + infant.weight


            return data;
        }
        */
    },
  };
});
