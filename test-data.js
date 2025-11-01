// Test customer data for account system
const testCustomer = {
  name: "Sarah Johnson",
  email: "sarah.johnson@example.com",
  phone: "1234"
};

const testOrders = [
  {
    id: "WEB-001",
    customerEmail: "sarah.johnson@example.com",
    orderDate: "2025-11-01",
    deliveryDate: "2025-11-05",
    status: "preparing",
    items: [
      { name: "Shortbread Delight", quantity: 2, price: 25.00 },
      { name: "Vanilla Cupcakes", quantity: 6, price: 18.00 }
    ],
    total: 48.00,
    deliveryMethod: "delivery",
    address: "123 Test Street, Highworth, SN6 7AB",
    notes: "Please ring doorbell"
  },
  {
    id: "WEB-002", 
    customerEmail: "sarah.johnson@example.com",
    orderDate: "2025-10-28",
    deliveryDate: "2025-11-02",
    status: "ready",
    items: [
      { name: "Christmas Cake", quantity: 1, price: 45.00 }
    ],
    total: 45.00,
    deliveryMethod: "collection",
    address: "Market Collection"
  }
];

// Store test data
localStorage.setItem('webCustomers', JSON.stringify([testCustomer]));
localStorage.setItem('shopOrders', JSON.stringify(testOrders));

console.log('Test data loaded for customer account testing');