#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const latest_version_1 = require("latest-version");
const semver = require("semver");
const websocket_1 = require("../websocket");
const servicesList = require("../serviceList");
const utils_1 = require("../utils");
const axios_1 = require("axios");
const fs_extra_1 = require("fs-extra");
const path = require("path");
const program = require("commander");
function warnLatestVersion() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const latest = yield latest_version_1.default('@remix-project/remixd');
        const pjson = require('../package.json');
        if (semver.eq(latest, pjson.version)) {
            console.log('\x1b[32m%s\x1b[0m', `[INFO] you are using the latest version ${latest}`);
        }
        else if (semver.gt(latest, pjson.version)) {
            console.log('\x1b[33m%s\x1b[0m', `[WARN] latest version of remixd is ${latest}, you are using ${pjson.version}`);
            console.log('\x1b[33m%s\x1b[0m', '[WARN] please update using the following command:');
            console.log('\x1b[33m%s\x1b[0m', '[WARN] npm install @remix-project/remixd -g');
        }
    });
}
const services = {
    git: (readOnly) => new servicesList.GitClient(readOnly),
    hardhat: (readOnly) => new servicesList.HardhatClient(readOnly),
    slither: (readOnly) => new servicesList.SlitherClient(readOnly),
    folder: (readOnly) => new servicesList.Sharedfolder(readOnly)
};
// Similar object is also defined in websocket.ts
const ports = {
    git: 65521,
    hardhat: 65522,
    slither: 65523,
    folder: 65520
};
const killCallBack = [];
function startService(service, callback) {
    const socket = new websocket_1.default(ports[service], { remixIdeUrl: program.remixIde }, () => services[service](program.readOnly || false));
    socket.start(callback);
    killCallBack.push(socket.close.bind(socket));
}
function errorHandler(error, service) {
    const port = ports[service];
    if (error.code && error.code === 'EADDRINUSE') {
        console.log('\x1b[31m%s\x1b[0m', `[ERR] There is already a client running on port ${port}!`);
    }
    else {
        console.log('\x1b[31m%s\x1b[0m', '[ERR]', error);
    }
}
(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { version } = require('../package.json');
    program.version(version, '-v, --version');
    program
        .usage('-s <shared folder>')
        .description('Provide a two-way connection between the local computer and Remix IDE')
        .option('-u, --remix-ide  <url>', 'URL of remix instance allowed to connect to this web sockect connection')
        .option('-s, --shared-folder <path>', 'Folder to share with Remix IDE')
        .option('-r, --read-only', 'Treat shared folder as read-only (experimental)')
        .on('--help', function () {
        console.log('\nExample:\n\n    remixd -s ./ -u http://localhost:8080');
    }).parse(process.argv);
    // eslint-disable-next-line
    yield warnLatestVersion();
    if (!program.remixIde) {
        console.log('\x1b[33m%s\x1b[0m', '[WARN] You can only connect to remixd from one of the supported origins.');
    }
    else {
        const isValid = yield isValidOrigin(program.remixIde);
        /* Allow unsupported origins and display warning. */
        if (!isValid) {
            console.log('\x1b[33m%s\x1b[0m', '[WARN] You are using IDE from an unsupported origin.');
            console.log('\x1b[33m%s\x1b[0m', 'Check https://gist.github.com/EthereumRemix/091ccc57986452bbb33f57abfb13d173 for list of all supported origins.\n');
            // return
        }
        console.log('\x1b[33m%s\x1b[0m', '[WARN] You may now only use IDE at ' + program.remixIde + ' to connect to that instance');
    }
    if (program.sharedFolder && fs_extra_1.existsSync(utils_1.absolutePath('./', program.sharedFolder))) {
        console.log('\x1b[33m%s\x1b[0m', '[WARN] Any application that runs on your computer can potentially read from and write to all files in the directory.');
        console.log('\x1b[33m%s\x1b[0m', '[WARN] Symbolic links are not forwarded to Remix IDE\n');
        try {
            startService('folder', (ws, sharedFolderClient, error) => {
                if (error) {
                    errorHandler(error, 'hardhat');
                    return false;
                }
                sharedFolderClient.setWebSocket(ws);
                sharedFolderClient.setupNotifications(program.sharedFolder);
                sharedFolderClient.sharedFolder(program.sharedFolder);
            });
            startService('slither', (ws, sharedFolderClient) => {
                sharedFolderClient.setWebSocket(ws);
                sharedFolderClient.sharedFolder(program.sharedFolder);
            });
            // Run hardhat service if a hardhat project is shared as folder
            const hardhatConfigFilePath = utils_1.absolutePath('./', program.sharedFolder) + '/hardhat.config.js';
            const isHardhatProject = fs_extra_1.existsSync(hardhatConfigFilePath);
            if (isHardhatProject) {
                startService('hardhat', (ws, sharedFolderClient, error) => {
                    if (error) {
                        errorHandler(error, 'hardhat');
                        return false;
                    }
                    sharedFolderClient.setWebSocket(ws);
                    sharedFolderClient.sharedFolder(program.sharedFolder);
                });
            }
            /*
            startService('git', (ws: WS, sharedFolderClient: servicesList.Sharedfolder) => {
              sharedFolderClient.setWebSocket(ws)
              sharedFolderClient.sharedFolder(program.sharedFolder)
            })
            */
        }
        catch (error) {
            throw new Error(error);
        }
    }
    else {
        console.log('\x1b[31m%s\x1b[0m', '[ERR] No valid shared folder provided.');
    }
    // kill
    function kill() {
        for (const k in killCallBack) {
            try {
                killCallBack[k]();
            }
            catch (e) {
                console.log(e);
            }
        }
        process.exit(0);
    }
    process.on('SIGINT', kill); // catch ctrl-c
    process.on('SIGTERM', kill); // catch kill
    process.on('exit', kill);
    function isValidOrigin(origin) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!origin)
                return false;
            const domain = utils_1.getDomain(origin);
            const gistUrl = 'https://gist.githubusercontent.com/EthereumRemix/091ccc57986452bbb33f57abfb13d173/raw/3367e019335746b73288e3710af2922d4c8ef5a3/origins.json';
            try {
                const { data } = yield axios_1.default.get(gistUrl);
                try {
                    yield fs_extra_1.writeJSON(path.resolve(path.join(__dirname, '..', 'origins.json')), { data });
                }
                catch (e) {
                    console.error(e);
                }
                return data.includes(origin) ? data.includes(origin) : data.includes(domain);
            }
            catch (e) {
                try {
                    // eslint-disable-next-line
                    const origins = require('../origins.json');
                    const { data } = origins;
                    return data.includes(origin) ? data.includes(origin) : data.includes(domain);
                }
                catch (e) {
                    return false;
                }
            }
        });
    }
}))();
//# sourceMappingURL=remixd.js.map