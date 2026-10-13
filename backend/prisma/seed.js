require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const packages = [
  {
    name: "Classic Wedding Decor",
    description: "Elegant floral and stage decoration for your wedding.",
    price: 45000,
  },
  {
    name: "Birthday Celebration",
    description: "Colorful backdrop, balloons, and table decorations.",
    price: 15000,
  },
  {
    name: "Engagement Elegance",
    description: "A refined stage and floral setup for your engagement.",
    price: 30000,
  },
];

async function main() {
  for (const packageInfo of packages) {
    const existing = await prisma.decorationPackage.findFirst({
      where: { name: packageInfo.name },
    });

    if (!existing) {
      await prisma.decorationPackage.create({ data: packageInfo });
      console.log(`Added: ${packageInfo.name}`);
    } else {
      console.log(`Already exists: ${packageInfo.name}`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  