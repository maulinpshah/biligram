/**
 * encapsulate ALL rendering functions
 * this gives a single entry point for all rendering
 * and makes it easy to swap out various bits and pieces
 *
*/
define([
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
