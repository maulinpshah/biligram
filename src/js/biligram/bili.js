
/**
 *
 * @param method - string of POC, TC, or Serum
 * @param props - data object of {time:Date, level:number} of bilirubin value
 * @param infant - circular reference back to calling infant
 * @constructor
 */
define(['biligram/calculator'], function(calculator) {
   return function(method, props, infant) {

    this.time = new Date(props.time);
    this.level = props.level;
    this.method = method;
    this.infant = infant;
    this.hoursInt = ((this.time - infant.birthday) / 3600000);
    this.hours =  this.hoursInt.toFixed(1);

    var riskZone = calculator.getRiskZone(this,infant);
    var treatmentZone = calculator.getTreatmentZone(this,infant);

    // alert("Checking infant bili @" + this.hours + ': ' + this.level + '>> ' + treatmentZone.phototherapy + ' ' + treatmentZone.transfusion);

    if (treatmentZone.phototherapy) {
        this.infant.treatmentZonePhototherapy = true;
    }
    if (treatmentZone.transfusion) {
        this.infant.treatmentZoneTransfusion = true;
    }
    $.extend(this, {
    getTimeAbbreviation : function() {

        return(1 + this.time.getMonth()) +
            '/' +
                this.time.getDate() +
            ' ' +
            this.time.getHours() +
            ':' +
            ('0' + this.time.getMinutes())
                .slice(-2);

    },

    getRiskZone : function() {
        return riskZone;
    },

    getTreatmentZonePhoto : function() {
        return treatmentZone.phototherapy;
    },

    getTreatmentZoneTransfusion : function() {
        return treatmentZone.transfusion;
    }
  });




}});
