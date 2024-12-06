const { transform_code } = require('./path-to-rust-library.node');

export default function demoRustPlugin() {
  return {
    name: 'demo-rust-plugin',
    transform(code, id) {
      if (id.endsWith('.ts')) {
        return transform_code(code);
      }
      return code;
    },
  };
};