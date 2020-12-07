const path = require("path");

module.exports = {
    mode: "production",
    entry: ["./popups/index.js"],
    output: {
        filename: "popups.js",
        path: path.resolve(__dirname, './dist')
    },
    target: "web"
}