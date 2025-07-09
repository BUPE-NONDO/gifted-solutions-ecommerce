// Simple user creation utility
// Run this in your browser console on the live site

const createInitialUsers = async () => {
  // This would be run after Firebase Auth is enabled
  console.log("Creating initial users...");
  
  const users = [
    {
      email: "giftedsolutions20@gmail.com",
      password: "GiftedAdmin2024!",
      role: "admin",
      name: "Admin User"
    },
    {
      email: "manager@giftedsolutions20.gmail.com",
      password: "GiftedManager2024!",
      role: "manager",
      name: "Store Manager"
    },
    {
      email: "customer@example.com",
      password: "Customer123!",
      role: "customer",
      name: "Test Customer"
    }
  ];

  console.log("Users to create:", users);
  console.log("Please create these users manually in Firebase Console > Authentication > Users");
};

// Export for use
export { createInitialUsers };
