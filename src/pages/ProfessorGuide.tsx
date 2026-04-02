import { LayoutDashboard, ClipboardCheck, ListChecks, Bell, User } from 'lucide-react';

const steps = [
  {
    icon: LayoutDashboard,
    title: '1. แดชบอร์ด',
    desc: 'หน้าภาพรวมแสดงสถิติการตรวจสอบของคุณ เช่น จำนวนลายที่รอตรวจ อนุมัติแล้ว และปฏิเสธ ของลายผ้าที่อัพโหลดมาทั้งหมด',
  },
  {
    icon: ClipboardCheck,
    title: '2. ตรวจสอบลายผ้า',
    desc: 'ไปที่เมนู "รอตรวจสอบ" เลือกลายผ้าที่ต้องการตรวจ ดูรูปภาพและข้อมูล สามารถกรอก "รายละเอียดจากผู้เชี่ยวชาญ" แล้วเลือก อนุมัติ หรือ ปฏิเสธ ถ้าทำการกดอนุมัติลายผ้านั้นจะเข้าสู่คลังลายผ้าทันที',
  },
  {
    icon: ListChecks,
    title: '3. ดูลายที่ตรวจแล้ว',
    desc: 'ไปที่เมนู "ตรวจแล้ว" เพื่อดูประวัติการตรวจสอบลายผ้าของคุณทั้งหมดที่เคยตรวจไว้',
  },
  {
    icon: Bell,
    title: '4. ติดตามการแจ้งเตือน',
    desc: 'ระบบจะแจ้งเตือนเมื่อมีผู้ใช้อัปโหลดลายผ้าเข้ามาใหม่ ให้คุณเข้าไปตรวจสอบได้ทันที',
  },
  {
    icon: User,
    title: '5. โปรไฟล์',
    desc: 'ไปที่เมนู "โปรไฟล์" เพื่อเพิ่มคำอธิบายตัวเอง และดูข้อมูลบัญชีของคุณ',
  },
];

const ProfessorGuide = () => (
  <div>
    <h1 className="font-heading text-2xl font-bold text-foreground mb-6">คู่มือการใช้งาน (ผู้เชี่ยวชาญ)</h1>
    <div className="space-y-4 max-w-2xl">
      {steps.map((step, i) => (
        <div key={i} className="bg-card rounded-lg shadow-card p-5 flex gap-4 items-start">
          <div className="bg-secondary/20 w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center">
            <step.icon size={22} className="text-secondary" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-card-foreground mb-1">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ProfessorGuide;
