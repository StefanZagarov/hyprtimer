// Use CommonJS format for ESLint 9 flat config
const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script", // CommonJS, not modules
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        Audio: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        // Node/Electron globals
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
      },
    },
    rules: {
      // Error on unused variables (helps keep code clean)
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      // Warn when you forget to await an async function
      "require-await": "warn",

      // Catch common async/await mistakes
      "no-async-promise-executor": "error",
      "no-promise-executor-return": "warn",

      // Require error handling in promises
      "prefer-promise-reject-errors": "warn",

      // Warn about console.log (you can remove this if you like using console)
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
    ignores: [
      "node_modules/**",
      "dist/**",
      "out/**",
      ".webpack/**",
      "forge.config.js",
    ],
  },
];
