import { createGrpcTransport } from "@connectrpc/connect-node";
import { createPromiseClient } from "@connectrpc/connect";

export class BaseClient {
    constructor(baseUrl, serviceDefinition) {
        const transport = createGrpcTransport({
            baseUrl: baseUrl,
            httpVersion: "2",
            interceptors: [
                (next) => async (req) => {
                    // Correlation ID now needs to be passed explicitly or handled via child clients
                    return next(req);
                },
            ],
        });

        this.client = createPromiseClient(serviceDefinition, transport);
    }
}
