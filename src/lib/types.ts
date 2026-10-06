export type ProductCategory =
  | "OTC Medicines"
  | "Prescription Medicines"
  | "Vitamins & Supplements"
  | "Herbal & Natural"
  | "Medical Devices"
  | "Personal Care"
  | "First Aid"
  | "Mother & Baby";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory | string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  reorderLevel: number;
  expiryDate: string | null;
  supplier: string;
}

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type CustomerType = "clinic" | "pharmacy" | "business" | "individual" | "walkin";

export interface Customer {
  id: string;
  name: string;
  type: CustomerType | string;
  phone: string;
  email: string | null;
  city: string;
  creditTerms: number;
  totalOrders: number;
  totalPurchases: number;
  outstandingBalance: number;
  lastPurchaseDate: string | null;
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type OrderStatus = "Paid" | "Partial" | "Unpaid" | "Cancelled";

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  time: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  amountPaid: number;
  status: OrderStatus | string;
  paymentMethod: string | null;
  createdBy: string;
}

export type InvoiceStatus = "Paid" | "Partial" | "Unpaid" | "Overdue";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  balance: number;
  status: InvoiceStatus | string;
}

export interface Payment {
  id: string;
  receiptNumber: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  amount: number;
  method: string;
  receivedBy: string;
}

export interface InventoryMovement {
  id: string;
  date: string;
  time: string;
  productId: string;
  productName: string;
  sku: string;
  type: "Stock In" | "Stock Out" | string;
  quantity: number;
  reference: string;
  reason: string;
  user: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning" | "danger" | string;
  read: boolean;
}

export interface Meta {
  businessName: string;
  branch: string;
  currency: string;
  asOfDate: string;
  user: { name: string; email: string; role: string };
}
