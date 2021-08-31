'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const remixdClient_1 = require("./services/remixdClient");
const gitClient_1 = require("./services/gitClient");
const hardhatClient_1 = require("./services/hardhatClient");
const slitherClient_1 = require("./services/slitherClient");
const websocket_1 = require("./websocket");
const utils = require("./utils");
module.exports = {
    Websocket: websocket_1.default,
    utils,
    services: {
        sharedFolder: remixdClient_1.RemixdClient,
        GitClient: gitClient_1.GitClient,
        HardhatClient: hardhatClient_1.HardhatClient,
        SlitherClient: slitherClient_1.SlitherClient
    }
};
//# sourceMappingURL=index.js.map