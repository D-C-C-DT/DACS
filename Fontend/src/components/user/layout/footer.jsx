import './css/footer.css';
import { Layout, Row, Col } from "antd";
import { Link } from 'react-router-dom';
import { FacebookOutlined, YoutubeOutlined, InstagramOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';

const Footer = () => {
    const { Footer } = Layout;

    return (
        <Footer className='vus-footer'>
            <Row gutter={[32, 32]} className="footer-content">
                {/* Cột 1: Logo và mô tả */}
                <Col xs={24} sm={12} md={6}>
                    <div className="footer-logo">
                        <Link to="/">
                            <span className="footer-logo-text">🧠 English Learning</span>
                        </Link>
                    </div>
                    <p className="footer-desc">
                        Trung tâm Anh ngữ  - Đưa bạn đến gần hơn với thế giới qua các khóa học chất lượng cao.
                    </p>
                </Col>

                {/* Cột 2: Liên kết nhanh */}
                <Col xs={24} sm={12} md={6}>
                    <h4 className="footer-title">Liên Kết Nhanh</h4>
                    <ul className="footer-links">
                        <li><Link to="/courses">Khóa Học</Link></li>
                        <li><Link to="/about">Giới Thiệu</Link></li>
                        <li><Link to="/contact">Liên Hệ</Link></li>
                        <li><Link to="/faq">FAQ</Link></li>
                    </ul>
                </Col>

                {/* Cột 3: Thông tin liên hệ */}
                <Col xs={24} sm={12} md={6}>
                    <h4 className="footer-title">Liên Hệ</h4>
                    <ul className="footer-contact">
                        <li>
                            <EnvironmentOutlined /> 123 Đường ABC, Quận 1, TP.HCM
                        </li>
                        <li>
                            <PhoneOutlined /> 0123 456 789
                        </li>
                        <li>
                            <MailOutlined /> support@vus.edu.vn
                        </li>
                    </ul>
                </Col>

                {/* Cột 4: Mạng xã hội */}
                <Col xs={24} sm={12} md={6}>
                    <h4 className="footer-title">Theo Dõi Chúng Tôi</h4>
                    <div className="footer-social">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                            <FacebookOutlined className="social-icon" />
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                            <YoutubeOutlined className="social-icon" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            <InstagramOutlined className="social-icon" />
                        </a>
                    </div>
                </Col>
            </Row>

            {/* Copyright */}
            <div className="footer-copyright">
                <p>© {new Date().getFullYear()} VUS Learning. All Rights Reserved.</p>
            </div>
        </Footer>
    );
};

export default Footer;