self.__BUILD_MANIFEST = {
  "polyfillFiles": [
    "static/chunks/polyfills.js"
  ],
  "devFiles": [
    "static/chunks/react-refresh.js"
  ],
  "ampDevFiles": [],
  "lowPriorityFiles": [],
  "rootMainFiles": [],
  "rootMainFilesTree": {},
  "pages": {
    "/": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/index.js"
    ],
    "/_app": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_app.js"
    ],
    "/_error": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_error.js"
    ],
    "/quiz/english-korean": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/quiz/english-korean.js"
    ],
    "/quiz/korean-english": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/quiz/korean-english.js"
    ],
    "/quiz/results": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/quiz/results.js"
    ]
  },
  "ampFirstPages": []
};
self.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];