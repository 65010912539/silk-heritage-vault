import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { GraduationCap, BookOpen } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl font-bold text-foreground mb-4">เกี่ยวกับเรา</h1>
            <p className="text-muted-foreground text-lg">ระบบบันทึกลายผ้าไหมไทยภาคอีสาน</p>
          </div>

          {/* ความสำคัญของเว็บไซต์ */}
          <section className="bg-card rounded-lg shadow-card p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-secondary/20 w-12 h-12 rounded-full flex items-center justify-center">
                <BookOpen size={24} className="text-secondary" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-card-foreground">ความสำคัญของเว็บไซต์นี้</h2>
            </div>
            <div className="space-y-4 text-foreground leading-relaxed">
              <p>
                เว็บไซต์นี้ถูกพัฒนาขึ้นเพื่อเป็นแหล่งรวบรวมและอนุรักษ์ลวดลายผ้าไหมไทยในรูปแบบดิจิทัล
                โดยมีแนวคิดเสมือน <strong>"พิพิธภัณฑ์ออนไลน์"</strong> ที่เปิดโอกาสให้บุคคลทั่วไปสามารถเข้าถึงข้อมูลลายผ้าได้อย่างสะดวก ทุกที่ ทุกเวลา
              </p>
              <p>
                ในปัจจุบัน ลวดลายผ้าไหมหลายชนิดมีความเสี่ยงที่จะสูญหายไปตามกาลเวลา
                เนื่องจากขาดการบันทึกข้อมูลอย่างเป็นระบบ เว็บไซต์นี้จึงมีบทบาทสำคัญในการจัดเก็บข้อมูลลายผ้าอย่างเป็นระบบ
                พร้อมทั้งเปิดโอกาสให้ผู้ใช้งานสามารถมีส่วนร่วมในการอนุรักษ์
                โดยการอัปโหลดลวดลายผ้าที่ตนเองมีอยู่
              </p>
              <p>
                นอกจากนี้ ระบบยังมีผู้เชี่ยวชาญในการตรวจสอบและยืนยันความถูกต้องของข้อมูล
                เพื่อให้ข้อมูลที่เผยแพร่มีความน่าเชื่อถือ และสามารถนำไปใช้เป็นแหล่งอ้างอิงได้
              </p>
            </div>
          </section>

          {/* ข้อมูลนิสิต */}
          <section className="bg-card rounded-lg shadow-card p-8 mb-8">
            <h2 className="font-heading text-2xl font-bold text-card-foreground mb-6 text-center">ข้อมูลผู้พัฒนา</h2>
            <div className="bg-muted rounded-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="bg-secondary/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
                    <GraduationCap size={40} className="text-secondary" />
                  </div>
                </div>
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="font-heading text-xl font-bold text-foreground">นายเกียรติศักดิ์ มูลบัวภา</h3>
                  <div className="space-y-1 text-foreground">
                    <p><span className="text-muted-foreground">รหัสนิสิต:</span> 65010912539</p>
                    <p><span className="text-muted-foreground">สาขาวิชา:</span> คอมพิวเตอร์ธุรกิจ</p>
                    <p><span className="text-muted-foreground">คณะ:</span> การบัญชีและการจัดการ</p>
                    <p><span className="text-muted-foreground">มหาวิทยาลัย:</span> มหาวิทยาลัยมหาสารคาม</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* อาจารย์ที่ปรึกษา */}
          <section className="bg-card rounded-lg shadow-card p-8">
            <h2 className="font-heading text-2xl font-bold text-card-foreground mb-6 text-center">อาจารย์ที่ปรึกษา</h2>
            <div className="bg-muted rounded-lg p-6 text-center">
              <div className="bg-secondary/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} className="text-secondary" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground">อาจารย์ ปวรปรัชญ์ หงสากล</h3>
              <p className="text-muted-foreground mt-2">อาจารย์ที่ปรึกษาโครงงาน</p>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
