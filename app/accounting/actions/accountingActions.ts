import axiosInstance from "../../../lib/axiosInstance";
import {
  Transaction,
  Client,
  AuditEntry,
} from "../../types/accounting/accounting";

// Transaction Actions
export async function fetchTransactions(): Promise<Transaction[]> {
  try {
    const response = await axiosInstance.get("/api/v1/accounting/transactions");
    console.log("🔹 Raw API Response:", response.data);
    const transactions = response.data?.$values || response.data;
    console.log("✅ Extracted Transactions Array:", transactions);
    return transactions;
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    throw new Error(
      `Failed to fetch transactions: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

export async function createTransaction(
  transaction: Omit<Transaction, "id">
): Promise<boolean> {
  try {
    const response = await axiosInstance.post(
      "/api/v1/accounting/transactions",
      transaction
    );
    console.log("✅ Transaction Created Successfully");
    return response.status === 200 || response.status === 201;
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    throw new Error(
      `Failed to create transaction: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

export async function updateTransaction(
  id: string,
  transaction: Partial<Transaction>
): Promise<boolean> {
  try {
    const response = await axiosInstance.put(
      `/api/v1/accounting/transactions/${id}`,
      transaction
    );
    console.log("✅ Transaction Updated Successfully");
    return response.status === 200 || response.status === 204;
  } catch (error: any) {
    console.error("Error updating transaction:", error);
    throw new Error(
      `Failed to update transaction: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    const response = await axiosInstance.delete(
      `/api/v1/accounting/transactions/${id}`
    );
    console.log("✅ Transaction Deleted Successfully");
    return response.status === 204;
  } catch (error: any) {
    console.error("Error deleting transaction:", error);
    throw new Error(
      `Failed to delete transaction: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

// Client/Student Actions
export async function fetchClients(): Promise<Client[]> {
  try {
    const response = await axiosInstance.get("/api/v1/accounting/clients");
    console.log("🔹 Raw API Response:", response.data);
    const clients = response.data?.$values || response.data;
    console.log("✅ Extracted Clients Array:", clients);
    return clients;
  } catch (error: any) {
    console.error("Error fetching clients:", error);
    throw new Error(
      `Failed to fetch clients: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

export async function createClient(
  client: Omit<Client, "id">
): Promise<boolean> {
  try {
    const response = await axiosInstance.post(
      "/api/v1/accounting/clients",
      client
    );
    console.log("✅ Client Created Successfully");
    return response.status === 200 || response.status === 201;
  } catch (error: any) {
    console.error("Error creating client:", error);
    throw new Error(
      `Failed to create client: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

export async function updateClient(
  id: string,
  client: Partial<Client>
): Promise<boolean> {
  try {
    const response = await axiosInstance.put(
      `/api/v1/accounting/clients/${id}`,
      client
    );
    console.log("✅ Client Updated Successfully");
    return response.status === 200 || response.status === 204;
  } catch (error: any) {
    console.error("Error updating client:", error);
    throw new Error(
      `Failed to update client: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

export async function deleteClient(id: string): Promise<boolean> {
  try {
    const response = await axiosInstance.delete(
      `/api/v1/accounting/clients/${id}`
    );
    console.log("✅ Client Deleted Successfully");
    return response.status === 204;
  } catch (error: any) {
    console.error("Error deleting client:", error);
    throw new Error(
      `Failed to delete client: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

// Audit Trail Actions
export async function fetchAuditTrail(): Promise<AuditEntry[]> {
  try {
    const response = await axiosInstance.get("/api/v1/accounting/audit-trail");
    console.log("🔹 Raw API Response:", response.data);
    const auditEntries = response.data?.$values || response.data;
    console.log("✅ Extracted Audit Entries Array:", auditEntries);
    return auditEntries;
  } catch (error: any) {
    console.error("Error fetching audit trail:", error);
    throw new Error(
      `Failed to fetch audit trail: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

// Reports Actions
export async function generateReport(
  reportType: string,
  dateRange: string
): Promise<any> {
  try {
    const response = await axiosInstance.post("/api/v1/accounting/reports", {
      reportType,
      dateRange,
    });
    console.log("✅ Report Generated Successfully");
    return response.data;
  } catch (error: any) {
    console.error("Error generating report:", error);
    throw new Error(
      `Failed to generate report: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

export async function exportReport(
  reportType: string,
  format: string = "csv"
): Promise<Blob> {
  try {
    const response = await axiosInstance.post(
      "/api/v1/accounting/reports/export",
      {
        reportType,
        format,
      },
      {
        responseType: "blob",
      }
    );
    console.log("✅ Report Exported Successfully");
    return response.data;
  } catch (error: any) {
    console.error("Error exporting report:", error);
    throw new Error(
      `Failed to export report: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

// Reconciliation Actions
export async function runReconciliation(): Promise<any> {
  try {
    const response = await axiosInstance.post(
      "/api/v1/accounting/reconciliation/run"
    );
    console.log("✅ Reconciliation Completed Successfully");
    return response.data;
  } catch (error: any) {
    console.error("Error running reconciliation:", error);
    throw new Error(
      `Failed to run reconciliation: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

export async function importBankStatement(file: File): Promise<any> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(
      "/api/v1/accounting/reconciliation/import",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log("✅ Bank Statement Imported Successfully");
    return response.data;
  } catch (error: any) {
    console.error("Error importing bank statement:", error);
    throw new Error(
      `Failed to import bank statement: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

// Dashboard Metrics Actions
export async function fetchDashboardMetrics(): Promise<any> {
  try {
    const response = await axiosInstance.get(
      "/api/v1/accounting/dashboard/metrics"
    );
    console.log("✅ Dashboard Metrics Fetched Successfully");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching dashboard metrics:", error);
    throw new Error(
      `Failed to fetch dashboard metrics: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}
