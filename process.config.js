module.exports = {
    apps: [
        {
            name: "Api Server",
            script: "./server/apiServer.js",
            watch: true,
            ignore_watch: ["./public/upload"],
        },
        {
            name: "Auth Server",
            script: "./server/authServer.js",
            watch: true,
            ignore_watch: ["./public/upload"],
        },
        {
            name: "Gateway",
            script: "./gateway.js",
            watch: true,
            ignore_watch: ["./public/upload"],
        },
        {
            name: "Frontend Server",
            script: "./server/frontendServer.js",
            watch: true,
            ignore_watch: ["./public/upload"],
        },
        {
            name: "Security Server",
            script: "./server/securityServer.js",
            watch: true,
            ignore_watch: ["./public/upload"],
        },
        {
            name: "Image Server",
            script: "./server/imageServer.js",
            watch: true,
            ignore_watch: ["./public/upload"],
        }
    ]
};