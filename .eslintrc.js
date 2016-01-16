module.exports = {
  "rules": {
    "indent": [
      2,
      2,
      {
        "SwitchCase": 1
      }
    ],
    "quotes": [
      2,
      "double"
    ],
    "linebreak-style": [
      2,
      "unix"
    ],
    "semi": [
      2,
      "always"
    ]
  },
  "env": {
    "es6": true,
    "browser": true,
    "amd": true,
    "node": true,
    "jasmine": true
  },
  ecmaFeatures: {
    modules: true,
    experimentalObjectRestSpread: true
  },
  "extends": "eslint:recommended"
};