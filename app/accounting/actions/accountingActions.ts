import axiosInstance from "../../../lib/axiosInstance";
import type {
  PaymentDto,
  PaymentTransactionDto,
  AccountingMetricsDto,
  ClientBalanceDto,
  AccountingFilterDto,
  RecordPaymentRequestDto,
} from "../../types/accounting/accounting";

// ================================================================================
// PAYMENT ACTIONS
// ================================================================================

export async function fetchPayments(
  filters?: AccountingFilterDto
): Promise<PaymentDto[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.timePeriod) params.append("timePeriod", filters.timePeriod);
    if (filters?.customStartDate) params.append("customStartDate", filters.customStartDate);
    if (filters?.customEndDate) params.append("customEndDate", filters.customEndDate);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.searchQuery) params.append("searchQuery", filters.searchQuery);

    const response = await axiosInstance.get(`/api/v1/accounting/payments?${params.toString()}`);
    console.log("🔹 Raw Payments API Response:", response.data);
    const payments = response.data?.$values || response.data;
    console.log("✅ Extracted Payments Array:", payments);
    return payments;
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    throw new Error(
      `Failed to fetch payments: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

export async function getPaymentById(id: number): Promise<PaymentDto | null> {
  try {
    const response = await axiosInstance.get(`/api/v1/accounting/payments/${id}`);
    console.log("🔹 Raw Payment Data:", response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error("Error fetching payment:", error);
    throw new Error(
      `Failed to fetch payment: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

export async function recordPayment(
  paymentId: number,
  request: RecordPaymentRequestDto
): Promise<PaymentDto> {
  try {
    const response = await axiosInstance.post(
      `/api/v1/accounting/payments/${paymentId}/record-payment`,
      request
    );
    console.log("✅ Payment Recorded Successfully");
    return response.data;
  } catch (error: any) {
    console.error("Error recording payment:", error);
    throw new Error(
      `Failed to record payment: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

export async function markPaymentAsPaid(
  paymentId: number,
  comment?: string
): Promise<PaymentDto> {
  try {
    const response = await axiosInstance.put(
      `/api/v1/accounting/payments/${paymentId}/mark-paid`,
      { comment }
    );
    console.log("✅ Payment Marked as Paid Successfully");
    return response.data;
  } catch (error: any) {
    console.error("Error marking payment as paid:", error);
    throw new Error(
      `Failed to mark payment as paid: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

export async function cancelPayment(
  paymentId: number,
  reason?: string
): Promise<PaymentDto> {
  try {
    const response = await axiosInstance.put(
      `/api/v1/accounting/payments/${paymentId}/cancel`,
      { reason }
    );
    console.log("✅ Payment Cancelled Successfully");
    return response.data;
  } catch (error: any) {
    console.error("Error cancelling payment:", error);
    throw new Error(
      `Failed to cancel payment: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

// ================================================================================
// METRICS ACTIONS
// ================================================================================

export async function fetchMetrics(
  filters?: AccountingFilterDto
): Promise<AccountingMetricsDto> {
  try {
    const params = new URLSearchParams();
    if (filters?.timePeriod) params.append("timePeriod", filters.timePeriod);
    if (filters?.customStartDate) params.append("customStartDate", filters.customStartDate);
    if (filters?.customEndDate) params.append("customEndDate", filters.customEndDate);

    const response = await axiosInstance.get(`/api/v1/accounting/metrics?${params.toString()}`);
    console.log("✅ Metrics Fetched Successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching metrics:", error);
    throw new Error(
      `Failed to fetch metrics: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

// ================================================================================
// CLIENT BALANCE ACTIONS
// ================================================================================

export async function fetchClientBalances(): Promise<ClientBalanceDto[]> {
  try {
    const response = await axiosInstance.get("/api/v1/accounting/client-balances");
    console.log("🔹 Raw Client Balances API Response:", response.data);
    const balances = response.data?.$values || response.data;
    console.log("✅ Extracted Client Balances Array:", balances);
    return balances;
  } catch (error: any) {
    console.error("Error fetching client balances:", error);
    throw new Error(
      `Failed to fetch client balances: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

export async function getClientCreditBalance(clientId: number): Promise<number> {
  try {
    const response = await axiosInstance.get(`/api/v1/accounting/clients/${clientId}/credit-balance`);
    console.log("✅ Client Credit Balance Fetched:", response.data);
    return response.data.creditBalance;
  } catch (error: any) {
    console.error("Error fetching client credit balance:", error);
    throw new Error(
      `Failed to fetch client credit balance: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}
