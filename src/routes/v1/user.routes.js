import { UserClient } from "../../client/index.js";

const userClient = new UserClient();

export async function userRoutes(req, pathSegments) {
    // pathSegments[0] is 'v1', [1] is 'user', [2] is request ID or action
    // Example path: /api/v1/user/123
    // segments passed here might be relative to this router if we strip prefix? 
    // Let's assume we pass the full remaining path or segments.
    // For simplicity, let's just match on URL or method.

    const method = req.method;
    const url = new URL(req.url); // Use full URL for parsing if needed
    const id = pathSegments[2]; // /user/:id

    if (method === "GET" && id) {
        const user = await userClient.getUser(id);
        return Response.json(user);
    }

    if (method === "POST" && !id) {
        const body = await req.json();
        const newUser = await userClient.createUser(body);
        return Response.json(newUser, { status: 201 });
    }

    return new Response("Not Found", { status: 404 });
}
