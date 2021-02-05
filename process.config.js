module.exports = {
    apps: [
        {
            name: "Api Server",
            script: "./server/apiServer.js",
            watch: true,
            ignore_watch: ["./public/upload"],
            watch_options: {
                "followSymlinks": false
            },
        },
        {
            name: "Auth Server",
            script: "./server/authServer.js",
            watch: true,
            ignore_watch: ["./public/upload"],
            watch_options: {
                "followSymlinks": false
            },
        },
        {
            name: "Gateway",
            script: "./gateway.js",
            watch: true,
            ignore_watch: ["./public/upload"],
            watch_options: {
                "followSymlinks": false
            },
        },
        {
            name: "Frontend Server",
            script: "./server/frontendServer.js",
            watch: true,
            ignore_watch: ["./public/upload"],
            watch_options: {
                "followSymlinks": false
            },
        },
        {
            name: "Security Server",
            script: "./server/securityServer.js",
            watch: true,
            ignore_watch: ["./public/upload"],
            watch_options: {
                "followSymlinks": false
            },
        },
        {
            name: "Image Server",
            script: "./server/imageServer.js",
            watch: true,
            ignore_watch: ["./public/upload"],
            watch_options: {
                "followSymlinks": false
            }
        }
    ]
};