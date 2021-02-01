module.exports = {
    apps: [
        {
            name: "Api Server",
            script: "./server/apiServer.js",
            watch: true,
        },
        {
            name: "Auth Server",
            script: "./server/authServer.js",
            watch: true,
        },
        {
            name: "Gateway",
            script: "./gateway.js",
            watch: true,
        },
        {
            name: "Frontend Server",
            script: "./server/frontendServer.js",
            watch: true,
        },
        {
            name: "Security Server",
            script: "./server/securityServer.js",
            watch: true,
        }
    ]
};