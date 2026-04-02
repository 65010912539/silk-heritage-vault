const Footer = () => (
  <footer className="bg-primary text-primary-foreground py-12">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-heading text-xl font-bold text-secondary mb-3">ThaiSilk</h3>
          <p className="text-primary-foreground/70 text-sm">ระบบบันทึกลายผ้าไหมไทยภาคอีสาน เพื่ออนุรักษ์มรดกทางวัฒนธรรม</p>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3 text-secondary">ลิงก์</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><a href="/" className="hover:text-secondary transition-colors">หน้าแรก</a></li>
            <li><a href="/library" className="hover:text-secondary transition-colors">คลังลายผ้า</a></li>
            <li><a href="/register" className="hover:text-secondary transition-colors">สมัครสมาชิก</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading font-semibold mb-3 text-secondary">ติดต่อ</h4>
          <p className="text-sm text-primary-foreground/70">อีเมล : 65010912539@msu.ac.th</p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
