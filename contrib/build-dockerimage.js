#!/usr/bin/env node
const { spawnSync } = require( 'child_process' );
const Path          = require( 'path' );
const root          = Path.resolve( __dirname, '..' );
const pjson         = require( Path.resolve( root, 'package.json' ) );

const command = 'docker';

let date = new Date().toISOString();
let args = [
  'build',
  '-f',
  Path.resolve( __dirname, 'Dockerfile' ),
  '--build-arg',
  'AUTHOR=' + pjson.author.name,
  '--build-arg',
  'CREATED=' + date,
  '--build-arg',
  'DESCRIPTION=' + pjson.description,
  '--build-arg',
  'EMAIL=' + pjson.author.email,
  '--build-arg',
  'LICENSES=' + pjson.license,
  '--build-arg',
  'SOURCE=' + pjson.repository,
  '--build-arg',
  'TITLE=' + pjson.name,
  '--build-arg',
  'VERSION=' + pjson.version,
  '-t',
  pjson.name + ':' + pjson.version,
  '.'
]
spawnSync( command, args, {
  'cwd'      : root,
  'encoding' : 'UTF-8',
  'stdio'    : [
    process.stdin,
    process.stdout,
    process.stderr
  ]
});
