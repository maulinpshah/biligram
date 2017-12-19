define([
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

      $('.riskFactorHover').tooltip({position: 'bottom center', opacity: 0.95, tip: '#followUpRiskFactors'});

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

  return {
    start: function() {
      // asynchronously create the new infant
      var infant = parser.newInfant(renderData, renderErrors);
      setupCopyPaste(infant);
    },
  };
});
