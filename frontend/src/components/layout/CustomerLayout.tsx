import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function CustomerLayout() {
  return (
    <div className="customer-layout">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="customer-footer">
        <div className="footer-upper">
          <div className="footer-columns">
            <div className="footer-col">
              <h3 className="footer-col-title">Smiling Brunch</h3>
              <p className="footer-col-text">早午餐線上點餐系統</p>
              <p className="footer-col-text">提供線上菜單、購物車、訂單查詢與後台管理功能。</p>
            </div>
            <div className="footer-col">
              <h3 className="footer-col-title">營業資訊</h3>
              <p className="footer-col-text">營業時間：週一至週日 06:00 – 14:00</p>
              <p className="footer-col-text">服務方式：外帶・內用</p>
              <p className="footer-col-text">線上訂餐：營業時間內開放</p>
            </div>
            <div className="footer-col">
              <h3 className="footer-col-title">顧客服務</h3>
              <p className="footer-col-text">客服時間：週一至週日 06:00 – 14:00</p>
              <p className="footer-col-text">訂單問題請洽櫃台人員</p>
              <p className="footer-col-text">餐點圖片僅供參考</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 Smiling Brunch. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
