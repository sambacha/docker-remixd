/// <reference types="node" />
import * as WS from 'ws';
import * as http from 'http';
import { WebsocketOpt, ServiceClient } from './types';
export default class WebSocket {
    port: number;
    opt: WebsocketOpt;
    getclient: () => ServiceClient;
    server: http.Server;
    wsServer: WS.Server;
    constructor(port: number, opt: WebsocketOpt, getclient: () => ServiceClient);
    start(callback?: (ws: WS, client: ServiceClient, error?: Error) => void): void;
    close(): void;
}
