const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const db = new PrismaClient();

const permissions = ["dashboard.view","students.view","students.manage","courses.view","courses.manage","batches.view","batches.manage","fees.view","fees.manage","finance.view","finance.manage","employees.view","employees.manage","tasks.view","tasks.manage","exams.view","exams.manage","certificates.issue","crm.view","crm.manage","lms.manage","cms.edit","cms.publish","inventory.manage","reports.view","ai.knowledge.manage","ai.analytics.organization","roles.manage","audit.view"];

const courses = [
  ["CCA","Certificate in Computer Applications",2500,10],
  ["DCA","Diploma in Computer Applications",4500,20],
  ["ADCA","Advanced Diploma in Computer Applications",6000,30],
  ["CCC","Certificate Course in CAD",5000,40],
  ["CAO","Certificate in Accounts Operation",5500,50],
  ["DWPD","Diploma in Webpage Development",12000,60],
  ["DOM","Diploma in Office Management",9000,70],
  ["DCST","Diploma in Computer Science & Technology",14000,80],
  ["DCAP","Diploma in Computer Account Professional",16500,90],
  ["DHNT","Diploma in Hardware & Networking Technology",20900,100],
].map(([code,name,standardFee,displayOrder]) => ({code,name,standardFee,displayOrder}));

const employeeNames = [
  "Aarav Kumar","Ananya Singh","Arjun Das","Ayesha Khan","Deepak Sharma",
  "Diya Roy","Farhan Ali","Ishita Gupta","Karan Verma","Kavya Sinha",
  "Manish Kumar","Meera Das","Nikhil Roy","Pooja Kumari","Rahul Singh",
  "Riya Sharma","Sahil Gupta","Sneha Roy","Vikash Kumar","Zoya Khan"
];

const firstNames = ["Aarav","Aditi","Aditya","Akash","Ananya","Aniket","Anjali","Arjun","Ayush","Deepak","Diya","Gaurav","Harsh","Ishita","Kajal","Karan","Khushi","Manish","Meera","Mohit","Neha","Nikhil","Pooja","Priya","Rahul","Riya","Rohit","Sahil","Sakshi","Shivam","Sneha","Suman","Vikash","Yash"];
const lastNames = ["Kumar","Singh","Sharma","Gupta","Das","Roy","Sinha","Verma","Yadav","Kumari"];

function demoStudentName(i) {
  return `${firstNames[(i - 1) % firstNames.length]} ${lastNames[Math.floor((i - 1) / firstNames.length) % lastNames.length]}`;
}

async function ensureRole(name, description, permissionKeys = []) {
  const role = await db.role.upsert({where:{name},update:{description},create:{name,description}});
  const rows = await db.permission.findMany({where:{key:{in:permissionKeys}}});
  for (const permission of rows) {
    await db.rolePermission.upsert({
      where:{roleId_permissionId:{roleId:role.id,permissionId:permission.id}},
      update:{},
      create:{roleId:role.id,permissionId:permission.id}
    });
  }
  return role;
}

async function seedDemoData(demoPassword, context) {
  const { centre, session, departments, skills } = context;
  const passwordHash = await bcrypt.hash(demoPassword, 10);
  const facultyRole = await ensureRole("FACULTY","Faculty access",["dashboard.view","students.view","batches.view","exams.view","tasks.view"]);
  const adminRole = await ensureRole("ADMIN","Administrative access",["dashboard.view","students.view","students.manage","courses.view","batches.view","batches.manage","fees.view","fees.manage","employees.view","tasks.view","tasks.manage","reports.view"]);
  const studentRole = await ensureRole("STUDENT","Student portal access",["dashboard.view"]);

  const courseRows = await db.course.findMany({where:{code:{in:courses.map(c=>c.code)}},orderBy:{displayOrder:"asc"}});
  const batches = [];
  for (let i = 0; i < courseRows.length; i++) {
    const course = courseRows[i];
    const batch = await db.batch.upsert({
      where:{code:`DEMO-${course.code}-2026-A`},
      update:{name:`${course.code} Demo Batch A`,academicSessionId:session.id,centreId:centre.id,status:"ACTIVE",startTime:"10:00",endTime:"11:00",room:`L${(i%4)+1}`},
      create:{code:`DEMO-${course.code}-2026-A`,name:`${course.code} Demo Batch A`,courseId:course.id,academicSessionId:session.id,centreId:centre.id,capacity:50,status:"ACTIVE",startTime:"10:00",endTime:"11:00",room:`L${(i%4)+1}`}
    });
    batches.push(batch);
  }

  const employeeUsers = [];
  for (let i = 1; i <= 20; i++) {
    const email = `demo.employee${String(i).padStart(2,"0")}@rcld.test`;
    const user = await db.user.upsert({
      where:{email},
      update:{name:employeeNames[i-1],passwordHash,status:"ACTIVE",phone:`90000${String(i).padStart(5,"0")}`},
      create:{name:employeeNames[i-1],email,passwordHash,status:"ACTIVE",phone:`90000${String(i).padStart(5,"0")}`}
    });
    const role = i <= 3 ? adminRole : facultyRole;
    await db.userRole.upsert({where:{userId_roleId:{userId:user.id,roleId:role.id}},update:{},create:{userId:user.id,roleId:role.id}});
    const employee = await db.employee.upsert({
      where:{userId:user.id},
      update:{employeeCode:`DEMO-RCLD/ISL/EMP/${String(i).padStart(4,"0")}`,designation:i<=3?"Admin":"Faculty",departmentId:i<=3?departments["Administration"].id:departments["Teaching/Faculty"].id,employmentType:"FULL_TIME",basicPay:18000+(i*500),employmentStatus:"ACTIVE",joinedAt:new Date(2026,0,(i%20)+1)},
      create:{userId:user.id,employeeCode:`DEMO-RCLD/ISL/EMP/${String(i).padStart(4,"0")}`,designation:i<=3?"Admin":"Faculty",departmentId:i<=3?departments["Administration"].id:departments["Teaching/Faculty"].id,employmentType:"FULL_TIME",basicPay:18000+(i*500),employmentStatus:"ACTIVE",joinedAt:new Date(2026,0,(i%20)+1)}
    });
    for (let s=0;s<4;s++) {
      const skill=skills[(i+s*3)%skills.length];
      await db.employeeSkill.upsert({where:{employeeId_skillId:{employeeId:employee.id,skillId:skill.id}},update:{},create:{employeeId:employee.id,skillId:skill.id}});
    }
    employeeUsers.push({user,employee});
  }

  for (let i = 0; i < Math.min(10,batches.length); i++) {
    const employee = employeeUsers[(i+3) % employeeUsers.length].employee;
    await db.batchFaculty.upsert({
      where:{batchId_employeeId:{batchId:batches[i].id,employeeId:employee.id}},
      update:{},
      create:{batchId:batches[i].id,employeeId:employee.id}
    });
  }

  for (let i = 1; i <= 200; i++) {
    const courseIndex = (i - 1) % courseRows.length;
    const course = courseRows[courseIndex];
    const batch = batches[courseIndex];
    const name = demoStudentName(i);
    const email = `demo.student${String(i).padStart(3,"0")}@rcld.test`;
    const registrationNo = `DEMO-RCLD/ISL/2026/${course.code}/${String(i).padStart(4,"0")}`;
    const user = await db.user.upsert({
      where:{email},
      update:{name,passwordHash,status:"ACTIVE",phone:`80000${String(i).padStart(5,"0")}`},
      create:{name,email,passwordHash,status:"ACTIVE",phone:`80000${String(i).padStart(5,"0")}`}
    });
    await db.userRole.upsert({where:{userId_roleId:{userId:user.id,roleId:studentRole.id}},update:{},create:{userId:user.id,roleId:studentRole.id}});
    const student = await db.student.upsert({
      where:{registrationNo},
      update:{userId:user.id,name,phone:`80000${String(i).padStart(5,"0")}`,email,studentType:i%5===0?"ONLINE":"OFFLINE",centreId:centre.id,status:"ACTIVE"},
      create:{userId:user.id,registrationNo,name,phone:`80000${String(i).padStart(5,"0")}`,email,studentType:i%5===0?"ONLINE":"OFFLINE",centreId:centre.id,status:"ACTIVE"}
    });
    const enrollment = await db.batchEnrollment.upsert({
      where:{studentId_batchId:{studentId:student.id,batchId:batch.id}},
      update:{active:true,leftAt:null},
      create:{studentId:student.id,batchId:batch.id,active:true}
    });
    const standardFee = Number(course.standardFee || 0);
    const discount = i % 7 === 0 ? 500 : 0;
    const finalAmount = Math.max(0, standardFee - discount);
    const paidAmount = i % 4 === 0 ? finalAmount : i % 3 === 0 ? Math.round(finalAmount/2) : 0;
    const balanceAmount = finalAmount - paidAmount;
    const ledger = await db.feeLedger.upsert({
      where:{batchEnrollmentId:enrollment.id},
      update:{courseFee:standardFee,discountAmount:discount,finalAmount,paidAmount,balanceAmount,status:balanceAmount===0?"PAID":paidAmount>0?"PARTIAL":"PENDING"},
      create:{studentId:student.id,batchEnrollmentId:enrollment.id,courseFee:standardFee,discountAmount:discount,admissionFeeAtAdmission:0,finalAmount,paidAmount,balanceAmount,status:balanceAmount===0?"PAID":paidAmount>0?"PARTIAL":"PENDING"}
    });
    const installmentAmount = Math.round((finalAmount/3)*100)/100;
    for (let n=1;n<=3;n++) {
      const amount = n===3 ? Math.round((finalAmount-installmentAmount*2)*100)/100 : installmentAmount;
      const dueDate = new Date(2026, n+1, 10);
      await db.feeInstallment.upsert({
        where:{feeLedgerId_installmentNo:{feeLedgerId:ledger.id,installmentNo:n}},
        update:{amount,dueDate},
        create:{feeLedgerId:ledger.id,installmentNo:n,amount,dueDate,status:"PENDING"}
      });
    }
  }

  for (let i=0;i<Math.min(12,employeeUsers.length);i++) {
    const assignee = employeeUsers[i+3]?.user || employeeUsers[i].user;
    const creator = employeeUsers[0].user;
    const existing = await db.employeeTask.findFirst({where:{title:`DEMO Task ${i+1}`,assigneeId:assignee.id}});
    if (!existing) await db.employeeTask.create({
      data:{title:`DEMO Task ${i+1}`,description:"Database-backed demo task for RCLD ERP testing.",assigneeId:assignee.id,createdById:creator.id,priority:i%4===0?"HIGH":"NORMAL",status:i%3===0?"IN_PROGRESS":"TODO",dueAt:new Date(2026,10,(i%20)+1)}
    });
  }

  console.log("Demo dataset ready: 200 students, 20 employees, course batches, enrollments, fee ledgers, installments, faculty mappings and tasks.");
  console.log("Demo logins use @rcld.test emails. The demo dataset is stored in the configured backend database.");
}

async function main() {
  for (const key of permissions) await db.permission.upsert({where:{key},update:{},create:{key}});
  const superadmin = await ensureRole("SUPERADMIN","Full institutional control",permissions);
  const user=await db.user.findFirst({where:{userRoles:{some:{roleId:superadmin.id}}}});
  if(!user) throw new Error("An existing Superadmin account is required before loading demo data.");
  const email=user.email;
  await db.userRole.upsert({where:{userId_roleId:{userId:user.id,roleId:superadmin.id}},update:{},create:{userId:user.id,roleId:superadmin.id}});

  const organization = await db.organization.upsert({where:{code:"RCLD"},update:{name:"RCLD Islampur",active:true},create:{code:"RCLD",name:"RCLD Islampur",active:true}});
  const centre = await db.centre.upsert({where:{code:"ISL"},update:{organizationId:organization.id,name:"RCLD Islampur",active:true},create:{organizationId:organization.id,code:"ISL",name:"RCLD Islampur",active:true}});
  const session = await db.academicSession.upsert({where:{centreId_name:{centreId:centre.id,name:"2026-27"}},update:{active:true},create:{centreId:centre.id,name:"2026-27",startsAt:new Date("2026-04-01"),endsAt:new Date("2027-03-31"),active:true}});
  const departmentNames=["Administration","Teaching/Faculty","Accounts","IT","Marketing","HR","Other"];
  const departments={};
  for(const name of departmentNames) departments[name]=await db.department.upsert({where:{centreId_name:{centreId:centre.id,name}},update:{active:true},create:{centreId:centre.id,name,active:true}});
  const skillNames=["fundamentals","DOS","windows","ms word","ms excel","ms power point","ms access","blue java","html","internet and email","c programming","javascript","python","sql","visual basics","vb.net","ms outlook","corel draw","photoshop","tally erp 9","gen ai tools","hardware","networking","cctv installation","cyber security","online works","scratch","css","java","android development"];
  const skills=[];
  for(const name of skillNames) skills.push(await db.skill.upsert({where:{name},update:{active:true},create:{name,active:true}}));

  for (const course of courses) {
    await db.course.upsert({
      where:{code:course.code},
      update:{name:course.name,standardFee:course.standardFee,deliveryMode:"HYBRID",discountType:"NONE",discountValue:null,discountActive:false,active:true,onlinePublished:true,displayOrder:course.displayOrder},
      create:{code:course.code,name:course.name,standardFee:course.standardFee,deliveryMode:"HYBRID",discountType:"NONE",discountValue:null,discountActive:false,active:true,onlinePublished:true,displayOrder:course.displayOrder,features:["Practical learning","Structured lessons","Student resources"]}
    });
  }

  await seedDemoData("RcldDemo@321",{centre,session,departments,skills});
  console.log("RCLD seeded:",email);
}
main().catch((error)=>{console.error(error);process.exitCode=1;}).finally(()=>db.$disconnect());
