import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Checkbox } from "../../../components/ui/checkbox";
import { toast } from "sonner";
import {
  Mail,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  Phone,
  MessageSquare,
  Calendar,
  Bell,
  Users,
  Filter,
  Search,
  FileText,
  Download,
  Settings,
  Eye,
  Edit,
  Trash2,
  Zap,
  Target,
  RefreshCw,
  Plus,
} from "lucide-react";
import { Client, Transaction } from "../../types/accounting/accounting";

interface CommunicationTemplate {
  id: string;
  name: string;
  type:
    | "payment_reminder"
    | "overdue_notice"
    | "payment_confirmation"
    | "placement_fee_due"
    | "custom";
  subject: string;
  content: string;
  isActive: boolean;
}

interface CommunicationLog {
  id: string;
  clientId: string;
  clientName: string;
  type: "email" | "sms" | "call";
  template?: string;
  subject?: string;
  content: string;
  sentAt: string;
  status: "sent" | "delivered" | "opened" | "failed";
  deliveredAt?: string;
  openedAt?: string;
}

interface ClientCommunicationProps {
  clients: Client[];
  transactions: Transaction[];
}

export function ClientCommunication({
  clients,
  transactions,
}: ClientCommunicationProps) {
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [customMessage, setCustomMessage] = useState({
    subject: "",
    content: "",
    type: "email" as "email" | "sms",
  });
  const [communicationLogs, setCommunicationLogs] = useState<
    CommunicationLog[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Mock communication templates
  const templates: CommunicationTemplate[] = [
    {
      id: "reminder_1",
      name: "Payment Reminder - Gentle",
      type: "payment_reminder",
      subject: "Payment Reminder - CareerVest",
      content: `Hi {clientName},

This is a friendly reminder that your payment of {amount} for {description} is due on {dueDate}.

You can make your payment by:
- Online portal: [payment link]
- Bank transfer: [bank details]
- Contact us: support@careervest.com

Thank you for being a valued client!

Best regards,
CareerVest Team`,
      isActive: true,
    },
    {
      id: "overdue_1",
      name: "Overdue Payment Notice",
      type: "overdue_notice",
      subject: "Important: Overdue Payment Notice",
      content: `Dear {clientName},

We notice that your payment of {amount} for {description} was due on {dueDate} and is now overdue.

Please make your payment immediately to avoid any disruption to your services.

If you have any questions or need assistance, please contact us immediately.

CareerVest Finance Team`,
      isActive: true,
    },
    {
      id: "confirmation_1",
      name: "Payment Confirmation",
      type: "payment_confirmation",
      subject: "Payment Received - Thank You!",
      content: `Dear {clientName},

Thank you! We have successfully received your payment of {amount} for {description}.

Payment Details:
- Amount: {amount}
- Date: {paymentDate}
- Reference: {referenceNumber}

Your account is now up to date.

Best regards,
CareerVest Team`,
      isActive: true,
    },
  ];

  // Mock communication logs
  const mockLogs: CommunicationLog[] = [
    {
      id: "log_1",
      clientId: "1",
      clientName: "John Smith",
      type: "email",
      template: "Payment Reminder",
      subject: "Payment Reminder - CareerVest",
      content: "Hi John, This is a friendly reminder...",
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      status: "opened",
      deliveredAt: new Date(
        Date.now() - 1000 * 60 * 60 * 2 + 30000
      ).toISOString(),
      openedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: "log_2",
      clientId: "3",
      clientName: "Mike Davis",
      type: "email",
      template: "Overdue Notice",
      subject: "Important: Overdue Payment Notice",
      content: "Dear Mike, We notice that your payment...",
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      status: "delivered",
      deliveredAt: new Date(
        Date.now() - 1000 * 60 * 60 * 24 + 45000
      ).toISOString(),
    },
  ];

  const [logs, setLogs] = useState<CommunicationLog[]>(mockLogs);

  const getClientsWithOverduePayments = () => {
    return clients.filter((client) => {
      return transactions.some(
        (t) =>
          t.studentEmail === client.email &&
          (t.status === "overdue" ||
            (t.dueDate &&
              new Date(t.dueDate) < new Date() &&
              t.status === "pending"))
      );
    });
  };

  const getClientsWithUpcomingPayments = () => {
    return clients.filter((client) => {
      return transactions.some((t) => {
        if (!t.dueDate || t.studentEmail !== client.email) return false;
        const dueDate = new Date(t.dueDate);
        const today = new Date();
        const threeDaysFromNow = new Date(
          today.getTime() + 3 * 24 * 60 * 60 * 1000
        );
        return (
          dueDate >= today &&
          dueDate <= threeDaysFromNow &&
          t.status === "pending"
        );
      });
    });
  };

  const handleSelectAllClients = (clientList: Client[], checked: boolean) => {
    if (checked) {
      const newIds = clientList.map((c) => c.id);
      setSelectedClients((prev) => {
        const combined = [...prev, ...newIds];
        return Array.from(new Set(combined));
      });
    } else {
      const clientIds = clientList.map((c) => c.id);
      setSelectedClients((prev) =>
        prev.filter((id) => !clientIds.includes(id))
      );
    }
  };

  const handleSelectClient = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedClients((prev) => [...prev, clientId]);
    } else {
      setSelectedClients((prev) => prev.filter((id) => id !== clientId));
    }
  };

  const handleSendMessage = (templateId?: string) => {
    if (selectedClients.length === 0) {
      toast.error("Please select clients first");
      return;
    }

    const template = templates.find((t) => t.id === templateId);

    selectedClients.forEach((clientId) => {
      const client = clients.find((c) => c.id === clientId);
      if (!client) return;

      const newLog: CommunicationLog = {
        id: Date.now().toString() + Math.random(),
        clientId,
        clientName: client.name,
        type: customMessage.type,
        template: template?.name,
        subject: template?.subject || customMessage.subject,
        content: template?.content || customMessage.content,
        sentAt: new Date().toISOString(),
        status: "sent",
      };

      setLogs((prev) => [newLog, ...prev]);
    });

    toast.success(
      `Sent message to ${selectedClients.length} client${
        selectedClients.length > 1 ? "s" : ""
      }`
    );
    setSelectedClients([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Send className="h-4 w-4 text-blue-600" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "opened":
        return <Eye className="h-4 w-4 text-green-600" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const overdueClients = getClientsWithOverduePayments();
  const upcomingClients = getClientsWithUpcomingPayments();

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesType = typeFilter === "all" || log.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6" />
            <span>Client Communication</span>
          </h1>
          <p className="text-muted-foreground">
            Send payment reminders and manage client communications
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Overdue Payments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {overdueClients.length}
                </div>
                <p className="text-sm text-red-700">
                  Clients need immediate attention
                </p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setSelectedClients(overdueClients.map((c) => c.id));
                  toast.success(
                    `Selected ${overdueClients.length} clients with overdue payments`
                  );
                }}
              >
                Select All
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Due Soon</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {upcomingClients.length}
                </div>
                <p className="text-sm text-yellow-700">
                  Payments due within 3 days
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-yellow-500"
                onClick={() => {
                  setSelectedClients(upcomingClients.map((c) => c.id));
                  toast.success(
                    `Selected ${upcomingClients.length} clients with upcoming payments`
                  );
                }}
              >
                Select All
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Messages Sent</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-sm text-muted-foreground">
              Total communications
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList>
          <TabsTrigger value="send">Send Messages</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Communication Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Client Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Clients</CardTitle>
                <CardDescription>
                  Choose recipients for your message
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Selection */}
                <div className="space-y-2">
                  <Label>Quick Selection</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleSelectAllClients(overdueClients, true)
                      }
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Overdue ({overdueClients.length})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleSelectAllClients(upcomingClients, true)
                      }
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Due Soon ({upcomingClients.length})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedClients([])}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                {/* Client List */}
                <div className="space-y-2">
                  <Label>Individual Selection</Label>
                  <ScrollArea className="h-[300px] border rounded-md p-4">
                    <div className="space-y-2">
                      {clients.map((client) => {
                        const hasOverdue = overdueClients.some(
                          (c) => c.id === client.id
                        );
                        const hasUpcoming = upcomingClients.some(
                          (c) => c.id === client.id
                        );

                        return (
                          <div
                            key={client.id}
                            className="flex items-center justify-between p-2 rounded hover:bg-muted"
                          >
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                checked={selectedClients.includes(client.id)}
                                onCheckedChange={(checked) =>
                                  handleSelectClient(
                                    client.id,
                                    checked as boolean
                                  )
                                }
                              />
                              <div>
                                <div className="font-medium">{client.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {client.email}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {hasOverdue && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Overdue
                                </Badge>
                              )}
                              {hasUpcoming && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-yellow-500"
                                >
                                  Due Soon
                                </Badge>
                              )}
                              {client.totalOwed > 0 && (
                                <span className="text-sm text-muted-foreground">
                                  {formatCurrency(client.totalOwed)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>

                {selectedClients.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                      {selectedClients.length} client
                      {selectedClients.length > 1 ? "s" : ""} selected
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Message Composition */}
            <Card>
              <CardHeader>
                <CardTitle>Compose Message</CardTitle>
                <CardDescription>
                  Create or select a template to send
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Selection */}
                <div className="space-y-2">
                  <Label>Use Template</Label>
                  <Select
                    value={selectedTemplate}
                    onValueChange={setSelectedTemplate}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template or compose custom message" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Custom Message</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Message Type */}
                <div className="space-y-2">
                  <Label>Message Type</Label>
                  <Select
                    value={customMessage.type}
                    onValueChange={(value: "email" | "sms") =>
                      setCustomMessage((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Message Form */}
                {!selectedTemplate && (
                  <>
                    {customMessage.type === "email" && (
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input
                          value={customMessage.subject}
                          onChange={(e) =>
                            setCustomMessage((prev) => ({
                              ...prev,
                              subject: e.target.value,
                            }))
                          }
                          placeholder="Enter email subject"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea
                        value={customMessage.content}
                        onChange={(e) =>
                          setCustomMessage((prev) => ({
                            ...prev,
                            content: e.target.value,
                          }))
                        }
                        placeholder="Enter your message here..."
                        rows={6}
                      />
                      <p className="text-xs text-muted-foreground">
                        Use placeholders: {"{clientName}"}, {"{amount}"},{" "}
                        {"{dueDate}"}, {"{description}"}
                      </p>
                    </div>
                  </>
                )}

                {/* Template Preview */}
                {selectedTemplate && (
                  <div className="space-y-2">
                    <Label>Template Preview</Label>
                    <div className="p-3 bg-muted rounded border">
                      {(() => {
                        const template = templates.find(
                          (t) => t.id === selectedTemplate
                        );
                        return template ? (
                          <div className="space-y-2">
                            <div className="font-medium">
                              {template.subject}
                            </div>
                            <div className="text-sm whitespace-pre-wrap">
                              {template.content}
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                )}

                {/* Send Actions */}
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleSendMessage(selectedTemplate)}
                    disabled={selectedClients.length === 0}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send to {selectedClients.length} Client
                    {selectedClients.length !== 1 ? "s" : ""}
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Message Templates</CardTitle>
                <CardDescription>
                  Manage pre-built communication templates
                </CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{template.name}</h4>
                            <Badge variant="outline" className="capitalize">
                              {template.type.replace("_", " ")}
                            </Badge>
                            {template.isActive && (
                              <Badge variant="default" className="text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.subject}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Communication History</span>
                <Badge variant="secondary">
                  {filteredLogs.length} messages
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search communication logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="opened">Opened</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Communication Logs Table */}
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.clientName}</div>
                            <div className="text-sm text-muted-foreground">
                              {log.template}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {log.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {log.subject || "SMS Message"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(log.status)}
                            <span className="capitalize">{log.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(log.sentAt).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
