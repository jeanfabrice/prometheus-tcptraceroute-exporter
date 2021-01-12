/* eslint-disable class-methods-use-this */
const debug       = require( 'debug' )( 'app:Process' );
const events      = require( 'events' );
const mergeStream = require( 'merge-stream' );
const readline    = require( 'readline' );
const {spawn}     = require( 'child_process' );
const validator   = require( 'validator' );

class Process extends events.EventEmitter {
  constructor( command, args ) {
    super();
    debug( 'Constructor args: %s', args );
    this.args    = args;
    this.command = command;
  }

  trace( domainName, port, args ) {
    if ( !Process.isValidDomainNameAndPort( domainName ) ) {
      throw new Error( 'Invalid domain name or IP address' );
    }
    if ( !Process.isValidPort( port ) ) {
      throw new Error( 'Invalid port number' );
    }

    debug( 'User args: %s', args );
    this.args = this.args.concat( args );
    this.args.push( domainName, port );
    debug( 'Process command: %s', this.command );
    debug( 'Process args list: %s', this.args );
    const process = spawn( this.command, this.args );
    const mergedStdoutStderr = mergeStream( process.stderr, process.stdout );

    process.on( 'close', ( code ) => {
      this.emit( 'close', code );
    } );

    this.emit( 'pid', process.pid );

    let isSourceCaptured      = false;
    let isDestinationCaptured = false;

    if ( process.pid ) {
      readline.createInterface({
        input: mergedStdoutStderr,
        terminal: false
      }).
      on( 'line', ( line ) => {

        debug( 'Traceroute received line: %s', line );

        if ( !isSourceCaptured ) {
          const source = this.parseSource( line );
          if ( source !== null ) {
            this.emit( 'source', source );
            isSourceCaptured = true;
          }
        }

        if ( !isDestinationCaptured ) {
          const destination = this.parseDestination( line );
          if ( destination !== null ) {
            this.emit( 'destination', destination );
            isDestinationCaptured = true;
          }
        }

        const hop = this.parseHop( line );
        if ( hop !== null ) {
          this.emit( 'hop', hop );
        }
        else if( !isSourceCaptured && !isDestinationCaptured ) {
          this.emit( 'garbage', line );
        }
      });
    }
  }

  static isValidDomainNameAndPort( domainName ) {
    return validator.isFQDN( String( domainName )) || validator.isIP( String( domainName ));
  }

  static isValidPort( port ) {
    return validator.isPort( String( port ));
  }

  parseSource( data ) {
    return data;
  }

  parseDestination( data ) {
    return data;
  }

  parseHop( data ) {
    return data;
  }

}

module.exports = Process;
