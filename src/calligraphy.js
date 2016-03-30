
/**
 * Calligraphy editor.
 * @author Gerhard Gruber
 * @version 0.1.0
 */

window.CG = {


  /**
   * log - Prints out a log message
   *
   * @param  {string} msg The log message which should be printed.
   */
  log: function( msg ) {
    if ( console && console.log )
    {
      console.log( msg );
    }
  },

  /**
   * debug - Prints out a debug message using @see CG.log.
   *
   * @param  {string} msg The debug message, which should be printed.
   */
  debug: function( msg ) {
    CG.log( "[DEBUG] " + msg );
  },

  /**
   * info - Prints out an info message using @see CG.log.
   *
   * @param  {string} msg The info message, which should be printed.
   */
  info: function( msg ) {
    CG.log( "[INFO] " + msg );
  },

  /**
   * debug - Prints out a warning message using @see CG.log.
   *
   * @param  {string} msg The warning message, which should be printed.
   */
  warning: function( msg ) {
    CG.log( "[WARNING] " + msg );
  },

  /**
   * debug - Prints out an error message using @see CG.log.
   *
   * @param  {string} msg The error message, which should be printed.
   */
  error: function( msg ) {
    CG.log( "[ERROR] " + msg );
  }
};


/**
 * Calligraphy - Creates a new calligraphy editor object
 *
 * @constructor
 * @this Calligraphy
 * @param  {string} id The id of an element which should be used to render the editor to.
 */
window.Calligraphy = function( id ) {
  var self = this;

  CG.info( "Initializing calligraphy editor for id " + id );

  this.editorObject = $( "#" + id );

  this.canvas = Raphael( this.editorObject );

  /* Initialize toolbar */
  this.initToolbar( );

  /* Initialize paper (writable area) */
  this.initPaper( );

  this.editorObject.keypress( function( e ) {
    e.stopPropagation( );
    e.preventDefault( );

    CG.debug( "keypress: " + e.key );

    if ( self.currentLine == null )
    {
      CG.warning( "No current line!" );
      return;
    }

    if ( e.key == "Backspace" )
    {
      self.currentLine.beforeCursor.pop( );
    }
    else if ( e.key == "ArrowLeft" )
    {
      var c = self.currentLine.beforeCursor.pop( );
      if ( c )
      {
        self.currentLine.afterCursor.unshift( c );
      }
    }
    else if ( e.key == "ArrowRight" )
    {
      var c = self.currentLine.afterCursor.shift( );
      if ( c )
      {
        self.currentLine.beforeCursor.push( c );
      }
    }
    else if ( e.key == "ArrowUp" )
    {
      var line_index = self.lines.indexOf( self.currentLine );
      if ( line_index > 0 )
      {
        line_index --;
        self.selectLine( self.lines[ line_index ] );
        self.setCursor( self.currentLine );
      }
    }
    else if ( e.key == "ArrowDown" )
    {
      var line_index = self.lines.indexOf( self.currentLine );
      if ( line_index < self.lines.length - 1 )
      {
        line_index ++;
        self.selectLine( self.lines[ line_index ] );
        self.setCursor( self.currentLine );
      }
    }
    else if ( e.key == "Enter" )
    {
      self.createLine( );
      self.selectLastLine( );
    }
    else
    {
      self.currentLine.beforeCursor.push( e.key );
    }
    self.currentLine.render( );

    self.setCursor( self.currentLine );
  } );
};

window.Calligraphy.prototype = (function( $ ) {
  return {
    lines: [ ],

    currentLine: null,

    cursor: null,

    /**
     * initToolbar - Initializes the editor's toolbar
     *
     * @this {Calligraphy}
     */
    initToolbar: function( )
    {
      CG.debug( "Initializing toolbar" );
      /* TODO */
    },


    /**
     * initPaper - Initializes the "paper" of the editor.
     *
     * @this {Calligraphy}
     */
    initPaper: function( )
    {
      var self = this;

      CG.debug( "Initializing paper" );
      this.paper = this.canvas.rect( 0, this.toolbarHeight, '100%', '100%' );
      this.paper.attr( {
        "stroke": "#000",
        "cursor": "text",
        "fill": "#fff"
      } );

      this.paper.click( function( ) {
        CG.debug( "Clicked paper" );

        self.editorObject.focus( );
        self.selectLastLine( );
      } );

      setInterval( function( ) {
        if ( self.cursor != null )
        {
          if ( self.cursor.attr( "opacity" ) == 0 )
          {
            self.cursor.attr( "opacity", 1 );
          }
          else
          {
            self.cursor.attr( "opacity", 0 );
          }
        }
      }, 600 );
    },


    /**
     * selectLastLine - Ensures, that a last line exists (using @see createLine) and selects it using @see selectLine.
     *
     * @this {Calligraphy}
     */
    selectLastLine: function( ) {
      CG.debug( "Selecting last line" );

      var last_line;
      if ( this.lines.length == 0 )
      {
        last_line = this.createLine( );
      }
      else
      {
        last_line = this.lines[ this.lines.length - 1 ];
      }

      this.selectLine( last_line );
    },


    /**
     * createLine - Creates a new line and adds it to the @see this.lines array.
     *
     * @this {Calligraphy}
     * @return {CG.Line}  The newly created line.
     */
    createLine: function( ) {
      var baseline = this.getCurrentLineFeed( );
      if ( this.lines.length > 0 )
      {
        baseline += this.lines[ this.lines.length - 1 ].baseline;
      }

      var line = new CG.Line( this, baseline );

      this.lines.push( line );

      return line;
    },


    /**
     * selectLine - Selects the specified line (and sets the cursor using @see setCursor).
     *
     * @this {Calligraphy}
     * @param  {CG.Line} line The line which should be selected
     */
    selectLine: function( line ) {
      this.currentLine = line;

      /* Set Cursor to end of line... */
      this.setCursor( line );
    },


    /**
     * setCursor - Sets the cursor to the given line.
     *
     * @this {Calligraphy}
     * @param  {CG.Line} line The line to which the cursor should be set.
     */
    setCursor: function( line )
    {
      var self = this;
      if ( this.cursor != null )
      {
        this.cursor.remove( );
      }
      var x = 0;
      if ( line.beforeCursorText )
      {
        var bbox = line.beforeCursorText.getBBox( );
        x = bbox.x + bbox.width;
      }
      this.cursor = this.canvas.rect( x, line.baseline - this.getCurrentFontSize( ), 2, this.getCurrentFontSize( ) );
      this.cursor.attr( {
        'fill': 'black'
      } );
    },

    /**
     * getCurrentFontSize - Returns the current font size
     *
     * @this {Calligraphy}
     * @return {number}  The currnet font size in points.
     */
    getCurrentFontSize: function( )
    {
      return 10;
    },

    /**
     * getCurrentLineFeed - Returns the current line feed
     *
     * @this {Calligraphy}
     * @return {number}  The currnet line feed in points.
     */
    getCurrentLineFeed: function( )
    {
      return 12;
    }
  };
}( jQuery ) );
