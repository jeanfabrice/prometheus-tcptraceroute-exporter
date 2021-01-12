/* eslint-disable class-methods-use-this */
const debug   = require( 'debug' )( 'app:Traceroute' );
const Process = require( './process' );

class Traceroute extends Process {

  constructor() {
    super( 'tcptraceroute', [ '-q', 1 ] );
  }

  parseSource( data ) {
    const regex = /address\s([0-9.]+), port (\d+)/;
    const parsedData = new RegExp( regex, '' ).exec( data );

    let result = null;

    if ( parsedData !== null ) {
      result = {
        ip   : parsedData[ 1 ],
        port : parsedData[ 2 ]
      }
    }

    debug( 'parseSource input: %o', data );
    debug( 'parseSource parsedData: %o', parsedData );
    debug( 'parseSource result: %o', parsedData );

    return result;
  }

  parseDestination( data ) {
    const regex = /^Tracing\sthe\spath\sto\s([a-zA-Z0-9:.]+)\s\(([a-z0-9:.]+)\) on TCP port (\d+)/;
    const parsedData = new RegExp( regex, 'i' ).exec( data );

    let result = null;

    if ( parsedData !== null ) {
      result = {
        address : parsedData[ 1 ],
        ip      : parsedData[ 2 ],
        port    : parsedData[ 3 ]
      }
    }

    debug( 'parseDestination input: %o', data );
    debug( 'parseDestination parsedData: %o', parsedData );
    debug( 'parseDestination result: %o', parsedData );

    return result;
  }

  parseHop( data ) {
    // 5  172.24.24.254  0.792 ms
    // 5  172.24.24.254 [open]  0.792 ms
    // 5  ae41-0.nilyo202.lyon3earrondissement.francetelecom.net (193.252.101.149)  1.504 ms
    // 5  ae41-0.nilyo202.lyon3earrondissement.francetelecom.net (193.252.101.149) [open]  1.504 ms
    // 5 *
    const regex = /^\s*(\d+)\s+(?:(?:([0-9.]+) | ([a-z0-9.-]+)\s+\(([0-9.]+)\))\s+(?:\[\w+\]\s*)?([0-9.]+)\s+ms|(\*))/;
    const parsedData = new RegExp( regex, 'i' ).exec( data );

    let result = null;

    if ( parsedData !== null ) {
      if ( typeof parsedData[ 2 ] !== 'undefined' ) {
        result = {
          hop  : parseInt( parsedData[ 1 ], 10 ),
          ip   : parsedData[ 2 ],
          rtt  : parsedData[ 5 ]
        };
      }
      else if ( typeof parsedData[ 4 ] !== 'undefined' ) {
        result = {
          fqdn : parsedData[ 3 ],
          hop  : parseInt( parsedData[ 1 ], 10 ),
          ip   : parsedData[ 4 ],
          rtt  : parsedData[ 5 ]
        };
      }
      else {
        result = {
          hop: parseInt( parsedData[ 1 ], 10 )
        };
      }
    }

    debug( 'parseHop input: %o', data );
    debug( 'parseHop parsedData: %o', parsedData );
    debug( 'parseHop result: %o', parsedData );

    return result;
  }
}

module.exports = Traceroute;
