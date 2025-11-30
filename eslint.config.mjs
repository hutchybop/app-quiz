import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import pluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  // Global ignores
  {
    ignores: [
      "node_modules/",
      "dist/",
      "build/",
      ".git/",
      "**/*.min.js",
      "**/*.ejs", // <-- ignore EJS templates
    ],
  },

  // Base ESLint recommended
  js.configs.recommended,

  // Prettier integration
  pluginPrettierRecommended,
  prettier,

  // Browser (public assets only)
  {
    files: ["public/**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        document: "readonly",
        window: "readonly",
        localStorage: "readonly",
        console: "readonly",
        fetch: "readonly",
        alert: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        io: "readonly", // Socket.IO
        socket: "writable", // Socket.IO client instance
        userData: "writable", // Your app's global variable
        quizCode: "writable", // Your app's global variable
        questions: "writable", // Your app's global variable
        users: "writable", // Your app's global variable
        usersSubmitted: "writable", // Your app's global variable
        isQuizCode: "writable", // Your app's global variable
        joinFunc: "writable", // Your app's global variable
        isDupe: "writable", // Your app's global variable
        isJoin: "writable", // Your app's global variable
        a: "writable", // Your app's global variable
      },
    },
  },

  // Everything ELSE is Node.js
  {
    files: ["**/*.js"],
    ignores: ["public/**/*.js"], // prevent overlap
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        process: "readonly",
        console: "readonly",
      },
    },
  },
];
