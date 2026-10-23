const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const db = new PrismaClient();

const permissions = ["dashboard.view","students.view","students.manage","courses.view","courses.manage","batches.view","batches.manage","fees.view","fees.manage","finance.view","finance.manage","employees.view","employees.manage","tasks.view","tasks.manage","exams.view","exams.manage","certificates.issue","crm.view","crm.manage","lms.manage","cms.edit","cms.publish","inventory.manage","reports.view","ai.knowledge.manage","ai.analytics.organization","roles.manage","audit.view"];
const courses = [
  {
    code: "CCA",
    name: "Certificate in Computer Applications",
    shortDescription: "Build confident everyday computer and digital skills.",
    standardFee: 2500,
    displayOrder: 10,
  },
  {
    code: "DCA",
    name: "Diploma in Computer Applications",
    shortDescription: "Practical computer applications, office productivity and digital skills.",
    standardFee: 4500,
    displayOrder: 20,
  },
  {
    code: "ADCA",
    name: "Advanced Diploma in Computer Applications",
    shortDescription: "Advanced office, design, internet and professional computer skills.",
    standardFee: 6000,
    displayOrder: 30,
  },
  {
    code: "CCC",
    name: "Certificate Course in CAD",
    shortDescription: "Computer-aided design fundamentals with practical drafting and design workflows.",
    standardFee: 5000,
    displayOrder: 40,
  },
  {
    code: "CAO",
    name: "Certificate in Accounts Operation",
    shortDescription: "Accounting operations, office productivity and computerised business workflows.",
    standardFee: 5500,
    displayOrder: 50,
  },
  {
    code: "DWPD",
    name: "Diploma in Webpage Development",
    shortDescription: "Webpage development, design and modern web fundamentals.",
    standardFee: 12000,
    displayOrder: 60,
  },
  {
    code: "DOM",
    name: "Diploma in Office Management",
    shortDescription: "Office administration, documentation and productivity skills.",
    standardFee: 9000,
    displayOrder: 70,
  },
  {
    code: "DCST",
    name: "Diploma in Computer Science & Technology",
    shortDescription: "Computer science and technology fundamentals with practical software skills.",
    standardFee: 14000,
    discountType: "PERCENTAGE",
    discountValue: 50,
    displayOrder: 80,
  },
  {
    code: "DCAP",
    name: "Diploma in Computer Account Professional",
    shortDescription: "Computer account professional skills for accounting and business operations.",
    standardFee: 16500,
    discountType: "PERCENTAGE",
    discountValue: 50,
    displayOrder: 90,
  },
  {
    code: "DHNT",
    name: "Diploma in Hardware & Networking Technology",
    shortDescription: "Computer hardware, maintenance, troubleshooting and networking fundamentals.",
    standardFee: 20900,
    discountType: "PERCENTAGE",
    discountValue: 50,
    displayOrder: 100,
  },
  {
    code: "CFK",
    name: "Coding for Kids",
    shortDescription: "Beginner-friendly coding programme for young learners across games, web, programming and app development.",
    standardFee: null,
    active: false,
    onlinePublished: false,
    displayOrder: 110,
    syllabus: [
      { title: "Semester 1 — Scratch", topics: [] },
      { title: "Semester 2 — HTML", topics: [] },
      { title: "Semester 3 — CSS + JavaScript", topics: [] },
      { title: "Semester 4 — Java", topics: [] },
      { title: "Semester 5 — Python", topics: [] },
      { title: "Semester 6 — MIT App Inventor", topics: [] },
    ],
  },
];

async function main() {
  for (const key of permissions) await db.permission.upsert({where:{key},update:{},create:{key}});
  const role=await db.role.upsert({where:{name:"SUPERADMIN"},update:{description:"Full institutional control"},create:{name:"SUPERADMIN",description:"Full institutional control"}});
  for(const permission of await db.permission.findMany()) await db.rolePermission.upsert({where:{roleId_permissionId:{roleId:role.id,permissionId:permission.id}},update:{},create:{roleId:role.id,permissionId:permission.id}});
  const email=(process.env.SEED_SUPERADMIN_EMAIL||"admin@rcld.in").toLowerCase();
  const password=process.env.SEED_SUPERADMIN_PASSWORD;
  if(!password) throw new Error("SEED_SUPERADMIN_PASSWORD must be configured before seeding the Superadmin account.");
  const passwordHash=await bcrypt.hash(password,12);
  const user=await db.user.upsert({where:{email},update:{name:process.env.SEED_SUPERADMIN_NAME||"RCLD Superadmin",passwordHash,status:"ACTIVE"},create:{name:process.env.SEED_SUPERADMIN_NAME||"RCLD Superadmin",email,passwordHash,status:"ACTIVE"}});
  await db.userRole.upsert({where:{userId_roleId:{userId:user.id,roleId:role.id}},update:{},create:{userId:user.id,roleId:role.id}});
  for (const course of courses) {
    const discountType = course.discountType || "NONE";
    const data = {
      name: course.name,
      shortDescription: course.shortDescription,
      standardFee: course.standardFee,
      deliveryMode: "HYBRID",
      discountType,
      discountValue: discountType === "NONE" ? null : course.discountValue,
      discountActive: discountType !== "NONE",
      active: course.active !== false,
      onlinePublished: course.onlinePublished !== false,
      displayOrder: course.displayOrder,
      syllabus: course.syllabus,
    };

    await db.course.upsert({
      where: { code: course.code },
      update: data,
      create: {
        code: course.code,
        ...data,
        features: ["Practical learning", "Structured lessons", "Student resources"],
      },
    });
  }
  console.log("RCLD seeded:",email);
}
main().catch(console.error).finally(()=>db.$disconnect());
