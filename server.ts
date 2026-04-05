import "dotenv/config";
import app from "./app.js";
import prisma from "./lib/prisma.js";
import bcrypt from "bcrypt";

const PORT = process.env.PORT || 5000;

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@vms.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminName = process.env.ADMIN_NAME || "Admin";

  const existing = await prisma.user.findFirst({ where: { role: "admin" } });
  if (existing) {
    console.log(`Admin already exists (${existing.email}). Skipping seed.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    },
  });
  console.log(`Admin seeded: ${adminEmail}`);
}

seedAdmin()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to seed admin:", err);
    process.exit(1);
  });
