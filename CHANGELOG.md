# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.2] - 2020-02-28

### Fixed

- Fix metrics explosion due to label changing for each route

## [1.0.1] - 2020-02-07

### Changed

- Adapt traceroute frequency to ( TRACEROUTE_MAX * TCPTRACEROUTE_WAITTIME ) seconds.

  Eg.: if TRACEROUTE_MAX is set to 24, and TCPTRACEROUTE_WAITTIME is set to 0.5,
  traceroute will occurs every (24 * 0,5) = 12 seconds.
  Minimum frequency: 10 seconds

### Added

- Support for '-n' argument (TRACEROUTE_NOLOOKUP envvars) to avoid reverse lookup of hop ip address. Default : false (i.e lookup names)

### Fixed

- Fix typo in online help: TRACEROUTE_PORT was incorrectly spelled TRACEROUTE_TARGET

## [1.0.0] - 2020-01-31

### Added

- Initial release
