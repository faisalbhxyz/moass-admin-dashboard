import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const lowStock = await prisma.setting.upsert({
    where: { key: "low_stock_threshold" },
    create: { key: "low_stock_threshold", value: "5" },
    update: {},
  });
  const siteName = await prisma.setting.upsert({
    where: { key: "site_name" },
    create: { key: "site_name", value: "MOASS Store" },
    update: {},
  });
  const currency = await prisma.setting.upsert({
    where: { key: "currency" },
    create: { key: "currency", value: "BDT" },
    update: {},
  });
  const paymentGateway = await prisma.setting.upsert({
    where: { key: "payment_gateway" },
    create: { key: "payment_gateway", value: "{}" },
    update: {},
  });
  const hash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    create: { email: "admin@example.com", password: hash, name: "Admin", role: "admin" },
    update: { password: hash, name: "Admin", role: "admin" },
  });
  console.log("Seed done:", { lowStock, siteName, currency, paymentGateway, admin: admin.email });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
