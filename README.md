# Prometheus tcptraceroute exporter

Prometheus exporter for tcp traceroute.

Exposes the following metrics:

* traceroute_rtt_duration_seconds: Round Trip Time for a traceroute hop, labeled by hop network information details
* traceroute_route_duration_seconds: Full route timing for a traceroute, labeled by several route information details

## configuration

Configuration can be made either by command-line arguments or by environment variables. See embedded help for corresponding variable names.

## usage

```bash
$ npm install
audited 5636 packages in 2.951s

5 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

$ npm start -- --help
Usage: index [options]

Options:
  -V, --version          output the version number
  -t, --target <value>   target (ip or resolvable name) to traceroute to (envvar: TRACEROUTE_TARGET)
  -p, --port <number>    TCP port on the target to traceroute to (envvar: TRACEROUTE_TARGET) (default: 443)
  -f, --first <number>   first hops to hide (envvar: TRACEROUTE_FIRST) (default: 1)
  -m, --max <number>     max count of hops (envvar: TRACEROUTE_MAX) (default: 30)
  -d, --debug            output extra debugging
  -h, --help             output usage information

$ npm start -- -t github.com 443
  traceroute Exporter listening on port 9781, metrics exposed on /metrics endpoint +0ms
  traceroute Tracing TCP route to github.com:443 +1ms

$ TRACEROUTE_TARGET=github.com npm start
  traceroute Exporter listening on port 9781, metrics exposed on /metrics endpoint +0ms
  traceroute Tracing TCP route to github.com:443 +1ms
```

## Docker Usage

### build

Build your container using the contrib-provided `Dockerfile`:

```bash
docker build -f contrib/Dockerfile -t prometheus-tcptraceroute-exporter .
```

### run

Start a prometheus-tcptraceroute-exporter container:

```bash
docker run -p 9781:9781 -e TRACEROUTE_TARGET=github.com prometheus-tcptraceroute-exporter
```

The Prometheus tcptraceroute exporter exposes metrics behind URI /metrics on Prometheus registered port 9781.

## Credits

Portions of this code gets inspired by the Node.js [nodejs-traceroute](https://www.npmjs.com/package/nodejs-traceroute) npm module written by Zulhilmi Mohamed Zainuddin ([@zulhilmizainuddin](https://github.com/zulhilmizainuddin))

## License

MIT
