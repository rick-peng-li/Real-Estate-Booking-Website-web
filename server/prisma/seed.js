import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../config/prismaConfig.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "../data/Residency.json");

const seed = async () => {
  const raw = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  // Ensure owner users exist for seeded residencies
  const emails = [...new Set(raw.map((item) => item.userEmail))];
  for (const email of emails) {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: email.split("@")[0] },
    });
  }

  let created = 0;
  for (const item of raw) {
    const exists = await prisma.residency.findFirst({
      where: { address: item.address, userEmail: item.userEmail },
    });
    if (exists) continue;

    await prisma.residency.create({
      data: {
        title: item.title,
        description: item.description,
        price: item.price,
        address: item.address,
        city: item.city,
        country: item.country,
        image: item.image,
        facilities: item.facilities,
        owner: { connect: { email: item.userEmail } },
      },
    });
    created += 1;
  }

  console.log(`Seed finished: ${created} residencies created, ${raw.length - created} skipped.`);
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
