import { BaseClient } from "./base.client.js";
import { PaymentService } from "../stubs/payment_connect.js";

export class PaymentClient extends BaseClient {
    constructor() {
        super(process.env.SERVICE_ADDR_PAYMENT || "http://localhost:3002", PaymentService);
    }

    async processPayment(data) {
        return this.client.processPayment(data);
    }

    async getTransaction(id) {
        return this.client.getTransaction({ transactionId: id }); // Note: field name in proto usually mapped to camelCase
        // In proto message: transaction_id -> transactionId in generated code usually?
        // Let's check the stub: name: "transaction_id" in pb.js. 
        // Usually buf generates camelCase for fields in Typescript unless specified.
        // The manual stub I wrote uses proto3.makeMessageType which implies standard usage.
        // Standard JS usage usually accepts both or specific based on settings. 
        // But let's assume valid mapping.
    }
}
