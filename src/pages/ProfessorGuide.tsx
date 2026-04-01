import { ClipboardCheck, Clock, CheckCircle, XCircle, Bell, User, LogIn, UserPlus, Search } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: '1. สมัครสมาชิกเป็นผู้เชี่ยวชาญ',
    desc: 'กรอกข้อมูลส่วนตัว เลือกประเภท "ผู้เชี่ยวชาญ" กรอกประสบการณ์ อัปโหลดเอกสารประวัติการทำงาน (PDF) และรูปยืนยันตัวตน จากนั้นรอการอนุมัติจากผู้ดูแลระบบ',
  },
  {
    icon: LogIn,
    title: '2. เข้าสู่ระบบ',
    desc: 'เมื่อบัญชีได้รับการอนุมัติแล้ว ให้กรอก Username และรหัสผ่านเพื่อเข้าสู่ระบบ',
  },
  {
    icon: ClipboardCheck,
    title: '3. ดูแดชบอร์ด',
    desc: 'หน้าแดชบอร์ดจะแสดงสถิติการตรวจสอบของคุณ เช่น จำนวนลายที่รอตรวจ อนุมัติแล้ว และปฏิเสธ',
  },
  {
    icon: Clock,
    title: '4. ตรวจสอบลายผ้า',
    desc: 'ไปที่เมนู "รอตรวจสอบ" เลือกลายผ้าที่ต้องการตรวจ ดูรูปภาพและข้อมูล สามารถกรอก "รายละเอียดจากผู้เชี่ยวชาญ" แล้วเลือก อนุมัติ หรือ ปฏิเสธ',
  },
  {
    icon: CheckCircle,
    title: '5. ดูลายที่ตรวจแล้ว',
    desc: 'ไปที่เมนู "ตรวจแล้ว" เพื่อดูประวัติการตรวจสอบลายผ้าของคุณทั้งหมด',
  },
  {
    icon: Bell,
    title: '6. ติดตามการแจ้งเตือน',
    desc: 'ระบบจะแจ้งเตือนเมื่อมีผู้ใช้อัปโหลดลายผ้าเข้ามาใหม่ ให้คุณเข้าไปตรวจสอบได้ทันที',
  },
  {
    icon: Search,
    title: '7. สำรวจคลังลายผ้า',
    desc: 'ไปที่หน้า "คลังลายผ้า" เพื่อดูลายผ้าทั้งหมดที่ผ่านการอนุมัติแล้ว',
  },
  {
    icon: User,
    title: '8. แก้ไขโปรไฟล์',
    desc: 'ไปที่เมนู "โปรไฟล์" เพื่อแก้ไขข้อมูลส่วนตัวของคุณ',
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
