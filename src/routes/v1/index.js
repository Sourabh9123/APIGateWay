import { userRoutes } from "./user.routes.js";
import { paymentRoutes } from "./pay.routes.js";

export async function v1Router(req, pathSegments) {
    // pathSegments[0] = 'v1'
    const domain = pathSegments[1];

    switch (domain) {
        case "user":
            return userRoutes(req, pathSegments);
        case "payment":
            return paymentRoutes(req, pathSegments);
        default:
            return new Response("Not Found", { status: 404 });
    }
}
