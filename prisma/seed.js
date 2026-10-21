const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const db = new PrismaClient();

const permissions = ["dashboard.view","students.view","students.manage","courses.view","courses.manage","batches.view","batches.manage","fees.view","fees.manage","finance.view","finance.manage","employees.view","employees.manage","tasks.view","tasks.manage","exams.view","exams.manage","certificates.issue","crm.view","crm.manage","lms.manage","cms.edit","cms.publish","inventory.manage","reports.view","ai.knowledge.manage","ai.analytics.organization","roles.manage","audit.view"];
const courses = [["CCA","Certificate in Computer Applications"],["DCA","Diploma in Computer Applications"],["ADCA","Advanced Diploma in Computer Applications"],["CCC","Course on Computer Concepts"],["CAO","Computer Accounting & Office"],["DWPD","Diploma in Web & Programming Development"],["DOM","Diploma in Office Management"],["DCST","Diploma in Computer Software Technology"],["DCAP","Diploma in Computer Application Programming"],["DHNT","Diploma in Hardware & Networking Technology"]];

async function main() {
  for (const key of permissions) await db.permission.upsert({ where:{key}, update:{}, create:{key} });
  const role = await db.role.upsert({ where:{name:"SUPERADMIN"}, update:{}, create:{name:"SUPERADMIN",description:"Full institutional control"} });
  for (const permission of await db.permission.findMany()) {
    await db.rolePermission.upsert({
      where:{roleId_permissionId:{roleId:role.id,permissionId:permission.id}},
      update:{}, create:{roleId:role.id,permissionId:permission.id}
    });
  }
  const email=(process.env.SEED_SUPERADMIN_EMAIL||"admin@example.com").toLowerCase();
  const password=process.env.SEED_SUPERADMIN_PASSWORD||"ChangeMe123!";
  const passwordHash=await bcrypt.hash(password,12);
  const user=await db.user.upsert({
    where:{email},
    update:{name:process.env.SEED_SUPERADMIN_NAME||"RCLD Superadmin",passwordHash,status:"ACTIVE"},
    create:{name:process.env.SEED_SUPERADMIN_NAME||"RCLD Superadmin",email,passwordHash,status:"ACTIVE"}
  });
  await db.userRole.upsert({where:{userId_roleId:{userId:user.id,roleId:role.id}},update:{},create:{userId:user.id,roleId:role.id}});
  for(const [code,name] of courses) await db.course.upsert({where:{code},update:{name},create:{code,name,active:true}});
  console.log("RCLD foundation seeded:",email);
}
main().catch(console.error).finally(()=>db.$disconnect());