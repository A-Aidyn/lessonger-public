const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        alias: {
            root: path.join(__dirname, './src'),
            '~': path.resolve(__dirname, "./src"),
        }
    }
};