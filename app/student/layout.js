import { getCurrentStudent } from "@/lib/student-auth";
import StudentSidebar from "@/components/student-sidebar";
import AiAssistant from "@/components/ai-assistant";

export default async function StudentLayout({ children }) {
  const student = await getCurrentStudent();

  // Authentication pages must stay public. Only render the protected
  // student shell when a valid student session exists.
  if (!student) {
    return children;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <StudentSidebar student={student} />
      <div className="min-h-screen lg:pl-[270px]">{children}<AiAssistant /></div>
    </div>
  );
}
