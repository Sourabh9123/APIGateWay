import { createGrpcTransport } from "@connectrpc/connect-node";
import { createPromiseClient } from "@connectrpc/connect";

export class BaseClient {
    constructor(baseUrl, serviceDefinition) {
        // For Node/Bun backends, we use createGrpcTransport (HTTP/2)
        // If communicating with web-compatible gRPC-web, modify transport here.
        const transport = createGrpcTransport({
            baseUrl: baseUrl,
            httpVersion: "2", // Force HTTP/2 for gRPC
        });

        this.client = createPromiseClient(serviceDefinition, transport);
    }
}
