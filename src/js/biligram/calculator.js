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
define(function() {
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
