const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function main() {
  if (process.env.CONFIRM_DELETE_DEMO_DATA !== "DELETE_RCLD_DEMO") {
    throw new Error("Refusing to delete demo data. Set CONFIRM_DELETE_DEMO_DATA=DELETE_RCLD_DEMO.");
  }

  const demoStudents = await db.student.findMany({where:{registrationNo:{startsWith:"DEMO-RCLD/"}},select:{id:true,userId:true}});
  const studentIds = demoStudents.map(x=>x.id);
  const studentUserIds = demoStudents.map(x=>x.userId).filter(Boolean);

  const demoEmployees = await db.employee.findMany({where:{employeeCode:{startsWith:"DEMO-RCLD/"}},select:{id:true,userId:true}});
  const employeeIds = demoEmployees.map(x=>x.id);
  const employeeUserIds = demoEmployees.map(x=>x.userId);

  await db.$transaction(async tx => {
    if (employeeUserIds.length) {
      await tx.employeeTask.deleteMany({where:{OR:[{assigneeId:{in:employeeUserIds}},{createdById:{in:employeeUserIds}},{reviewerId:{in:employeeUserIds}}]}});
    }
    if (studentIds.length) await tx.student.deleteMany({where:{id:{in:studentIds}}});
    if (employeeIds.length) await tx.employee.deleteMany({where:{id:{in:employeeIds}}});
    await tx.batch.deleteMany({where:{code:{startsWith:"DEMO-"}}});
    const allUserIds=[...studentUserIds,...employeeUserIds];
    if (allUserIds.length) await tx.user.deleteMany({where:{id:{in:allUserIds}}});
  });

  console.log(`Deleted demo dataset: ${studentIds.length} students and ${employeeIds.length} employees.`);
}

main().catch((error)=>{console.error(error);process.exitCode=1;}).finally(()=>db.$disconnect());
