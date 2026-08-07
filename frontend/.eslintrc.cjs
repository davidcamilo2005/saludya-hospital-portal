module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: "18.3" } },
  plugins: ["react-refresh"],
  rules: {
    "react/react-in-jsx-scope": "off", // no necesario con el JSX runtime automático (React 18 + Vite)
    "react/prop-types": "off", // proyecto en JavaScript, sin PropTypes por decisión de alcance
    "react-refresh/only-export-components": "warn",
  },
};
