/**
 * Use canvg library to create an image from a canvas SVG
 */
define([
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
