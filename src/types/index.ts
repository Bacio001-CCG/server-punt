export type InvoiceAmount = {
    value: string;
    currency: string;
};

export type InvoiceLine = {
    description: string;
    quantity: number;
    vatRate: string;
    unitPrice: InvoiceAmount;
};

export type InvoicePaymentDetail = {
    source: string;
    sourceReference: string;
};

export type InvoiceEmailDetails = {
    subject: string;
    body: string;
};

export type SalesInvoice = {
    resource: "sales-invoice";
    id: string;
    mode: string;
    source: string;
    profileId: string;
    invoiceNumber: string;
    currency: string;
    status: string;
    type: string;
    vatScheme: string;
    paymentTerm: string;
    recipientIdentifier: string;
    lines: InvoiceLine[];
    amountDue: InvoiceAmount;
    subtotalAmount: InvoiceAmount;
    totalAmount: InvoiceAmount;
    totalVatAmount: InvoiceAmount;
    discountedSubtotalAmount: InvoiceAmount;
    createdAt: string;
    issuedAt: string;
    dueAt: string;
    paidAt: string;
    vatMode: string;
    metadata: any[];
    isEInvoice: boolean;
    paymentDetails: InvoicePaymentDetail[];
    emailDetails: InvoiceEmailDetails;
};

export type Order = {
    customerId: number;
    invoiceId: string;
    status: "pending" | "paid" | "cancelled" | string;
    deliveryMethod: string;
    deliveryCountry: string | null;
    deliveryFirstname: string | null;
    deliveryLastname: string | null;
    deliveryCompany: string | null;
    deliveryAddress: string | null;
    deliveryPostalcode: string | null;
    deliveryCity: string | null;
    deliveryPhonenumber: string | null;
    invoiceCountry: string;
    invoiceFirstname: string;
    invoiceLastname: string;
    invoiceCompany: string | null;
    invoiceCOCNumber: string | null;
    invoiceAddress: string;
    invoicePostalcode: string;
    invoiceCity: string;
    invoicePhonenumber: string | null;
};

export type OrderItem = {
    orderId: number;
    productId: number;
    quantity: number;
    unitPrice: number;
};
