const buildmap = require("./config")
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackCopyPlugin = require("copy-webpack-plugin");

module.exports = {
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    optimization: {
        minimize: false
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.ts|\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    entry: path.join(__dirname, "src/index.ts"),
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src/index.html')
        }),
        new WebpackCopyPlugin({
            patterns: [
                {
                    from: path.join(__dirname, "assets"),
                    to: buildmap.distFolder
                },
                {
                    from: buildmap.distFolder,
                    to: buildmap.wpProjectsFolder
                }
            ]
        })
    ],
    output: {
        path: buildmap.distFolder,
    }
};