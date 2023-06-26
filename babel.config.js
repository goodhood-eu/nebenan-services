module.exports = (api) => {
  // Cache configuration is a required option
  api.cache(false);

  const presets = [
    '@babel/preset-typescript',
    '@babel/preset-env',
  ];

  const plugins = [
    ['add-module-exports', { addDefaultProperty: true }],
    '@babel/plugin-transform-strict-mode',
    '@babel/plugin-transform-runtime'
  ];

  return { presets, plugins };
};
