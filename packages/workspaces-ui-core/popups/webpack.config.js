const path = require("path");

module.exports = {
    mode: "development",
    entry: ["./popups/index.js"],
    output: {
        filename: "popups.js",
        path: path.resolve(__dirname, './dist')
    },
    target: "web"
}