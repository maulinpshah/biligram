/**
 * Entry point for biligram
 *
 * The HTML template for this tool is loaded in a silent iframe that posts
 * back the html to the Epic report window.
 *
 * The ETX in Epic uses smartlinks to pull in data and then calls this
 * script which will parse it as needed and render the view.
 *
 * This is built to defensively handle the odd behavior of Epic's report
 * refresh button whic does not behave quite like a regular browser
 */

 var biligram = biligram || function() {
     const startup = 'startup.js';
     const requireLib = '../lib/require.js';

     // we need to use absolute paths because our js is not on the same
     // server as the web server that renders the navigator
     // so extract the absolute path from the script src

     var baseUrl = extractBaseUrl('biligram.js');
     var bust = '';

     if (document.querySelector('[data-bili-debug]')) {
       bust = '?bust=' + (new Date()).getTime();
     }

     // load the loader
     var script = document.createElement('script');
     script.type = 'text/javascript';
     script.async = false;
     script.src = baseUrl + requireLib;
     script.setAttribute('data-main', baseUrl + startup + bust);
     document.getElementsByTagName('head')[0].appendChild(script);


     return function() {
         //ignore epic refresh events
         return biligram;
     };

     /**
      * extractBaseUrl - find the element with the src specified and get the
      * absolute path
      *
      * @param  {string} thisFile file to look for
      * @return {type}          path to the file
      */
     function extractBaseUrl(thisFile) {
         var path = document
             .querySelector('[src*=\'' + thisFile + '\']')
             .getAttribute('src');
         return path.substring(0, path.indexOf(thisFile));
     }
 };

 biligram = biligram();
