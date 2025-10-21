import { format, addDays, subDays, subMonths } from "date-fns";
import { Payment, PaymentTransaction } from "../components/ModernPaymentTable";

// Generate dynamic dummy data based on current date with partial payments and transactions
export const generateDummyPayments = (): Payment[] => {
  const today = new Date();

  return [
    // Fully paid payment
    {
      id: "1",
      clientId: "client-1",
      clientName: "John Smith",
      clientEmail: "john@email.com",
      originalAmount: 2500,
      paidAmount: 2500,
      remainingAmount: 0,
      status: "paid" as const,
      date: format(subMonths(today, 1), "yyyy-MM-dd"),
      type: "subscription" as const,
      assignedTo: "Sarah T.",
      transactions: [
        {
          id: "tx-1",
          paymentId: "1",
          amount: 2500,
          paidDate: format(subMonths(today, 1), "yyyy-MM-dd"),
          comment: "Full payment received via wire transfer",
          recordedBy: "Admin User",
          recordedAt: new Date(subMonths(today, 1)).toISOString(),
          type: "payment" as const,
        },
      ],
    },
    // Partially paid payment - 3 transactions
    {
      id: "2",
      clientId: "client-2",
      clientName: "Sarah Johnson",
      clientEmail: "sarah@email.com",
      originalAmount: 15000,
      paidAmount: 8500,
      remainingAmount: 6500,
      status: "partially_paid" as const,
      dueDate: format(addDays(today, 15), "yyyy-MM-dd"),
      date: format(subDays(today, 30), "yyyy-MM-dd"),
      type: "placement" as const,
      assignedTo: "Mike R.",
      transactions: [
        {
          id: "tx-2",
          paymentId: "2",
          amount: 5000,
          paidDate: format(subDays(today, 25), "yyyy-MM-dd"),
          comment: "Initial partial payment - Check #1234",
          recordedBy: "Admin User",
          recordedAt: new Date(subDays(today, 25)).toISOString(),
          type: "payment" as const,
        },
        {
          id: "tx-3",
          paymentId: "2",
          amount: 2000,
          paidDate: format(subDays(today, 15), "yyyy-MM-dd"),
          comment: "Second partial payment - Wire transfer",
          recordedBy: "Sarah Jones",
          recordedAt: new Date(subDays(today, 15)).toISOString(),
          type: "payment" as const,
        },
        {
          id: "tx-4",
          paymentId: "2",
          amount: 1500,
          paidDate: format(subDays(today, 5), "yyyy-MM-dd"),
          comment: "Third partial payment - ACH transfer",
          recordedBy: "Admin User",
          recordedAt: new Date(subDays(today, 5)).toISOString(),
          type: "payment" as const,
        },
      ],
    },
    // Pending payment with no payments
    {
      id: "3",
      clientId: "client-3",
      clientName: "Mike Davis",
      clientEmail: "mike@email.com",
      originalAmount: 2500,
      paidAmount: 0,
      remainingAmount: 2500,
      status: "pending" as const,
      dueDate: format(subDays(today, 5), "yyyy-MM-dd"),
      date: format(subDays(today, 25), "yyyy-MM-dd"),
      type: "subscription" as const,
      assignedTo: "Sarah T.",
      transactions: [],
    },
    // Pending payment
    {
      id: "4",
      clientId: "client-4",
      clientName: "Emily Wilson",
      clientEmail: "emily@email.com",
      originalAmount: 12000,
      paidAmount: 0,
      remainingAmount: 12000,
      status: "pending" as const,
      dueDate: format(addDays(today, 20), "yyyy-MM-dd"),
      date: format(subDays(today, 5), "yyyy-MM-dd"),
      type: "placement" as const,
      assignedTo: "Tom J.",
      transactions: [],
    },
    // Pending partially paid
    {
      id: "5",
      clientId: "client-5",
      clientName: "David Brown",
      clientEmail: "david@email.com",
      originalAmount: 2500,
      paidAmount: 500,
      remainingAmount: 2000,
      status: "partially_paid" as const,
      dueDate: format(subDays(today, 10), "yyyy-MM-dd"),
      date: format(subDays(today, 40), "yyyy-MM-dd"),
      type: "subscription" as const,
      assignedTo: "Sarah T.",
      transactions: [
        {
          id: "tx-5",
          paymentId: "5",
          amount: 500,
          paidDate: format(subDays(today, 35), "yyyy-MM-dd"),
          comment: "Small partial payment - Client financial difficulties",
          recordedBy: "Admin User",
          recordedAt: new Date(subDays(today, 35)).toISOString(),
          type: "payment" as const,
        },
      ],
    },
    // Fully paid with overpayment (will create credit)
    {
      id: "6",
      clientId: "client-6",
      clientName: "Lisa Garcia",
      clientEmail: "lisa@email.com",
      originalAmount: 3000,
      paidAmount: 3000,
      remainingAmount: 0,
      status: "paid" as const,
      date: format(subDays(today, 20), "yyyy-MM-dd"),
      type: "subscription" as const,
      assignedTo: "Mike R.",
      transactions: [
        {
          id: "tx-6",
          paymentId: "6",
          amount: 3500,
          paidDate: format(subDays(today, 18), "yyyy-MM-dd"),
          comment: "Overpayment - $500 added to credit balance",
          recordedBy: "Admin User",
          recordedAt: new Date(subDays(today, 18)).toISOString(),
          type: "payment" as const,
        },
      ],
    },
    // Pending - Large amount
    {
      id: "7",
      clientId: "client-7",
      clientName: "Robert Taylor",
      clientEmail: "robert@email.com",
      originalAmount: 25000,
      paidAmount: 0,
      remainingAmount: 25000,
      status: "pending" as const,
      dueDate: format(addDays(today, 30), "yyyy-MM-dd"),
      date: format(subDays(today, 2), "yyyy-MM-dd"),
      type: "placement" as const,
      assignedTo: "Tom J.",
      transactions: [],
    },
    // Partially paid - almost complete
    {
      id: "8",
      clientId: "client-8",
      clientName: "Jennifer Lee",
      clientEmail: "jennifer@email.com",
      originalAmount: 5000,
      paidAmount: 4700,
      remainingAmount: 300,
      status: "partially_paid" as const,
      dueDate: format(addDays(today, 10), "yyyy-MM-dd"),
      date: format(subDays(today, 15), "yyyy-MM-dd"),
      type: "subscription" as const,
      assignedTo: "Sarah T.",
      transactions: [
        {
          id: "tx-7",
          paymentId: "8",
          amount: 4700,
          paidDate: format(subDays(today, 12), "yyyy-MM-dd"),
          comment: "Partial payment - Balance to follow",
          recordedBy: "Sarah Jones",
          recordedAt: new Date(subDays(today, 12)).toISOString(),
          type: "payment" as const,
        },
      ],
    },
    // Cancelled payment
    {
      id: "9",
      clientId: "client-9",
      clientName: "Thomas Anderson",
      clientEmail: "thomas@email.com",
      originalAmount: 10000,
      paidAmount: 0,
      remainingAmount: 10000,
      status: "cancelled" as const,
      date: format(subDays(today, 60), "yyyy-MM-dd"),
      type: "placement" as const,
      assignedTo: "Mike R.",
      transactions: [],
    },
    // Paid subscription
    {
      id: "10",
      clientId: "client-10",
      clientName: "Maria Rodriguez",
      clientEmail: "maria@email.com",
      originalAmount: 2500,
      paidAmount: 2500,
      remainingAmount: 0,
      status: "paid" as const,
      date: format(subDays(today, 8), "yyyy-MM-dd"),
      type: "subscription" as const,
      assignedTo: "Sarah T.",
      transactions: [
        {
          id: "tx-8",
          paymentId: "10",
          amount: 2500,
          paidDate: format(subDays(today, 7), "yyyy-MM-dd"),
          comment: "Monthly subscription payment - Credit card",
          recordedBy: "Admin User",
          recordedAt: new Date(subDays(today, 7)).toISOString(),
          type: "payment" as const,
        },
      ],
    },
  ];
};

// Client credit balances (from overpayments)
export interface ClientBalance {
  clientId: string;
  clientName: string;
  creditBalance: number;
  totalOutstanding: number;
  lastUpdated: string;
}

export const generateClientBalances = (payments: Payment[]): ClientBalance[] => {
  const balanceMap = new Map<string, ClientBalance>();

  payments.forEach((payment) => {
    if (!balanceMap.has(payment.clientId)) {
      balanceMap.set(payment.clientId, {
        clientId: payment.clientId,
        clientName: payment.clientName,
        creditBalance: 0,
        totalOutstanding: 0,
        lastUpdated: new Date().toISOString(),
      });
    }

    const balance = balanceMap.get(payment.clientId)!;

    // Add to outstanding if not paid/cancelled
    if (payment.status !== "paid" && payment.status !== "cancelled") {
      balance.totalOutstanding += payment.remainingAmount;
    }
  });

  // Add credit balances from overpayments
  // Client 6 (Lisa Garcia) has $500 credit from overpayment
  const lisaBalance = balanceMap.get("client-6");
  if (lisaBalance) {
    lisaBalance.creditBalance = 500;
  }

  return Array.from(balanceMap.values()).filter(
    (b) => b.creditBalance > 0 || b.totalOutstanding > 0
  );
};
