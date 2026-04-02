import { LayoutDashboard, Upload, Image, Bell, User } from 'lucide-react';

const steps = [
  {
    icon: LayoutDashboard,
    title: '1. แดชบอร์ด',
    desc: 'หน้ารวมภาพรวมทั้งหมดของระบบ ใช้ตรวจสอบสถานะล่าสุดและสถิติข้อมูลต่างๆของบัญชีของคุณ',
  },
  {
    icon: Upload,
    title: '2. อัปโหลดลาย',
    desc: 'ไปที่เมนู "อัปโหลดลาย" เลือกรูปภาพลายผ้า (สามารถเลือกได้หลายรูป) กรอกชื่อลาย เลือกจังหวัด และเพิ่มหมายเหตุ แล้วกดอัปโหลด เพื่อรอการตรวจสอบจากผู้เชี่ยวชาญ',
  },
  {
    icon: Image,
    title: '3. ลายของฉัน',
    desc: 'ไปที่เมนู "ลายของฉัน" เพื่อดูลายผ้าที่คุณอัปโหลดทั้งหมด พร้อมสถานะของลายผ้าที่ได้ทำการอัพโหลดไว้ (รอตรวจสอบ / อนุมัติ / ปฏิเสธ)',
  },
  {
    icon: Bell,
    title: '4. การแจ้งเตือน',
    desc: 'ระบบจะแจ้งเตือนเมื่อผู้เชี่ยวชาญตรวจสอบลายผ้าของคุณเสร็จ ไปดูได้ที่เมนู "การแจ้งเตือน"',
  },
  {
    icon: User,
    title: '5. โปรไฟล์',
    desc: 'ไปที่เมนู "โปรไฟล์" เพื่อเพิ่มคำอธิบายตัวเอง และดูข้อมูลบัญชีของคุณ',
  },
];

const UserGuide = () => (
  <div>
    <h1 className="font-heading text-2xl font-bold text-foreground mb-6">คู่มือการใช้งาน (ผู้ใช้งานทั่วไป)</h1>
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

export default UserGuide;
