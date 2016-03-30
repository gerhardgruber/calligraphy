window.CG.Line = function( cg, baseline ) {
  CG.debug( "Initializing new line" );

  this.cg = cg;
  this.baseline = baseline;
  this.set = cg.canvas.set( );
};

window.CG.Line.prototype = (function( $ ) {
  return {
    beforeCursor: [],

    afterCursor: [],

    baseline: 0,

    render: function( ) {
      this.set.remove( );
      var before = this.beforeCursor.join( "" );
      var after = this.afterCursor.join( "" );
      var font_size = this.cg.getCurrentFontSize( );
      var text_settings = {
        "text-anchor": "start",
        "font-size": font_size
      };
      this.beforeCursorText = this.cg.canvas.text( 0, font_size * -0.35, before );
      this.beforeCursorText.attr( text_settings );
      var bbox = this.beforeCursorText.getBBox( );
      this.afterCursorText = this.cg.canvas.text( bbox.x + bbox.width, font_size * -0.35, after );
      this.afterCursorText.attr( text_settings );
      this.set.push( this.beforeCursorText );
      this.set.push( this.afterCursorText );
      this.set.translate( 0, this.baseline );
    }
  };
}( jQuery ) );
