import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    ...compat.extends("eslint:recommended"),
    prettierConfig, // Disables ESLint rules that might conflict with Prettier
    {
        plugins: {
            prettier: prettierPlugin,
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node, // Add Node.js globals
            },

            ecmaVersion: "latest",
            sourceType: "module",
        },

        rules: {
            // Prettier integration
            "prettier/prettier": "error",

            // Code Quality Rules (Enforcing Development Rules)
            "no-var": "error", // Forbid var, use let/const
            "prefer-const": "error", // Use const if variable is not reassigned
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }], // Warn on unused vars
            "no-console": ["warn", { allow: ["warn", "error", "info", "group", "groupEnd", "log"] }], // Allow console.log for now, but warn

            // Stylistic rules are handled by Prettier, but we can add some logical ones
            eqeqeq: ["error", "always"], // Enforce strict equality (===)
            curly: ["error", "all"], // Enforce curly braces for control statements
        },
        ignores: ["dist/", "node_modules/", "public/"],
    },
];
