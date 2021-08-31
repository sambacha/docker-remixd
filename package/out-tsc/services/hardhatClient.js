"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardhatClient = void 0;
const plugin_1 = require("@remixproject/plugin");
const { spawn } = require('child_process');
class HardhatClient extends plugin_1.PluginClient {
    constructor(readOnly = false) {
        super();
        this.readOnly = readOnly;
        this.methods = ['compile'];
    }
    setWebSocket(websocket) {
        this.websocket = websocket;
    }
    sharedFolder(currentSharedFolder) {
        this.currentSharedFolder = currentSharedFolder;
    }
    compile(configPath) {
        return new Promise((resolve, reject) => {
            if (this.readOnly) {
                const errMsg = '[Hardhat Compilation]: Cannot compile in read-only mode';
                return reject(new Error(errMsg));
            }
            const cmd = `npx hardhat compile --config ${configPath}`;
            const options = { cwd: this.currentSharedFolder, shell: true };
            const child = spawn(cmd, options);
            let result = '';
            let error = '';
            child.stdout.on('data', (data) => {
                const msg = `[Hardhat Compilation]: ${data.toString()}`;
                console.log('\x1b[32m%s\x1b[0m', msg);
                result += msg + '\n';
            });
            child.stderr.on('data', (err) => {
                error += `[Hardhat Compilation]: ${err.toString()}`;
            });
            child.on('close', () => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
        });
    }
}
exports.HardhatClient = HardhatClient;
//# sourceMappingURL=hardhatClient.js.map