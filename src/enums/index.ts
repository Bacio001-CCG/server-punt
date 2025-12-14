export enum OrderStatus {
    Pending = "pending",
    Paid = "paid",
    Processing = "processing",
    Shipped = "shipped",
    Cancelled = "cancelled",
    Finished = "finished",
}

export enum DeliveryMethod {
    Delivery = "delivery",
    Pickup = "pickup",
}

export enum AuditLogAction {
    Create = "create",
    Update = "update",
    Delete = "delete",
    View = "view",
    Login = "login",
    Logout = "logout",
    Signup = "signup",
}

export enum NotificationProvider {
    Discord = "discord",
    Email = "email",
}

export enum NotificationAction {
    OrderCreated = "order_created",
    OrderPaid = "order_paid",
    StockLow = "stock_low",
    StockOut = "stock_out",
}

export enum UserPermission {
    ViewOrders = "view_orders",

    ViewInvoices = "view_invoices",

    ViewAuditLogs = "view_audit_logs",

    ViewInventory = "view_inventory",
    CreateInventory = "create_inventory",
    UpdateInventory = "update_inventory",
    DeleteInventory = "delete_inventory",

    ViewCategories = "view_categories",
    CreateCategories = "create_categories",
    UpdateCategories = "update_categories",
    DeleteCategories = "delete_categories",

    ViewBrands = "view_brands",
    CreateBrands = "create_brands",
    UpdateBrands = "update_brands",
    DeleteBrands = "delete_brands",

    ViewUsers = "view_users",
    CreateUsers = "create_users",
    UpdateUsers = "update_users",
    DeleteUsers = "delete_users",

    ViewNotifications = "view_notifications",
    CreateNotification = "create_notification",
    UpdateNotification = "update_notification",
    DeleteNotification = "delete_notification",
}

export enum DeliveryStatus {
    Pending = "pending",
    Shipped = "shipped",
    Delivered = "delivered",
    Failure = "failure",
    Unknown = "unknown",
}

export enum DHLDeliveryStatus {
    Delivered = "delivered",
    Failure = "failure",
    PreTransit = "pre-transit",
    Transit = "transit",
    Unknown = "unknown",
}
