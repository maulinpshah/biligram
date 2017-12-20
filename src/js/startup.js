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
    },
    'shim': {
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
