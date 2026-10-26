import { db } from "@/lib/db";

export async function evaluateCourseCompletion({studentId,courseId,batchId}){
 const [ledger,chapters,progress,exams,attempts]=await Promise.all([
  db.feeLedger.findFirst({where:{studentId,batchEnrollment:{batch:{courseId,...(batchId?{id:batchId}:{})}}},orderBy:{createdAt:"desc"}}),
  db.chapter.count({where:{subject:{courseId},active:true}}),
  batchId?db.chapterProgress.count({where:{batchId,status:"COMPLETED",chapter:{subject:{courseId},active:true}}}):Promise.resolve(0),
  db.exam.findMany({where:{published:true,OR:[{courseId},...(batchId?[{batchId}]:[])]},select:{id:true}}),
  db.examAttempt.findMany({where:{studentId,status:"GRADED",exam:{OR:[{courseId},...(batchId?[{batchId}]:[])]}},select:{examId:true,passed:true,score:true}})
 ]);
 const examIds=exams.map(e=>e.id);
 const passedExamIds=new Set(attempts.filter(a=>a.passed).map(a=>a.examId));
 const feesCleared=!ledger||Number(ledger.balanceAmount)<=0;
 const chaptersCompleted=batchId?(chapters===0||progress>=chapters):true;
 const examsPassed=examIds.length===0||examIds.every(id=>passedExamIds.has(id));
 return {eligible:feesCleared&&chaptersCompleted&&examsPassed,feesCleared,chaptersCompleted,examsPassed,chapterTotal:chapters,chapterCompleted:progress,requiredExamCount:examIds.length,passedExamCount:examIds.filter(id=>passedExamIds.has(id)).length};
}
