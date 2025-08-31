import axiosInstance from "../../../lib/axiosInstance";
import { ClientDetail } from "../../types/Clients/ClientDetail";
import type { ClientList } from "../../types/Clients/ClientList";
import { Client } from "../../types/Clients/Client";

const parseDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  console.log(`Parsing date ${dateStr} resulted in ${d.toString()}`);
  return isNaN(d.getTime()) ? null : d;
};

export async function fetchClients(): Promise<ClientList[]> {
  try {
    const response = await axiosInstance.get("/api/v1/clients");
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

export async function getClient(id: number): Promise<ClientDetail | null> {
  try {
    const response = await axiosInstance.get(`/api/v1/clients/${id}`);
    const clientData = response.data;
    console.log("🔹 Raw Client Data:", clientData);

    return {
      clientID: clientData.clientID,
      clientName: clientData.clientName,
      enrollmentDate: parseDate(clientData.enrollmentDate),
      techStack: clientData.techStack,
      visaStatus: clientData.visaStatus,
      personalPhoneNumber: clientData.personalPhoneNumber,
      personalEmailAddress: clientData.personalEmailAddress,
      linkedInURL: clientData.linkedInURL,
      marketingStartDate: parseDate(clientData.marketingStartDate),
      marketingEndDate: parseDate(clientData.marketingEndDate),
      marketingEmailID: clientData.marketingEmailID,
      marketingEmailPassword: clientData.marketingEmailPassword,
      assignedRecruiterID: clientData.assignedRecruiterID,
      assignedRecruiterName: clientData.assignedRecruiterName,
      assignedSalesPersonID: clientData.assignedSalesPersonID,
      assignedSalesPersonName: clientData.assignedSalesPersonName,
      clientStatus: clientData.clientStatus,
      placedDate: parseDate(clientData.placedDate),
      backedOutDate: parseDate(clientData.backedOutDate),
      backedOutReason: clientData.backedOutReason,
      subscriptionPlanID: clientData.subscriptionPlanID,
      subscriptionPlanName: clientData.subscriptionPlanName,
      subscriptionPlan: clientData.subscriptionPlan
        ? {
            subscriptionPlanID: clientData.subscriptionPlan.subscriptionPlanID,
            planName: clientData.subscriptionPlan.planName,
            serviceAgreementUrl:
              clientData.subscriptionPlan.serviceAgreementUrl,
            subscriptionPlanPaymentStartDate: parseDate(
              clientData.subscriptionPlan.subscriptionPlanPaymentStartDate
            ),
            totalSubscriptionAmount:
              clientData.subscriptionPlan.totalSubscriptionAmount,
            createdTS: parseDate(clientData.subscriptionPlan.createdTS),
            createdBy: clientData.subscriptionPlan.createdBy,
            updatedTS: parseDate(clientData.subscriptionPlan.updatedTS),
            updatedBy: clientData.subscriptionPlan.updatedBy,
          }
        : null,
      totalDue: clientData.totalDue,
      totalPaid: clientData.totalPaid,
      postPlacementPlanID: clientData.postPlacementPlanID,
      postPlacementPlanName: clientData.postPlacementPlanName,
      postPlacementPlan: clientData.postPlacementPlan
        ? {
            postPlacementPlanID:
              clientData.postPlacementPlan.postPlacementPlanID,
            planName: clientData.postPlacementPlan.planName,
            promissoryNoteUrl: clientData.postPlacementPlan.promissoryNoteUrl,
            postPlacementPlanPaymentStartDate: parseDate(
              clientData.postPlacementPlan.postPlacementPlanPaymentStartDate
            ),
            totalPostPlacementAmount:
              clientData.postPlacementPlan.totalPostPlacementAmount,
            createdTS: parseDate(clientData.postPlacementPlan.createdTS),
            createdBy: clientData.postPlacementPlan.createdBy,
            updatedTS: parseDate(clientData.postPlacementPlan.updatedTS),
            updatedBy: clientData.postPlacementPlan.updatedBy,
          }
        : null,
      paymentSchedules: (
        clientData.paymentSchedules?.$values ||
        clientData.paymentSchedules ||
        []
      ).map((ps: any) => ({
        paymentScheduleID: ps.paymentScheduleID,
        clientID: ps.clientID,
        paymentDate: parseDate(ps.paymentDate),
        amount: ps.amount,
        isPaid: ps.isPaid,
        paymentType: ps.paymentType,
        subscriptionPlanID: ps.subscriptionPlanID,
        postPlacementPlanID: ps.postPlacementPlanID,
        createdTS: parseDate(ps.createdTS),
        createdBy: ps.createdBy,
        updatedTS: parseDate(ps.updatedTS),
        updatedBy: ps.updatedBy,
      })),
      serviceAgreementUrl: clientData.serviceAgreementUrl,
      promissoryNoteUrl: clientData.promissoryNoteUrl,
    };
  } catch (error: any) {
    console.error("Error fetching client:", error);
    throw new Error(
      `Failed to fetch client: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

interface ClientsForRecruiterResponse {
  $id: string;
  $values: ClientList[];
}

interface ClientsForSalesPersonResponse {
  $id: string;
  $values: ClientList[];
}

export async function getClientsForRecruiterId(
  recruiterId: number
): Promise<ClientsForRecruiterResponse> {
  try {
    const response = await axiosInstance.get(
      `/api/v1/clients/byrecruiter/${recruiterId}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching clients by recruiter:", error);
    throw new Error(
      `Failed to fetch clients for recruiter: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

export async function getClientsForSalesPersonId(
  salesPersonId: number
): Promise<ClientsForSalesPersonResponse> {
  try {
    const response = await axiosInstance.get(
      `/api/v1/clients/bysalesperson/${salesPersonId}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching clients by sales person:", error);
    throw new Error(
      `Failed to fetch clients for sales person: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

export async function updateClient(
  id: number,
  updatedClient: Partial<ClientDetail>,
  serviceAgreementFile?: File | null,
  promissoryNoteFile?: File | null
): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append("clientID", id.toString());
    formData.append("clientDto", JSON.stringify(updatedClient));
    if (serviceAgreementFile) {
      formData.append("ServiceAgreement", serviceAgreementFile);
    }
    if (promissoryNoteFile) {
      formData.append("PromissoryNote", promissoryNoteFile);
    }

    console.log("🔹 Data to Update Client:", {
      updatedClient,
      serviceAgreementFile,
      promissoryNoteFile,
    });
    const response = await axiosInstance.put(
      `/api/v1/clients/${id}/edit`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.status !== 204) {
      throw new Error(
        `Unexpected response status: ${response.status} - ${JSON.stringify(
          response.data
        )}`
      );
    }

    console.log("✅ Client Updated Successfully");
    return true;
  } catch (error: any) {
    console.error(
      `Error updating client (ID: ${id}):`,
      error.response?.data || error.message
    );
    throw new Error(
      `Failed to update client: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

export async function createClient(
  createClientData: Partial<Client>,
  serviceAgreementFile?: File | null,
  promissoryNoteFile?: File | null
): Promise<boolean> {
  try {
    if (
      !createClientData.clientName ||
      createClientData.clientName.trim() === ""
    ) {
      throw new Error("ClientName is required.");
    }
    if (
      !createClientData.clientStatus ||
      createClientData.clientStatus.trim() === ""
    ) {
      throw new Error("ClientStatus is required.");
    }

    // Create the ClientCreateDto object that the backend expects
    const clientCreateDto = {
      clientName: createClientData.clientName,
      enrollmentDate: createClientData.enrollmentDate
        ? new Date(createClientData.enrollmentDate).toISOString()
        : null,
      techStack: createClientData.techStack || null,
      visaStatus: createClientData.visaStatus || null,
      personalPhoneNumber: createClientData.personalPhoneNumber || null,
      personalEmailAddress: createClientData.personalEmailAddress || null,
      linkedInURL: createClientData.linkedInURL || null,
      marketingStartDate: createClientData.marketingStartDate
        ? new Date(createClientData.marketingStartDate).toISOString()
        : null,
      marketingEndDate: createClientData.marketingEndDate
        ? new Date(createClientData.marketingEndDate).toISOString()
        : null,
      marketingEmailID: createClientData.marketingEmailID || null,
      marketingEmailPassword: createClientData.marketingEmailPassword || null,
      assignedRecruiterID: createClientData.assignedRecruiterID
        ? parseInt(createClientData.assignedRecruiterID.toString())
        : null,
      assignedSalesPersonID: createClientData.assignedSalesPersonID
        ? parseInt(createClientData.assignedSalesPersonID.toString())
        : null,
      clientStatus: createClientData.clientStatus,
      placedDate: createClientData.placedDate
        ? new Date(createClientData.placedDate).toISOString()
        : null,
      backedOutDate: createClientData.backedOutDate
        ? new Date(createClientData.backedOutDate).toISOString()
        : null,
      backedOutReason: createClientData.backedOutReason || null,
      totalDue:
        createClientData.totalDue !== undefined &&
        createClientData.totalDue !== null
          ? Number(createClientData.totalDue) || 0.0
          : 0.0,
      totalPaid:
        createClientData.totalPaid !== undefined &&
        createClientData.totalPaid !== null
          ? Number(createClientData.totalPaid) || 0.0
          : 0.0,
      subscriptionPlan: createClientData.subscriptionPlan
        ? {
            subscriptionPlanID:
              createClientData.subscriptionPlan.subscriptionPlanID || 0,
            planName: createClientData.subscriptionPlan.planName || "",
            createdTS: createClientData.subscriptionPlan.createdTS
              ? new Date(
                  createClientData.subscriptionPlan.createdTS
                ).toISOString()
              : null,
            createdBy: createClientData.subscriptionPlan.createdBy || null,
            updatedTS: createClientData.subscriptionPlan.updatedTS
              ? new Date(
                  createClientData.subscriptionPlan.updatedTS
                ).toISOString()
              : null,
            updatedBy: createClientData.subscriptionPlan.updatedBy || null,
          }
        : null,
      postPlacementPlan: createClientData.postPlacementPlan
        ? {
            postPlacementPlanID:
              createClientData.postPlacementPlan.postPlacementPlanID || 0,
            planName: createClientData.postPlacementPlan.planName || "",
            promissoryNoteUrl:
              createClientData.postPlacementPlan.promissoryNoteUrl || null,
            postPlacementPlanPaymentStartDate: createClientData
              .postPlacementPlan.postPlacementPlanPaymentStartDate
              ? new Date(
                  createClientData.postPlacementPlan.postPlacementPlanPaymentStartDate
                ).toISOString()
              : null,
            totalPostPlacementAmount:
              createClientData.postPlacementPlan.totalPostPlacementAmount !==
                undefined &&
              createClientData.postPlacementPlan.totalPostPlacementAmount !==
                null
                ? Number(
                    createClientData.postPlacementPlan.totalPostPlacementAmount
                  ) || 0
                : null,
            createdTS: createClientData.postPlacementPlan.createdTS
              ? new Date(
                  createClientData.postPlacementPlan.createdTS
                ).toISOString()
              : null,
            createdBy: createClientData.postPlacementPlan.createdBy || null,
            updatedTS: createClientData.postPlacementPlan.updatedTS
              ? new Date(
                  createClientData.postPlacementPlan.updatedTS
                ).toISOString()
              : null,
            updatedBy: createClientData.postPlacementPlan.updatedBy || null,
          }
        : null,
      paymentSchedules:
        createClientData.paymentSchedules &&
        createClientData.paymentSchedules.length > 0
          ? createClientData.paymentSchedules.map((ps) => ({
              paymentScheduleID: ps.paymentScheduleID || 0,
              clientID: ps.clientID || 0,
              paymentDate: ps.paymentDate
                ? new Date(ps.paymentDate).toISOString()
                : null,
              amount:
                ps.amount !== undefined && ps.amount !== null
                  ? Number(ps.amount) || 0.0
                  : 0.0,
              createdTS: ps.createdTS
                ? new Date(ps.createdTS).toISOString()
                : null,
              createdBy: ps.createdBy || null,
              updatedTS: ps.updatedTS
                ? new Date(ps.updatedTS).toISOString()
                : null,
              updatedBy: ps.updatedBy || null,
            }))
          : null,
      // Pipeline initialization fields
      initialPipelineStage: "sales", // Default to sales stage
      priority: "medium", // Default priority
      pipelineNotes: "Client created from client module", // Initial pipeline notes
    };

    console.log(
      "🔹 ClientCreateDto to Send:",
      JSON.stringify(clientCreateDto, null, 2)
    );

    // Create FormData as expected by the ClientCreateDtoBinder
    const formData = new FormData();

    // Add the clientDto field with JSON string (this is what the binder expects)
    formData.append("clientDto", JSON.stringify(clientCreateDto));

    // Add files if provided
    if (serviceAgreementFile) {
      formData.append("ServiceAgreement", serviceAgreementFile);
    }
    if (promissoryNoteFile) {
      formData.append("PromissoryNote", promissoryNoteFile);
    }

    console.log("🔹 FormData to Send:");
    for (let [key, value] of Array.from(formData.entries())) {
      console.log(
        `${key}: ${value instanceof File ? value.name : JSON.stringify(value)}`
      );
    }

    const response = await axiosInstance.post("/api/v1/clients", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === 200) {
      console.log("✅ Client Created Successfully");
      return true;
    } else {
      throw new Error(
        `Unexpected response status: ${response.status} - ${JSON.stringify(
          response.data
        )}`
      );
    }
  } catch (error: any) {
    console.error(
      "❌ Error creating client:",
      error.response?.data || error.message
    );
    throw new Error(
      `Failed to create client: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

export async function deleteClient(id: number): Promise<boolean> {
  try {
    const response = await axiosInstance.delete(`/api/v1/clients/${id}`);
    console.log("✅ Client Deleted Successfully");
    return response.status === 204;
  } catch (error: any) {
    console.error(
      `Error deleting client (ID: ${id}):`,
      error.response?.data || error.message
    );
    throw new Error(
      `Failed to delete client: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}
