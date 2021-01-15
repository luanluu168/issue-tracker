module.exports = {
    apps: [
        {
            name: "Api Server",
            script: "./Server/apiServer.js",
            watch: true,
        },
        {
            name: "Gateway",
            script: "./gateway.js",
            watch: true,
        }
    ]
};