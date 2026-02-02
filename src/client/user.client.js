import { BaseClient } from "./base.client.js";
import { UserService } from "../stubs/user_connect.js";

export class UserClient extends BaseClient {
    constructor() {
        super(process.env.SERVICE_ADDR_USER || "http://localhost:3001", UserService);
    }

    async getUser(id) {
        // The promise client methods strictly follow the service definition
        // input: { id: string }
        return this.client.getUser({ id });
    }

    async createUser(data) {
        // input: { name: string, email: string }
        return this.client.createUser(data);
    }
}
