import { Card, Col, Row, Rate, Spin, Tag, Typography, Switch, Button, Popover } from 'antd';
import { RightOutlined, LeftOutlined, PlayCircleOutlined, UserOutlined, StarFilled, BookOutlined, TeamOutlined, GiftOutlined } from '@ant-design/icons';
import { useState, useEffect, useContext } from 'react';
import { checkUserHasAddedCourse, fetchAllCourseApi, fetchCourseById } from '../../services/api.course.service';
import { useNavigate } from 'react-router-dom';
import Slide from '../../components/user/layout/slide';
import { AuthContext } from '../../components/context/auth.context';
import Footer from '../../components/user/layout/footer';
import Header from '../../components/user/layout/header';
import './home.css';

const MainPage = () => {
  const [loading, setLoading] = useState(true);
  const [dataCourseFree, setDataCourseFree] = useState([]);
  const [dataCoursePaid, setDataCoursePaid] = useState([]);
  const { Title, Text } = Typography;
  const { Meta } = Card;
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [darkMode, setDarkMode] = useState(false);
  const [currentIndexFree, setCurrentIndexFree] = useState(0);
  const [currentIndexPaid, setCurrentIndexPaid] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    loadCourse();
  }, []);

  const loadCourse = async () => {
    const res = await fetchAllCourseApi();
    if (res.data) {
      const freeCourses = res.data.result.filter((course) => course.price === 0);
      const paidCourses = res.data.result.filter((course) => course.price > 0);
      setDataCourseFree(freeCourses);
      setDataCoursePaid(paidCourses);
    }
    setLoading(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode', !darkMode);
  };

  const content = (
    <div className="theme-switcher">
      <Text className="theme-label">Chế độ màu</Text>
      <Switch
        checked={darkMode}
        onChange={toggleDarkMode}
        checkedChildren="🌙"
        unCheckedChildren="☀️"
        className="theme-switch"
      />
    </div>
  );

  const handleCardClick = async (courseId) => {
    const userId = user?._id;
    if (!userId) {
      const res = await fetchCourseById(courseId);
      if (res) navigate(`/course/detail/${courseId}`);
      return;
    }
    const res = await checkUserHasAddedCourse(courseId, userId);
    if (res.data.enrolled) {
      navigate(`course/${courseId}/learning`, { state: { from: window.location.pathname } });
    } else {
      navigate(`/course/detail/${courseId}`);
    }
  };

  const handleNextFree = () => {
    if (currentIndexFree < dataCourseFree.length - 4) {
      setCurrentIndexFree(currentIndexFree + 1);
    }
  };

  const handlePrevFree = () => {
    if (currentIndexFree > 0) {
      setCurrentIndexFree(currentIndexFree - 1);
    }
  };

  const handleNextPaid = () => {
    if (currentIndexPaid < dataCoursePaid.length - 4) {
      setCurrentIndexPaid(currentIndexPaid + 1);
    }
  };

  const handlePrevPaid = () => {
    if (currentIndexPaid > 0) {
      setCurrentIndexPaid(currentIndexPaid - 1);
    }
  };

  const CourseCard = ({ course, index, isPaid = false }) => (
    <Col key={index} xs={24} sm={12} md={8} lg={6} className="col-centered">
      <Card
        onClick={() => handleCardClick(course._id)}
        hoverable
        className={`course-card modern-card ${hoveredCard === course._id ? 'hovered' : ''}`}
        onMouseEnter={() => setHoveredCard(course._id)}
        onMouseLeave={() => setHoveredCard(null)}
        cover={
          <div className="course-image-container">
            <img
              alt={course.name}
              src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${course.avatar}`}
              loading="lazy"
              className="course-image"
            />
            <div className="course-overlay">
              <PlayCircleOutlined className="play-icon" />
              <div className="overlay-text">Xem chi tiết</div>
            </div>
            {isPaid && course.price > 0 && (
              <div className="price-badge">
                {course.price.toLocaleString()} VND
              </div>
            )}
            {!isPaid && (
              <div className="free-badge">
                Miễn Phí
              </div>
            )}
          </div>
        }
        actions={[
          <div key="rating" className="card-stats">
            <div className="rating-container">
              <StarFilled className="star-icon" />
              <span>{course.totalStar || 0}</span>
            </div>
            <div className="students-container">
              <UserOutlined className="user-icon" />
              <span>{course.totalStudent || 0}</span>
            </div>
          </div>
        ]}
      >
        <div className="course-content">
          <Title level={4} className="course-title" ellipsis={{ rows: 2 }}>
            {course.name}
          </Title>
          <Text className="course-description" ellipsis={{ rows: 2 }}>
            {course.shortDescription}
          </Text>
        </div>
      </Card>
    </Col>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" className="loading-spinner" />
        <Text className="loading-text">Đang tải khóa học...</Text>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Slide />
      <div className="main-container modern-main">
        <Popover content={content} trigger="click" placement="bottomRight">
          <Button className="theme-toggle-btn" shape="circle" icon={darkMode ? "🌙" : "☀️"} />
        </Popover>
        
        {/* Hero Stats Section */}
        <section className="hero-stats">
          <div className="stats-container">
            <div className="stat-card" data-aos="fade-up" data-aos-delay="100">
              <BookOutlined className="stat-icon" />
              <div className="stat-number">{dataCourseFree.length + dataCoursePaid.length}</div>
              <div className="stat-label">Khóa Học</div>
            </div>
            <div className="stat-card" data-aos="fade-up" data-aos-delay="200">
              <TeamOutlined className="stat-icon" />
              <div className="stat-number">
                {dataCourseFree.reduce((sum, course) => sum + (course.totalStudent || 0), 0) + 
                 dataCoursePaid.reduce((sum, course) => sum + (course.totalStudent || 0), 0)}
              </div>
              <div className="stat-label">Học Viên</div>
            </div>
            <div className="stat-card" data-aos="fade-up" data-aos-delay="300">
              <GiftOutlined className="stat-icon" />
              <div className="stat-number">{dataCourseFree.length}</div>
              <div className="stat-label">Miễn Phí</div>
            </div>
          </div>
        </section>

        {/* Free Courses Section */}
        <section className="course-section modern-section" data-parallax="0.1">
          <div className="section-header">
            <div className="title-container modern-title">
              <Title level={2} className="section-title">
                <span className="title-gradient">Khóa Học Miễn Phí</span>
              </Title>
              <Tag color="magenta" className="modern-tag popular-tag">
                🔥 PHỔ BIẾN
              </Tag>
            </div>
            <div className="navigation-controls">
              <Button
                className={`nav-btn prev-btn ${currentIndexFree === 0 ? 'disabled' : ''}`}
                onClick={handlePrevFree}
                disabled={currentIndexFree === 0}
                shape="circle"
                icon={<LeftOutlined />}
              />
              <Button
                className={`nav-btn next-btn ${currentIndexFree >= dataCourseFree.length - 4 ? 'disabled' : ''}`}
                onClick={handleNextFree}
                disabled={currentIndexFree >= dataCourseFree.length - 4}
                shape="circle"
                icon={<RightOutlined />}
              />
            </div>
          </div>
          
          <div className="courses-carousel">
            <div 
              className="courses-track" 
              style={{ transform: `translateX(-${currentIndexFree * 25}%)` }}
            >
              {dataCourseFree.map((course, index) => (
                <CourseCard key={course._id} course={course} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Paid Courses Section */}
        <section className="course-section modern-section" data-parallax="0.15">
          <div className="section-header">
            <div className="title-container modern-title">
              <Title level={2} className="section-title">
                <span className="title-gradient">Khóa Học Premium</span>
              </Title>
              <Tag color="gold" className="modern-tag premium-tag">
                ⭐ CHẤT LƯỢNG CAO
              </Tag>
            </div>
            <div className="navigation-controls">
              <Button
                className={`nav-btn prev-btn ${currentIndexPaid === 0 ? 'disabled' : ''}`}
                onClick={handlePrevPaid}
                disabled={currentIndexPaid === 0}
                shape="circle"
                icon={<LeftOutlined />}
              />
              <Button
                className={`nav-btn next-btn ${currentIndexPaid >= dataCoursePaid.length - 4 ? 'disabled' : ''}`}
                onClick={handleNextPaid}
                disabled={currentIndexPaid >= dataCoursePaid.length - 4}
                shape="circle"
                icon={<RightOutlined />}
              />
            </div>
          </div>
          
          <div className="courses-carousel">
            <div 
              className="courses-track" 
              style={{ transform: `translateX(-${currentIndexPaid * 25}%)` }}
            >
              {dataCoursePaid.map((course, index) => (
                <CourseCard key={course._id} course={course} index={index} isPaid />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-content">
            <Title level={2} className="cta-title">
              Sẵn sàng bắt đầu hành trình học tập?
            </Title>
            <Text className="cta-description">
              Khám phá hàng trăm khóa học chất lượng cao và nâng cao kỹ năng của bạn ngay hôm nay
            </Text>
            <Button 
              type="primary" 
              size="large" 
              className="cta-button"
              onClick={() => navigate('/courses')}
            >
              Khám Phá Ngay
            </Button>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default MainPage;