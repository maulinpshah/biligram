//Expects Biligram.Calculator

define (['jquery', 'biligram/bili'], function($, Bili) {

  return function(props/* {
            birthday:Date (date and time of birth)
            ga:number
            weight:number
} */) {

    var bilis = [];
    var phototherapy = [];

    $.extend(this,props, {

    /**
     * Given a set of dates, set the phototherapy time
     * when this patient was under the lights
     *
     * @param data - array of dates when phototherapy documentd
     * @param assumedDurationPerPoint - duration of phototherapy for each point (defaults to 2)
     */
    setPhototherapyTimes : function(data, assumedDurationPerPoint) {

        phototherapy = [];

        for (var i=0;i<data.length;i++) {
            var time = new Date(data[i]);
            var hours = ((time - this.birthday) / 3600000);
            phototherapy.push({
                start:hours,
                end:hours+(assumedDurationPerPoint || 2)
            })

        }


    },
        /**
         * TODO - make this real!
         */
        getPhototherapy : function() {
            return phototherapy;
        },

    /**
     * add an array of bilirubin values to the infant
     * @param method - a string representing how the bili was drawn (POC, TC, or Serum)
     * @param data - and array of objects {level:number,time:Date}
     */
    addBilis : function(method, data) {
        for (var i=0;i<data.length;i++) {
            bilis.push(new Bili(method,data[i],this));
        }
    },

    //get the sorted list of bilis
    getBilis : function(direction) {
        if (!direction) {
            direction = 1;
        }

        bilis.sort(function(a, b) {
            if (a.time < b.time) return -1*direction;
            if (a.time > b.time) return 1*direction;
            return 0;
        });

        return bilis;
    },

    getBiliCount : function() {
        return bilis.length;
    },

    isYoung : function() {
        // return this.ga >= 35 && this.ga < 38;
        return this.ga < 38;
    },

    isTooYoung : function() {
        return this.ga < 35;
    },

    inTreatmentZonePhoto : function() {
        return this.treatmentZonePhototherapy;
    },

    inTreatmentZoneTransfusion : function() {
        return this.treatmentZoneTransfusion;
    },


    hasWarnings : function() {
        var errors = [];

        if (this.ga < 35) {
            // alert("Pushing InvalidAge warning");
            errors.push({message:"InvalidAge", context:{"AGE":this.rawGa}});
        } else if (this.ga < 36) {
            if (this.weight < 2.5) {
                //35-36 weeks must be more than 2.5kg
                errors.push({message:"InvalidWeight35", context:{"AGE":this.rawGa,"WEIGHT":this.weight}});
            }
        } else {
            if (this.weight < 2.5) {
                //36+ weeks, must be at least 2kg
                errors.push({message: "InvalidWeight36", context: {"AGE": this.rawGa, "WEIGHT": this.weight}});
            }
        }
        // alert("Errors: " + errors[errors.length - 1].message);


        if (this.inTreatmentZonePhoto() || this.inTreatmentZoneTransfusion()) {
            // alert("Pushing InRiskZone warning");
            errors.push({message:"InTxZone", context:{"TYPE":this.inTreatmentZoneTransfusion() ? "transfusion" : "phototherapy"}});
        }
        // alert("Errors: " + errors[errors.length - 1].message);

        return errors.length ? errors : false;
    }
});






}});
