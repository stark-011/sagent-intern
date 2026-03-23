import apiClient from "./apiClient";
import { unwrap } from "./apiHelpers";


export const walletService = {
  async getWalletByUser() {
    const res = await apiClient.get("/wallet");
    return unwrap(res);
  },

  async getTransactionsByUser(_userId, type = "all") {
    const res = await apiClient.get("/wallet/transactions", {
      params: { type },
    });
    return unwrap(res) || [];
  },

  async addCredits(_userId, amount) {
    const res = await apiClient.post("/wallet/top-up", { amount });
    return unwrap(res);
  },

  async withdraw(amount) {
    const res = await apiClient.post("/wallet/withdraw", { amount });
    return unwrap(res);
  },
};
