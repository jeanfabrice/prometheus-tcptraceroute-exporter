const nodeExternals      = require( 'webpack-node-externals' );
const path               = require( 'path' );


module.exports = ( env, argv ) => {

  const config = {};

  config.context = path.resolve( __dirname );

  config.entry = {
    'app': './index.js'
  };

  config.externals = [
    nodeExternals()
  ];

  config.module = {
    'rules': [
      {
        'test'    : /\.js$/,
        'exclude' : '/node_modules/',
        'loader'  : 'eslint-loader'
      }
    ]
  };

  config.node = {
    '__dirname'  : false,
    '__filename' : false
  };

  config.output = {
    'path'     : path.resolve( __dirname, 'build' ),
    'filename' : 'bundle.js'
  };

  config.plugins = [
  ];

  config.target = 'node';

  if( argv.mode == 'production' ) {
    config.mode = 'production';
  }
  else {
    config.mode = 'development';
  }

  return config;

};
