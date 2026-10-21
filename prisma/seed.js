const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const db = new PrismaClient();

const permissions = ["dashboard.view","students.view","students.manage","courses.view","courses.manage","batches.view","batches.manage","fees.view","fees.manage","finance.view","finance.manage","employees.view","employees.manage","tasks.view","tasks.manage","exams.view","exams.manage","certificates.issue","crm.view","crm.manage","lms.manage","cms.edit","cms.publish","inventory.manage","reports.view","ai.knowledge.manage","ai.analytics.organization","roles.manage","audit.view"];
const courses = [
["CCA","Certificate in Computer Applications","Foundation computer skills for everyday and professional use."],
["DCA","Diploma in Computer Applications","Practical computer applications, office productivity and digital skills."],
["ADCA","Advanced Diploma in Computer Applications","Advanced office, design, internet and professional computer skills."],
["CCC","Course on Computer Concepts","Essential digital literacy, internet, office and computer fundamentals."],
["CAO","Computer Accounting & Office","Office productivity with accounting and computerised business workflows."],
["DWPD","Diploma in Web & Programming Development","Web design, programming and modern development fundamentals."],
["DOM","Diploma in Office Management","Office administration, documentation and productivity skills."],
["DCST","Diploma in Computer Software Technology","Software tools, productivity applications and practical computer technology."],
["DCAP","Diploma in Computer Application Programming","Programming and application development fundamentals."],
["DHNT","Diploma in Hardware & Networking Technology","Computer hardware, maintenance and networking fundamentals."]
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
  for(const [code,name,description] of courses) await db.course.upsert({where:{code},update:{name,shortDescription:description,onlinePublished:true},create:{code,name,shortDescription:description,active:true,onlinePublished:true,features:["Practical learning","Structured lessons","Student resources"]}});
  console.log("RCLD seeded:",email);
}
main().catch(console.error).finally(()=>db.$disconnect());
