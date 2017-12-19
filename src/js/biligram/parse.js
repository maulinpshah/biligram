define(['jquery','biligram/infant'],function($,Infant) {
    const elements = {
        BILIS:{"Serum":"#biliSerum","POC":"#biliPOC","TC":"#biliTCLab"},
        BIRTHDAY:"#birthDay",
        BIRTHTIME:"#birthTime",
        GA:"#birthGA",
        WEIGHT:"#birthWeight",
        PHOTOTHERAPY:"#phototherapy"
    };


    function getPhototherapyTimes() {
        // Given a photoTherapy div (output of an LPG which yields phototherapy flowsheet rows)
        // generate an array of phototherapy start times. Note that there are no end times, but nurses document at least every 4 hours,
        // so we'll try to make a vague line that stretches out to 4 hours
        // Results will come in two rows: columns of timestamps (6/3/2016 1518) followed by a row of methods (bank lights,
        // triple lights, double lights, blanket/pad, overhead, bed â€”Â multiple therapies will be separated by a semicolon

            var data = [];
            var phototherapyOutput = $(elements.PHOTOTHERAPY).val();

            // alert ("Phototherapy div: " + phototherapyOutput);
            $("tr").each(function(index) {
               var cells = $("td", this);
            });
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

    function makeBirthday(rawBirthDay,rawBirthTime) {
       if (!rawBirthTime) {
        return "";
        }

         return Date.parse(rawBirthDay + ' ' + stickAColonInIt(rawBirthTime));

         function stickAColonInIt(time) {
             if (!time) {
                 return "";
             }
            if (time.indexOf(':') >= 0) {
                return time;
            } else {
                var len = time.length;
                if (len == 4) {
                    return time.slice(0,2) + ':' + time.slice(2,4);
                } else {
                    return time.slice(0,1) + ':' + time.slice(1,3);
                }

            }
        }
    }

     function makeWeight(rawWeight) {
         return parseFloat(rawWeight);
    }

     function makeGA(rawGA) {

         var result = rawGA || "";

         var wholePlusFrac = rawGA.split(' ');

        if (wholePlusFrac.length > 1) {
            var frac = wholePlusFrac[1].split('/');
            var whole = parseInt(wholePlusFrac[0]);
            result = whole + (parseInt(frac[0])/parseInt(frac[1]));

        }

        return result;
    }

         //given a component table,return an array of
         //DATUM objects, or add to the data array if provided
    function parseEpicTableResult(element) {
        var data = [];
        $(element + " tr").each(function(index) {
            if (index > 1) {            // Skip the first index since it's the header row
                var cells = $("td", this);

                // alert("Cell text: \n" + this.innerText);
                // If the row doesn't begin with a number, it's a comment, like "Critical results called to RN by Elisia...:
                // and we need to ignore it
                if(this.innerText.match(/^\d/g)) {
                    data.push({
                        time: Date.parse(cells[0].innerText),
                        level: parseFloat(cells[1].innerText), // Parsefloat gets rid of things like asterisks for out of range values
                    });
                }
            }
        });
        return data;
    }

    return {

    newInfant:function(success,failure) {
        var birthday = makeBirthday($(elements.BIRTHDAY).val(), $(elements.BIRTHTIME).val());
        var ga = makeGA($(elements.GA).val());
        var weight = makeWeight($(elements.WEIGHT).val());

        var errors = [];
        if (!$(elements.BIRTHTIME).val()) {
        	errors.push({message:"NoBirthtime"});
        } else if (!birthday) {
            errors.push({message:"NoBirthday"});
        }
        if (!ga) {
            errors.push({message:"NoGA"});
        }
        if (!weight) {
            errors.push({message:"NoWeight"});
        }
        if (errors.length) {
            failure(errors);
        } else {

            var infant = new Infant({
                birthday: birthday,
                weight: weight,
                ga: ga,
                rawGa: $(elements.GA).val()
            });

            for (var component in elements.BILIS) {
                infant.addBilis(component, parseEpicTableResult(elements.BILIS[component]));
            }

            infant.setPhototherapyTimes(getPhototherapyTimes());

            success(infant);

        }

    },
  }
});
