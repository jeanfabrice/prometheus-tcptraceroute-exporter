const debugMod    = require( 'debug' );
const program     = require( 'commander' );
const packagejson = require( './package.json' );
const server      = require( 'express' )();
const Traceroute  = require( './traceroute' );
const promclient  = require( 'prom-client' );

const EXPORTER_MINIMUM_FREQUENCY = 10000;
const EXPORTER_PORT              = 9781;

// eslint-disable-next-line camelcase
let traceroute_rtt_duration_seconds = new promclient.Gauge({
  name: 'traceroute_rtt_duration_seconds',
  help: 'Round Trip Time for a traceroute hop, labeled by hop network information details',
  labelNames: [
    'destination_ip',
    'destination_name',
    'destination_port',
    'full_route',
    'hop_fqdn',
    'hop_ip',
    'hop_number',
    'source_ip'
  ]
} );

// eslint-disable-next-line camelcase
let traceroute_route_duration_seconds = new promclient.Gauge( {
  name: 'traceroute_route_duration_seconds',
  help: 'Full route timing for a traceroute, labeled by several route information details',
  labelNames: [
    'destination_ip',
    'destination_name',
    'destination_port',
    'full_route',
    'hop_count',
    'source_ip'
  ]
} );

program.
  name( 'prometheus-tcptraceroute-exporter' ).
  version( packagejson.version ).
  description( 'Continuous tcp traceroute to destination/port on a regular time based frequency.\nfrequency = TRACEROUTE_MAX x TRACEROUTE_WAITTIME. Defaults to 30s.\nMin frequency: 10s').
  requiredOption( '-t, --target <value>', 'target (ip or resolvable name) to tcp-traceroute to (envvar: TRACEROUTE_TARGET)', process.env.TRACEROUTE_TARGET ).
  option( '-p, --port <number>', 'TCP port on the target to traceroute to (envvar: TRACEROUTE_PORT)', process.env.TRACEROUTE_PORT || 443, parseInt ).
  option( '-f, --first <number>', 'first hops to hide (envvar: TRACEROUTE_FIRST)', process.env.TRACEROUTE_FIRST || 1,  parseInt ).
  option( '-m, --max <number>', 'max count of hops (envvar: TRACEROUTE_MAX)', process.env.TRACEROUTE_MAX || 30, parseInt ).
  option( '-n, --nolookup', 'Don\'t lookup name from hop ip (envvar: TRACEROUTE_NOLOOKUP)', process.env.TRACEROUTE_NOLOOKUP || false ).
  option( '-w, --wait-time <number>', 'Set the timeout, in seconds, to wait for a response for each probe (envvar: TRACEROUTE_WAITTIME)', process.env.TRACEROUTE_WAITTIME || 1, parseInt ).
  option( '-d, --debug', 'output extra debugging' );
program.parse( process.argv );


debugMod.enable( program.debug ? 'app:*,traceroute' : 'traceroute' );
const debug = debugMod( 'app:main' );
const log   = debugMod( 'traceroute' )
const frequency = program.waitTime * program.max < 10 ? EXPORTER_MINIMUM_FREQUENCY : program.waitTime * program.max * 1000;

function collect() {
  const traceroute = new Traceroute();
  const metrics    = { hop: [] }

  traceroute.
  on( 'pid', ( pid ) => {
    debug( 'pid: %s', pid );
  }).
  on( 'destination', ( destination ) => {
    debug( 'destination: %o', destination );
    metrics.destination_ip   = destination.ip;
    metrics.destination_name = destination.address;
    metrics.destination_port = destination.port;
  }).
  on( 'source', ( source ) => {
    debug( 'source: %o', source );
    metrics.source_ip = source.ip;
  }).
  on( 'hop', ( hop ) => {
    debug( 'hop: %o', hop );
    metrics.hop.push( {
      hop_number : hop.hop,
      hop_fqdn   : hop.fqdn,
      hop_ip     : hop.ip,
      rtt        : parseFloat( hop.rtt ) / 1000
    } );
  }).
  on( 'garbage', ( data ) => {
    log( 'Received garbage data, please check for any error: %s', data );
  }).
  on( 'close', ( code ) => {
    debug( 'close: %o', code );
    if( code ) {
      log( 'Traceroute terminated abnormally with error code: %i', code )
    }
    else {
      promclient.register.resetMetrics();
      metrics.hop.forEach( ( element ) => {
        traceroute_rtt_duration_seconds.set(
          {
            destination_ip   : metrics.destination_ip,
            destination_name : metrics.destination_name,
            destination_port : metrics.destination_port,
            hop_number       : element.hop_number,
            hop_fqdn         : element.hop_fqdn,
            hop_ip           : element.hop_ip,
            source_ip        : metrics.source_ip,
            full_route       : metrics.hop.map(( hop ) => {
              return hop.hop_ip || '*';
            }).join( '_' )
          },
          element.rtt || 0
        )
      } );
      traceroute_route_duration_seconds.set(
        {
          destination_ip   : metrics.destination_ip,
          destination_name : metrics.destination_name,
          destination_port : metrics.destination_port,
          hop_count        : metrics.hop.length,
          source_ip        : metrics.source_ip,
          full_route       : metrics.hop.map(( hop ) => {
            return hop.hop_ip || '*';
          }).join( '_' )
        },
        metrics.hop.reduce( ( total, hop ) => {
          return total + ( hop.rtt || 0 );
        }, 0)
      );
    }
  });

  traceroute.trace(
    program.target,
    program.port,
    [ '-f', program.first, '-m', program.max ].concat( program.nolookup ? [ '-n' ] : [] )
  );

}

setInterval( collect, frequency );

server.get( '/metrics', ( req, res ) => {
  res.set( 'Content-Type', promclient.register.contentType );
  res.end( promclient.register.metrics() );
} );

log( 'Exporter listening on port %s, metrics exposed on /metrics endpoint', EXPORTER_PORT );
log( 'Tracing TCP route to %s:%s every %i seconds', program.target, program.port, frequency / 1000 );
server.listen( EXPORTER_PORT );
