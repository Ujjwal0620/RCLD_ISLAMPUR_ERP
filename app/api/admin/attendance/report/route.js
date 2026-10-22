import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function GET(req){
 const user=await getCurrentUser();
 if(!user||!hasPermission(user,"reports.view")) return NextResponse.json({error:"Forbidden"},{status:403});
 const q=new URL(req.url).searchParams; const batchId=q.get("batchId"); const from=q.get("from"); const to=q.get("to");
 if(!batchId||!from||!to) return NextResponse.json({error:"batchId, from and to are required."},{status:400});
 const start=new Date(from+"T00:00:00.000Z"); const end=new Date(to+"T23:59:59.999Z");
 if(start>end) return NextResponse.json({error:"Invalid date range."},{status:400});
 const batch=await db.batch.findUnique({where:{id:batchId},select:{id:true,code:true,name:true,course:{select:{code:true,name:true}}}});
 if(!batch) return NextResponse.json({error:"Batch not found."},{status:404});
 const students=await db.batchEnrollment.findMany({where:{batchId,active:true},select:{student:{select:{id:true,name:true,registrationNo:true}}},orderBy:{student:{name:"asc"}}});
 const records=await db.studentAttendance.findMany({where:{batchId,attendanceDate:{gte:start,lte:end}},select:{studentId:true,attendanceDate:true,status:true}});
 const by=new Map();
 for(const s of students) by.set(s.student.id,{student:s.student,total:0,present:0,absent:0,late:0,excused:0});
 for(const r of records){const x=by.get(r.studentId);if(!x)continue;x.total++;if(r.status==="PRESENT")x.present++;if(r.status==="ABSENT")x.absent++;if(r.status==="LATE")x.late++;if(r.status==="EXCUSED")x.excused++;}
 const rows=[...by.values()].map(x=>({...x,percentage:x.total?Math.round(((x.present+x.late)/x.total)*100):0}));
 return NextResponse.json({batch,from,to,days:new Set(records.map(x=>x.attendanceDate.toISOString().slice(0,10))).size,rows});
}
