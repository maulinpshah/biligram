/**
 * Encapsulate all the logic for determining if a particular
 * bilirubin is in a particular risk zone or treatment zone.
 *
 * Also contains all the information to be able to plot the
 * zones directly.
 *
 * In a perfect world we could return a constant (non-zero)
 * for each riskZone and treatmentZone (actually a string would be best)
 * That could then be mapped back to the index in the series below
 *
 * I would have liked to have seen:
 *
 * getRiskZone
 * getTreamentZonePhototherapy
 * getTreatmentZoneTransfusion
 *
 *
 * this keeps the constants (the curve data in):
 *
 * Biligram.Calculator.RiskZone
 * Biligram.Calculator.TreatmentZone
 *
 *
 *
 */
define('biligram/calculator',[],function() {
  return {
    /**
     *
     * @param {type} bili
     * @param {type} infant
     * @return {string} return the risk zone as String:
     *  Low, LowIntermediate, HighIntermediate, High (or false if unable to calculate)
     */
    getRiskZone: function(bili, infant) {
      return this
        .RiskZone
        .get(bili, infant);
    },

    /**
     * returns an object of transfusion zone and phototherapy zone
     * where the value of each item is
     *
     * @param {type} bili
     * @param {type} infant
     * @return {object} { phototherapy:value, transfusion:value} where value is
     * as string of:
     *  Low, Medium, High (or false of unable to calculate)
     */
    getTreatmentZone: function(bili, infant) {
      return this
        .TreatmentZone
        .get(bili, infant);
    },

    RiskZone: {
      interval: 4, // How many hours apart are each data point
      startsAt: 12,
      // Each line in the series, followed by literal index identifiers
      // We're using an array rather than an object in order to guarantee order
      /* eslint max-len: "off" */
      series: [
        [
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
          25,
        ],
        [
          7.1,
          7.2,
          7.4,
          7.8,
          8.9,
          10.0,
          11.1,
          12.2,
          12.5,
          13.2,
          13.8,
          14.4,
          15.2,
          15.4,
          15.6,
          15.9,
          16.2,
          16.4,
          16.7,
          17.0,
          17.2,
          17.4,
          17.4,
          17.5,
          17.5,
          17.5,
          17.6,
          17.7,
          17.6,
          17.5,
          17.4,
          17.4,
          17.3,
          17.3,
          17.4,
        ],
        [
          5.1,
          5.5,
          5.9,
          6.1,
          7.0,
          8.0,
          8.9,
          9.9,
          10.3,
          10.8,
          11.3,
          12.0,
          12.6,
          12.9,
          13.1,
          13.4,
          13.8,
          14.3,
          14.7,
          14.7,
          15.0,
          15.2,
          15.3,
          15.4,
          15.5,
          15.6,
          15.7,
          15.8,
          15.7,
          15.6,
          15.5,
          15.4,
          15.3,
          15.2,
          15.2,
        ],
        [
          3.9,
          4.3,
          4.7,
          4.9,
          5.5,
          6.3,
          7.0,
          7.8,
          8.1,
          8.6,
          9.0,
          9.3,
          9.6,
          10.2,
          10.7,
          11.2,
          11.3,
          11.4,
          11.6,
          11.8,
          12.2,
          12.3,
          12.5,
          12.7,
          12.8,
          13.0,
          13.1,
          13.2,
          13.2,
          13.2,
          13.2,
          13.2,
          13.2,
          13.2,
          13.3,
        ],
        [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
        ], // Array.fill not supported in IE11 or below,
      ],
      seriesNames: [
        'High',
        'HighIntermediate',
        'LowIntermediate',
        'Low',
        'Undefined',
      ],
      seriesMap: {
        High: 0,
        HighIntermediate: 1,
        LowIntermediate: 2,
        Low: 3,
        Undefined: 4,
      },
      getSeriesByName: function(name) {
        return this.series[this.seriesMap[name]];
      },
      // Given an age in hours, what threshold (if any) is a bilirubin level above?
      get: function(bili) {
        var hours = bili.hours;
        var level = bili.level;
        var xDistance;
        var y1;
        var y2;
        var x1;
        var x1Index;
        var threshold;
        // Get the nearest (on the left side) x value in hours
        // So if an age is, say, 29 hours, and our interval is 4, we're looking for
        // 28 hours (x1), or position 7 in the array (the x1Index)
        x1Index = Math.floor((hours - this.startsAt) / this.interval);
        x1 = Math.floor(hours / this.interval) * this.interval;

        // If we are looking for a risk level prior to when they're defined, return undefined
        if (hours < this.startsAt) {
          return 'Undefined';
        }

        // If the hour is so late it falls off the right side of the nomogram, we'll use the rightmost data
        // point available, which assumes it more or less goes off forever at the same bilirubin level
        if (x1Index >= this.series[0].length) {
          x1Index = this
            .series[0]
            .length - 1;
        }

        // Go through each series at the age in hours
        // If we exceed that zones ceiling, we return the next zone "up"
        // We get to skip the high risk zone, since if we exceed high-int risk we're high risk
        // We get to skip the low risk zone, since if it doesn't exceed any of the other zones it's low risk
        for (var i = 1; i < this.series.length - 1; i++) {
          y1 = this.series[i][x1Index];
          if (x1Index + 1 < this.series[0].length) {
            y2 = this.series[i][x1Index + 1];
          } else {
            // We're at the right edge of the series, so assume it's a straight line
            y2 = y1;
          }
          // Rate of y increase between two data points is (y2 - y1)/interval
          // Since that's a linear function, the threshold we're looking for is (y2 - y1)/interval
          // Slope = rise/run; rise is y2-y1; run is always the interval
          // So given a slope and two points, the point slope formula says
          // y2-y1 = slope * (x2-x1), or
          // y2 = y1 + slope * (x2 - x1)
          // xDistance is how far it is from x1 to hours
          xDistance = hours - x1;
          threshold = y1 + (xDistance * ((y2 - y1) / this.interval));
          if (level >= threshold) {
            return this.seriesNames[i - 1]; // If we exceeded this zone's ceiling, return the next zone "up"
            // E.g., if we exceeded the ceiling of the low risk zone, return low-intermediate risk
          }
        }
        // If we made it here, we didn't cross a threshold
        return 'Low';
      },
    },

    // Phototherapy treatment zone thresholds literal object
    // For phototherapy, we exceed the treatment threshold for infants at low risk
    // (>= 38 weeks GA and well) at the top line,
    // at medium risk (>= 38 week + risk factors of isoimmune hemolytic disease,
    // G6PD deficiency, asphyxia, significant lethargy,
    // temperature instability, sepsis, acidosis or an albumin level < 3.0 g/dL if measured)
    // or 35-37w6d and well
    // or for high risk infants 35-37w6d + risk factors
    // Phototherapy zones start at 0 hours of life
    TreatmentZone: {
      interval: 12,
      startsAt: 0,
      phototherapySeries: [
        [
          6.7,
          9,
          11.5,
          13.5,
          15.2,
          16.4,
          17.6,
          18.8,
          19.8,
          20.5,
          21,
          21,
          21,
          21,
          21,
        ],
        [
          5,
          7.6,
          9.8,
          11.7,
          13.1,
          14.5,
          15.4,
          16.4,
          17.2,
          17.9,
          18,
          18,
          18,
          18,
          18,
        ],
        [
          3.8,
          6.0,
          7.8,
          9.5,
          11.1,
          12.4,
          13.4,
          14,
          14.5,
          14.9,
          15,
          15,
          15,
          15,
          15,
        ],
      ],
      transfusionSeries: [
        [
          16,
          17.7,
          19,
          20.8,
          22.1,
          23,
          23.9,
          24.4,
          24.9,
          24.9,
          24.9,
          24.9,
          24.9,
          24.9,
          24.9,
        ],
        [
          13.8,
          15.1,
          16.5,
          17.9,
          19.1,
          20.1,
          21.2,
          22,
          22.4,
          22.4,
          22.4,
          22.4,
          22.4,
          22.4,
          22.4,
        ],
        [
          12,
          13.5,
          15,
          16,
          17.1,
          18,
          18.5,
          18.8,
          19,
          19,
          19,
          19,
          19,
          19,
          19,
        ],
      ],

      seriesNames: [
        'High', 'Medium', 'Low',
      ],
      seriesMap: {
        High: 2,
        Medium: 1,
        Low: 0,
      },

      /**
         * return the series of the type specified by zone
         * @param {string} type String "phototherapy" or "transfusion"
         * @param {string} name - String "High", "Medium", or "Low"
         * @return {array} series of data points
         */
      getSeriesByName: function(type, name) {
        return this[type + 'Series'][this.seriesMap[name]];
      },
      //
      // Given an age in hours and bilirubin level, for a given gestational age at birth, is the bilirubin level above
      // a phototherapy or transfusion treatment threshold?
      //
      // Skip checking the low line if GA >= 38:
      // Return undefined if GA < 35 weeks
      // If GA is 38+ weeks and the baby is well, the treatment threshold is the highest line
      // If the GA is 38+ weeks and baby is sick, or 35-37w6d and the baby is well, it's the medium line
      // If the GA is 35-37w6d and sick, it's the low line
      //
      // So long as we know the gestational age of the baby, we can only cross one variety of
      //  zone; the low risk (highest)
      // phototherapy line cross the high risk (lowest) transfusion therapy line at the right of the
      // nomogram,
      // but because the high risk lines are for 35-37w6d babies and the low risk lines are only
      // for 38w0d babies, a baby
      // can't exceed both the high risk photoTx line and the low risk transfusionTx line
      // Still, there could be ambiguity where a 38 week sick baby might need transfusion but
      // the same baby who is
      // well only needs phototherapy, so in that case we'd need to report exceeds threshold
      // for phototherapy if well
      // and transfusion if sick
      //
      //
      // We'll go through transfusiontherapy first, then phototherapy
      //
      // Returns an object: { exceedsPhoto, exceedsTranfusion }
      get: function(bili) {
        var hours = bili.hours;
        var level = bili.level;
        var gaBirth = bili.infant.ga;
        var xDistance;
        var y1;
        var y2;
        var x1;
        var x1Index;
        var threshold;
        var returnValue = {
          phototherapy: false,
          transfusion: false,
        };

        x1Index = Math.floor((hours - this.startsAt) / this.interval);
        x1 = Math.floor(hours / this.interval) * this.interval;

        // if the hours fall off the right edge of the graph, assume for the purposes of treatment levels
        // we're at the rightmost edge
        if (x1Index > this.phototherapySeries[0].length) {
          x1Index = this
            .phototherapySeries[0]
            .length - 1; // - 1
        }

        for (i = 0; i < this.phototherapySeries.length - (gaBirth >= 38); i++) {
          // started out with 0 + (gaBirth >= 38)
          y1 = this.phototherapySeries[i][x1Index];

          if (x1Index + 1 < this.phototherapySeries[0].length) {
            y2 = this.phototherapySeries[i][x1Index + 1];
          } else {
            y2 = y1;
          }
          xDistance = hours - x1;
          threshold = y1 + (xDistance * ((y2 - y1) / this.interval));
          if (level >= threshold) {
            returnValue.phototherapy = this.seriesNames[i];
            break;
          }
        }

        for (i = 0; i < this.transfusionSeries.length - (gaBirth >= 38); i++) {
          // also needs to add back 0 + gaBirth >= 38
          y1 = this.transfusionSeries[i][x1Index];
          if (x1Index + 1 < this.transfusionSeries[0].length) {
            y2 = this.transfusionSeries[i][x1Index + 1];
          } else {
            y2 = y1;
          }
          xDistance = hours - x1;
          threshold = y1 + (xDistance * ((y2 - y1) / this.interval));
          if (level >= threshold) {
            returnValue.transfusion = this.seriesNames[i];
            break;
          }
        }
        return returnValue;
      },
    },
  };
});

/**
 *
 * @param method - string of POC, TC, or Serum
 * @param props - data object of {time:Date, level:number} of bilirubin value
 * @param infant - circular reference back to calling infant
 * @constructor
 */
define('biligram/bili',['biligram/calculator'], function(calculator) {
  return function(method, props, infant) {
    this.time = new Date(props.time);
    this.level = props.level;
    this.method = method;
    this.infant = infant;
    this.hoursInt = ((this.time - infant.birthday) / 3600000);
    this.hours = this
      .hoursInt
      .toFixed(1);

    var riskZone = calculator.getRiskZone(this, infant);
    var treatmentZone = calculator.getTreatmentZone(this, infant);

    if (treatmentZone.phototherapy) {
      this.infant.treatmentZonePhototherapy = true;
    }
    if (treatmentZone.transfusion) {
      this.infant.treatmentZoneTransfusion = true;
    }
    $.extend(this, {
      getTimeAbbreviation: function() {
        return (1 + this.time.getMonth()) + '/' + this
          .time
          .getDate() + ' ' + this
          .time
          .getHours() + ':' + (
        '0' + this.time.getMinutes()).slice(-2);
      },

      getRiskZone: function() {
        return riskZone;
      },

      getTreatmentZonePhoto: function() {
        return treatmentZone.phototherapy;
      },

      getTreatmentZoneTransfusion: function() {
        return treatmentZone.transfusion;
      },
    });
  };
});

// Expects Biligram.Calculator

define('biligram/infant',[
  'jquery', 'biligram/bili',
], function($, Bili) {
  return function(props
  /* {
                birthday:Date (date and time of birth)
                ga:number
                weight:number
    } */) {
    var bilis = [];
    var phototherapy = [];

    $.extend(this, props, {
      /**
       * setPhototherapyTimes - Given a set of dates, set the phototherapy time
       * when this patient was under the lights
       *
       * @param  {array} data                    array of dates when phototherapy documentd
       * @param  {type} assumedDurationPerPoint duration of phototherapy for each point (defaults to 2)
       */
      setPhototherapyTimes: function(data, assumedDurationPerPoint) {
        phototherapy = [];

        for (var i = 0; i < data.length; i++) {
          var time = new Date(data[i]);
          var hours = (time - this.birthday) / 3600000;
          phototherapy.push({
            start: hours,
            end: hours + (assumedDurationPerPoint || 2),
          });
        }
      },
      /**
       * getPhototherapy -  TODO - make this real!
       *
       * @return {type}  description
       */
      getPhototherapy: function() {
        return phototherapy;
      },

      /**
       * addBilis - add an array of bilirubin values to the infant
       *
       * @param  {string} method a string representing how the bili was drawn (POC, TC, or Serum)
       * @param  {array} data   and array of objects {level:number,time:Date}
       */
      addBilis: function(method, data) {
        for (var i = 0; i < data.length; i++) {
          bilis.push(new Bili(method, data[i], this));
        }
      },

      // get the sorted list of bilis
      getBilis: function(direction) {
        if (!direction) {
          direction = 1;
        }

        bilis.sort(function(a, b) {
          if (a.time < b.time) {
return -1 * direction;
}
          if (a.time > b.time) {
return 1 * direction;
}
          return 0;
        });

        return bilis;
      },

      getBiliCount: function() {
        return bilis.length;
      },

      isYoung: function() {
        // return this.ga >= 35 && this.ga < 38;
        return this.ga < 38;
      },

      isTooYoung: function() {
        return this.ga < 35;
      },

      inTreatmentZonePhoto: function() {
        return this.treatmentZonePhototherapy;
      },

      inTreatmentZoneTransfusion: function() {
        return this.treatmentZoneTransfusion;
      },

      hasWarnings: function() {
        var errors = [];

        if (this.ga < 35) {
          // alert("Pushing InvalidAge warning");
          errors.push({
            message: 'InvalidAge',
            context: {
              AGE: this.rawGa,
            },
          });
        } else if (this.ga < 36) {
          if (this.weight < 2.5) {
            // 35-36 weeks must be more than 2.5kg
            errors.push({
              message: 'InvalidWeight35',
              context: {
                AGE: this.rawGa,
                WEIGHT: this.weight,
              },
            });
          }
        } else {
          if (this.weight < 2.5) {
            // 36+ weeks, must be at least 2kg
            errors.push({
              message: 'InvalidWeight36',
              context: {
                AGE: this.rawGa,
                WEIGHT: this.weight,
              },
            });
          }
        }
        // alert("Errors: " + errors[errors.length - 1].message);

        if (this.inTreatmentZonePhoto() || this.inTreatmentZoneTransfusion()) {
          // alert("Pushing InRiskZone warning");
          errors.push({
            message: 'InTxZone',
            context: {
              TYPE: this.inTreatmentZoneTransfusion()
                ? 'transfusion'
                : 'phototherapy',
            },
          });
        }
        // alert("Errors: " + errors[errors.length - 1].message);

        return errors.length
          ? errors
          : false;
      },
    });
  };
});

define('biligram/parse',[
  'jquery', 'biligram/infant',
], function($, Infant) {
  const elements = {
    BILIS: {
      'Serum': '#biliSerum',
      'POC': '#biliPOC',
      'TC': '#biliTCLab',
    },
    BIRTHDAY: '#birthDay',
    BIRTHTIME: '#birthTime',
    GA: '#birthGA',
    WEIGHT: '#birthWeight',
    PHOTOTHERAPY: '#phototherapy',
  };

  /**
   * getPhototherapyTimes - // Given a photoTherapy div (output of an LPG which yields phototherapy flowsheet rows)
   // generate an array of phototherapy start times. Note that there are no end times,
   // but nurses document at least every 4 hours,
   // so we'll try to make a vague line that stretches out to 4 hours
   // Results will come in two rows: columns of timestamps (6/3/2016 1518) followed by a row of methods (bank lights,
   // triple lights, double lights, blanket/pad, overhead, bed â€”Â multiple therapies will be separated by a semicolon

   *
   * @return {type}  description
   */
  function getPhototherapyTimes() {
    var data = [];
    // var phototherapyOutput = $(elements.PHOTOTHERAPY).val();

    // alert ("Phototherapy div: " + phototherapyOutput);
    //  $('tr').each(function(index) {
    //     var cells = $('td', this);
    //  });
    // if (phototherapyOutput) {
    // var datetime = /([0-9+]\/[0-9]+\/[0-9]+)\s([0-9]{4})/g.exec(phototherapyOutput);
    // First we grab a list of datetimes
    // var datetime = phototherapyOutput.match(/([0-9+]\/[0-9]+\/[0-9]+)\s([0-9]{4})/g);

    // Then we remove the datetimes from the string
    // phototherapyOutput = phototherapyOutput.replace(/([0-9+]\/[0-9]+\/[0-9]+)\s([0-9]{4})/g, '');

    // Then we get rid of the Source (Phototherapy): headers
    // phototherapyOutput = phototherapyOutput.replace(/Source \(Phototherapy\):\s/g, '');

    // Get rid of the main Phototherapy header on top
    // phototherapyOutput = phototherapyOutput.replace(/Phototherapy/, '');

    // Replace triple tabs with a single
    // phototherapyOutput = phototherapyOutput.replace(/\t\t\t/g, '\t');
    // phototherapyOutput = phototherapyOutput.replace(/[\n|\r]/g, '\t');

    // var method = phototherapyOutput.match()
    /*
     data.push({
     starttime: ,
     method:
     });
     */

    // }

    return data;
  }


  /**
   * makeBirthday - parse birthday text
   *
   * @param  {type} rawBirthDay  description
   * @param  {type} rawBirthTime description
   * @return {type}              description
   */
  function makeBirthday(rawBirthDay, rawBirthTime) {
    if (!rawBirthTime) {
      return '';
    }

    var stickAColonInIt = function(time) {
      if (!time) {
        return '';
      }
      if (time.indexOf(':') >= 0) {
        return time;
      } else {
        var len = time.length;
        if (len == 4) {
          return time.slice(0, 2) + ':' + time.slice(2, 4);
        } else {
          return time.slice(0, 1) + ':' + time.slice(1, 3);
        }
      }
    };

    return Date.parse(rawBirthDay + ' ' + stickAColonInIt(rawBirthTime));
  }


  /**
   * makeWeight -
   *
   * @param  {type} rawWeight description
   * @return {type}           description
   */
  function makeWeight(rawWeight) {
    return parseFloat(rawWeight);
  }


  /**
   * makeGA -create gestation age numeric from text
   *
   * @param  {type} rawGA description
   * @return {type}       description
   */
  function makeGA(rawGA) {
    var result = rawGA || '';

    var wholePlusFrac = rawGA.split(' ');

    if (wholePlusFrac.length > 1) {
      var frac = wholePlusFrac[1].split('/');
      var whole = parseInt(wholePlusFrac[0]);
      result = whole + (parseInt(frac[0]) / parseInt(frac[1]));
    }

    return result;
  }

  /**
   * parseEpicTableResult - given a component table,return an array of
   * DATUM objects, or add to the data array if provided
   *
   * @param  {type} element description
   * @return {type}         description
   */
  function parseEpicTableResult(element) {
    var data = [];
    $(element + ' tr').each(function(index) {
      if (index > 1) { // Skip the first index since it's the header row
        var cells = $('td', this);


        // alert("Cell text: \n" + this.innerText + ">>"+ cells.length);
        // If the row doesn't begin with a number, it's a comment, like "Critical results called to RN by Elisia...:
        // and we need to ignore it
        // if (this.innerText.match(/^\d/g)) {

        // Updated 2018-05-24 to look for an actual timestamp, in order to avoid tripping
        // over lab comments that happen to begin with numbers
        // if this.innerText.match(/^\d+\/\d+\/\d+\s\d+:\d+\s\d+/g)) {
        
        // Updated 2018-05-27: If we have 4+ rows, we know we have a result instead of a number, since the result column is not blank
        if (cells.length >= 3) {
          data.push({
            time: Date.parse(cells[0].innerText),
            level: parseFloat(cells[1].innerText),
            // Parsefloat gets rid of things like asterisks for out of range values,
          });
        }
      }
    });
    return data;
  }

  return {

    newInfant: function(success, failure) {
      var birthday = makeBirthday($(elements.BIRTHDAY).val(), $(elements.BIRTHTIME).val());
      var ga = makeGA($(elements.GA).val());
      var weight = makeWeight($(elements.WEIGHT).val());

      var errors = [];
      if (!$(elements.BIRTHTIME).val()) {
        errors.push({message: 'NoBirthtime'});
      } else if (!birthday) {
        errors.push({message: 'NoBirthday'});
      }
      if (!ga) {
        errors.push({message: 'NoGA'});
      }
      if (!weight) {
        errors.push({message: 'NoWeight'});
      }
      if (errors.length) {
        failure(errors);
      } else {
        var infant = new Infant({
          birthday: birthday,
          weight: weight,
          ga: ga,
          rawGa: $(elements.GA).val(),
        });

        for (var component in elements.BILIS) {
          infant.addBilis(component, parseEpicTableResult(elements.BILIS[component]));
        }

        infant.setPhototherapyTimes(getPhototherapyTimes());

        success(infant);
      }
    },
  };
});

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

define('biligram/chart',[
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

/**
 * encapsulate ALL rendering functions
 * this gives a single entry point for all rendering
 * and makes it easy to swap out various bits and pieces
 *
*/
define('biligram/ui',[
  'jquery', 'biligram/chart',
], function($, chart) {
  /**
   * fillTemplate - given a dom element, replace any instances of {{TOKEN}}
   * with items in the props object
   *
   * @param  {type} id    element of template
   * @param  {type} props object with token values
   * @return {type}       filled in template
   */
  function fillTemplate(id, props) {
    var template = $(id).html() || '';
    var regex = /{{(.*?)}}/g;

    var tt = template;
    var match = regex.exec(template);

    while (match != null) {
      tt = tt.replace(match[0], props[match[1]]);
      match = regex.exec(template);
    }

    return tt;
  }


  /**
   * fillTemplateWithRisk - extract risk from bili and return tempalte
   *
   * @param  {element} template
   * @param  {object} bili     object
   * @return {string}          description
   */
  function fillTemplateWithRisk(template, bili) {
    return fillTemplate(template, {
      'TIME': bili.getTimeAbbreviation(),
      'LEVEL': bili.level,
      'HOURS': bili.hours,
      'METHOD': bili.method,
      'RISKZONECLASS': bili.getRiskZone() || 'Undefined',
      'PHOTOZONECLASS': bili.getTreatmentZonePhoto() || '',
      'TRANSFUSIONZONECLASS': bili.getTreatmentZoneTransfusion() || '',
      'ISYOUNG': bili
        .infant
        .isYoung()
          ? 'Yes'
          : 'No',
      'ISTOOYOUNG': bili
        .infant
        .isTooYoung()
          ? 'Yes'
          : 'No',
    });
  }

  return {
    renderChart: function(infant, container, disableTooltip) {
      chart.render(infant, container || 'container', !disableTooltip, function(bili) {
        return fillTemplateWithRisk('#tooltipTemplate', bili);
      });
    },

    renderTable: function(infant, tableSelector) {
      if (!this._tableRendered) {
        tableSelector = tableSelector
          ? (tableSelector + ' tbody')
          : '#resultsTable table tbody';
        var table = $(tableSelector);
        var template = '#resultTableRowTemplate';

        var bilis = infant.getBilis(-1);

        // alert("Adding rows to table");
        for (var i = 0; i < bilis.length; i++) {
          var bili = bilis[i];

          var row = fillTemplateWithRisk(template, bili);

          table.append($(row));
        }
        this._tableRendered = true;
      }
    },

    renderErrors: function(errors, selector) {
      selector = selector || '#errors';
      // alert("In rendorErrors: " + selector);
      if (errors) {
        for (var i = 0; i < errors.length; i++) {
          $(selector).append(fillTemplate('#' + errors[i].message, errors[i].context));
        }
        $(selector).show();
      }
    },

    renderWarnings: function(warnings, selector) {
      selector = selector || '#warnings';
      // alert("In renderWarnings: " + selector);

      $(selector).empty();

      if (warnings) {
        for (var i = 0; i < warnings.length; i++) {
          $(selector).append('<div>' + fillTemplate('#' + warnings[i].message, warnings[i].context) + '</div>');
        }
        $('#warnings').show();
      }
    },

    renderInfo: function(infant) {},
  };
});

/**
 * Use canvg library to create an image from a canvas SVG
 */
define('biligram/copy',[
  'jquery', 'canvg',
], function($, canvg) {
  /**
  * getSvgml -  getting the "html" from the SVG is tricky in IE
  * you can't just get it. so we get the parent of it
  * and change replace all the svg attributes
  * its a hack, but it works and its not too hard.
  * @param  {type} svg description
  * @return {string}  svg content
  */
  function getSvgml(svg) {
    var s = svg[0].parentNode.innerHTML;
    var svghtml = '<svg></svg>';

    if (s) {
      svghtml = s.replace(/<svg.*?>/g, '<svg>');
      svghtml = svghtml.substring(0, svghtml.indexOf('</svg>')) + '</svg>';
    }

    return svghtml;
  }

  return {
    /**
     * makeImage - Convert an SVG to a PNG
     *
     * @param  {type} svgSelector jquery selector for the SVG content
     * @param  {type} destination jqeury selector for placing the new PNG image tag
     */
    makeImage: function(svgSelector, destination) {
      var svg = $(svgSelector);
      var svgml = getSvgml(svg);
      var width = svg.width();
      var height = svg.height();

      var canvas = document.createElement('canvas');
      canvas.height = height;
      canvas.width = width;
      canvg(canvas, svgml, {
        ignoreMouse: true,
        ignoreAnimation: true,
      });

      var png = canvas.toDataURL('image/png');
      $(destination).append($('<img>', {
        height: height,
        width: width,
        src: png,
      }));
    },
  };
});

define('biligram/controller',[
  'jquery',
  'biligram/parse',
  'biligram/ui',
  'biligram/copy',
  'bootstrap',
], function($, parser, ui, copy) {
  /**
     * renderErrors -the parser has failed to create an infant
     *
     * @param  {array} errors error messages
     */
  function renderErrors(errors) {
    ui.renderErrors(errors, '#errors');
    $('body > :not(#errors)').hide(); // hide all nodes directly under the body
    $('#errors')
      .appendTo('body')
      .show();
    $('.navbar').show();
  }

  /**
     * renderData - render the ui including the table and the graph
     *
     * @param  {object} infant valid infant with no errors
     */
  function renderData(infant) {
    var count = infant.getBiliCount();
    ui.renderWarnings(infant.hasWarnings());

    if (count) {
      // show the table only if it would have content (eg there is at least one bili for the infant)

      // alert("About to render the table");
      ui.renderTable(infant);

      $('.riskFactorHover').popover({
          position: 'bottom center',
          title: '<div style="font-weight:bold;padding:3px;">Risk factors for severe hyperbilirubinemia to be considered for follow-up plan</div>',
          content: $('#followUpRiskFactors').html(),
          html: true,
          container: 'body',
          trigger: 'focus'});

      // setup risk factor toggler for recommendation
      $('[name=recommendation]').click(function() {
        $('.riskFactorsYes').toggle($(this).val() == 'riskFactorsYes');
        $('.riskFactorsNo').toggle($(this).val() != 'riskFactorsYes');
      });
      $('#recommendWithoutRisk').click();

      $('#resultsTable table').show();
    }
    if ($('[data-bili-mini]')[0]) {
      // if this is a "mini" then don't show the chart and don't show the row-expander for the table
      $('#chart').hide();
      $('#resultsTable tfoot').hide();
      $('.fullVersionOnly').hide();
      $('.miniVersionOnly').show();
    } else {
      ui.renderInfo(infant);
      ui.renderChart(infant);
      setupTableTogglers(count);
      setupCopyPaste(infant);
      $('.fullVersionOnly').show();
      $('.miniVersionOnly').hide();
    }
  }

  /**
     * setupTableTogglers - setup the table so it only shows the first row
     * and gives a button to pull down the additional
     * results or push back up to just the last result
     *
     * @param  {type} count description
     */
  function setupTableTogglers(count) {
    if (count > 1) {
      // initialize so we only show the first
      // row if there is more than one row
      showFirstRow();
    }

    // wire up the showAll button
    $('#showAll').click(function() {
      $('#resultsTable tbody tr').show();
      $(this).hide();
      $('#showFirst').show();
    });

    // wire up the showFirst button
    $('#showFirst').click(function() {
      showFirstRow();
    });

    /**
         * showFirstRow - hide all rows but the first one
         * and show the "showAll" button
         * and hide the "showFirst" button
         *
         */
    function showFirstRow() {
      $('#resultsTable tbody tr').hide();
      $('#resultsTable tbody tr:first').show();
      $('#showAll').show();
      $('#showFirst').hide();
    }
  }

  /**
     * setupCopyPaste - setup right clicking on the chart popping
     * up a message to instruct them to right-click
     * on the image that will appear,
     *
     * create the image
     *
     * hide the original content of the page and
     * replace with just the image
     *
     * @param  {type} infant description
     */
  function setupCopyPaste(infant) {
    $('#container').contextmenu(function(e) {
      // show the warning message
      $('#readyToCopy').show();
      // re-render the chart, disabling any tooltips, since those
      // don't print correctly in the image
      ui.renderChart(infant, 'container', false);

      // give it a little time for the user to
      // see the "readyToCopy" message
      setTimeout(function() {
        // make the png
        copy.makeImage('#container svg', '#copiedImage');

        var html = $('body').html(); // cache the raw body
        // hide the body, then replace it with the png div only
        // then delete all other body content so
        // the right click copy works well in Epic
        $('body').fadeOut(100);
        $('body').html($('#copiedImage'));

        // attach handle to the copied image to put
        // everything "back" when the copy has completed
        $('#copiedImage').contextmenu(function(e) {
          setTimeout(function() {
            $('body').html(html);
            renderData(infant);
          }, 6000);
        });

        $('body').fadeIn(400);
      }, 1200);

      e.preventDefault();
      e.stopPropagation();
    });
  }


  /**
   * updateMenuItems - additional items can be added to the menu by including
   * hyperlinks with a class of menuItem in your ETX. you can configure when
   * they are visible using miniVersionOnly and fullVersionOnly
   */
  function updateMenuItems() {
      $('.menuItem').wrap('<li></li>').parent().prependTo('#menuLinks');
  }

  return {
    start: function() {
      updateMenuItems();

      // asynchronously create the new infant
      var infant = parser.newInfant(renderData, renderErrors);
      setupCopyPaste(infant);
    },
  };
});

// a more typical RequireJS main config
(function() {
  require.config({
    'paths': {
      'jquery': '../lib/jquery-2.2.4.min',
      'bootstrap': '../lib/bootstrap.min',
      'highcharts-core': '../lib/highcharts',
      'highcharts-more': '../lib/highcharts-more',
      'highstock': '../lib/highstock',
      'canvg': '../lib/canvg',
      'StackBlur': '../lib/StackBlur',
      'rgbcolor': '../lib/rgbcolor',
    },
    'shim': {
      'canvg': {
        'exports': 'canvg',
        'deps': ['StackBlur', 'rgbcolor'],
      },
      'highcharts-core': {
        'exports': 'Highcharts',
        'deps': ['jquery'],
      },
      'highcharts-more': {
        'deps': ['highcharts-core'],
        'exports': 'Highcharts',
      },
      'highstock': {
        'exports': 'StockChart',
        'deps': ['jquery', 'highcharts-core'],
      },
      'bootstrap': {
        'deps': ['jquery'],
        'exports': '$.fn.tooltip',
      },
    },
  });

  loadCSS(['../lib/bootstrap.min.css', '../lib/bootstrap-theme.min.css', '../css/biligram.css']);

  var bust = '';
  // debug code that could be excluded from PRD
  if (document.querySelector('[data-bili-debug]')) {
    bust = 'bust=' + (
    new Date()).getTime();
    require.config({urlArgs: bust});
  }
  // end debug code

  const biligramHTML = '../html/biligram.html';

  // load the iframe content (which will pass back its HTML)
  var iframe = document.createElement('iframe');
  iframe.src = require.toUrl(biligramHTML + bust);
  iframe.style.display = 'none';
  document
    .body
    .appendChild(iframe);

  // when the iframe is loaded it posts its content
  // to the main page, which is our indication
  // to get started
  window.addEventListener('message', function(e) {
    var div = document.createElement('div');
    div.innerHTML = e.data;
    document.getElementById('biligram')
      .parentNode
      .appendChild(div);

    // startup!
    require(['biligram/controller'], function(controller) {
      controller.start();
    });
  });

  /**
   * loadCSS - add link element to page to load css
   * @param  {array} css array of string file names to load
   */
  function loadCSS(css) {
    // add a link element to load the specified css files
    css.forEach(function(url) {
      require(['require'], function(require) {
        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = require.toUrl(url) + '?' + bust;
        document
          .getElementsByTagName('head')[0]
          .appendChild(link);
      });
    });
  }
})();

define("startup", function(){});

