import { Upload, Search, Bell, User, Image, CheckCircle, LogIn, UserPlus } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: '1. สมัครสมาชิก',
    desc: 'กรอกข้อมูลส่วนตัว เลือกประเภท "ผู้ใช้งาน" และสร้างรหัสผ่าน จากนั้นระบบจะสร้างบัญชีให้คุณอัตโนมัติ',
  },
  {
    icon: LogIn,
    title: '2. เข้าสู่ระบบ',
    desc: 'กรอก Username และ รหัสผ่าน ที่สมัครไว้ ระบบจะพาคุณไปยังหน้า Dashboard โดยอัตโนมัติ',
  },
  {
    icon: Upload,
    title: '3. อัปโหลดลายผ้า',
    desc: 'ไปที่เมนู "อัปโหลดลาย" เลือกรูปภาพลายผ้า (สามารถเลือกได้หลายรูป) กรอกชื่อลาย เลือกจังหวัด และเพิ่มหมายเหตุ แล้วกดอัปโหลด',
  },
  {
    icon: Image,
    title: '4. ดูลายของฉัน',
    desc: 'ไปที่เมนู "ลายของฉัน" เพื่อดูลายผ้าที่คุณอัปโหลดทั้งหมด พร้อมสถานะ (รอตรวจสอบ / อนุมัติ / ปฏิเสธ)',
  },
  {
    icon: Bell,
    title: '5. ติดตามการแจ้งเตือน',
    desc: 'ระบบจะแจ้งเตือนเมื่อผู้เชี่ยวชาญตรวจสอบลายผ้าของคุณเสร็จ ไปดูได้ที่เมนู "การแจ้งเตือน"',
  },
  {
    icon: Search,
    title: '6. สำรวจคลังลายผ้า',
    desc: 'ไปที่หน้า "คลังลายผ้า" เพื่อค้นหาและเรียนรู้ลายผ้าไหมที่ผ่านการตรวจสอบแล้วจากทั่วภาคอีสาน',
  },
  {
    icon: User,
    title: '7. แก้ไขโปรไฟล์',
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
