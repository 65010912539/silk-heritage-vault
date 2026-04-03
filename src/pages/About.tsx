import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { GraduationCap, BookOpen, Sparkles } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-background py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* Header */}
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary-foreground mb-4">
              <Sparkles size={16} className="text-secondary" />
              <span className="text-sm font-medium">Thai Silk Heritage</span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">เกี่ยวกับเรา</h1>
            <p className="text-muted-foreground text-base md:text-lg">ระบบบันทึกลายผ้าไหมไทยภาคอีสาน</p>
          </div>

          {/* ความสำคัญของเว็บไซต์ */}
          <section className="bg-card rounded-xl shadow-card p-6 md:p-8 mb-6 md:mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-secondary/20 w-12 h-12 rounded-full flex items-center justify-center shrink-0">
                <BookOpen size={24} className="text-secondary" />
              </div>
              <h2 className="font-heading text-xl md:text-2xl font-bold text-card-foreground">ความสำคัญของเว็บไซต์นี้</h2>
            </div>
            <div className="space-y-4 text-foreground leading-relaxed text-sm md:text-base">
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
          <section className="bg-card rounded-xl shadow-card p-6 md:p-8 mb-6 md:mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            <h2 className="font-heading text-xl md:text-2xl font-bold text-card-foreground mb-6 text-center">ข้อมูลผู้พัฒนา</h2>
            <div className="bg-muted rounded-xl p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-6">
                <div className="shrink-0">
                  <div className="bg-secondary/20 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto">
                    <GraduationCap size={36} className="text-secondary" />
                  </div>
                </div>
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="font-heading text-lg md:text-xl font-bold text-foreground">นายเกียรติศักดิ์ มูลบัวภา</h3>
                  <div className="space-y-1 text-sm md:text-base text-foreground">
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
          <section className="bg-card rounded-xl shadow-card p-6 md:p-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
            <h2 className="font-heading text-xl md:text-2xl font-bold text-card-foreground mb-6 text-center">อาจารย์ที่ปรึกษา</h2>
            <div className="bg-muted rounded-xl p-5 md:p-6 text-center">
              <div className="bg-secondary/20 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} className="text-secondary" />
              </div>
              <h3 className="font-heading text-lg md:text-xl font-bold text-foreground">อาจารย์ ปวรปรัชญ์ หงสากล</h3>
              <p className="text-muted-foreground mt-2 text-sm md:text-base">อาจารย์ที่ปรึกษาโครงงาน</p>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
