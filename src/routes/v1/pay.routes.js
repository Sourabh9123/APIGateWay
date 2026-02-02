import { PaymentClient } from "../../client/index.js";

const paymentClient = new PaymentClient();

export async function paymentRoutes(req, pathSegments) {
    const method = req.method;
    const id = pathSegments[2]; // /payment/:id

    if (method === "GET" && id) {
        const tx = await paymentClient.getTransaction(id);
        return Response.json(tx);
    }

    if (method === "POST" && !id) {
        const body = await req.json();
        const result = await paymentClient.processPayment(body);
        return Response.json(result, { status: 201 });
    }

    return new Response("Not Found", { status: 404 });
}
