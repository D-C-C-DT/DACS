import { Card, Col, Row, Spin, Rate, notification, Progress, Button, Empty, Divider } from 'antd';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOutlined, TrophyOutlined, PlayCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getUserCourseApi } from '../../services/api.user.service';
import { AuthContext } from '../../components/context/auth.context';
import { checkUserHasAddedCourse } from '../../services/api.course.service';
import { getUserReviewApi } from '../../services/api.review.service';
import ReviewUpdateModal from '../../components/user/mycourse/update.review.modal';
import Footer from '../../components/user/layout/footer';
import { getCompletionPercetageApi } from '../../services/api.progress.service';
import Header from '../../components/user/layout/header';
import './mycourse.css';

const { Meta } = Card;

const MyCoursePage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserCourses();
    }, []);

    const fetchUserCourses = async () => {
        try {
            const res = await getUserCourseApi(user._id);
            if (res.data) {
                const coursesWithProgress = await Promise.all(
                    res.data.courseInfo.map(async (course) => {
                        const rateRes = await getUserReviewApi(user._id, course._id);
                        const userRating = rateRes.data.review ? rateRes.data.review.rating : 0;

                        const completionRes = await getCompletionPercetageApi(user._id, course._id);
                        const completionPercentage = completionRes.data.completionPercentage || 0;

                        return {
                            ...course,
                            userRating,
                            completionPercentage,
                            ratingLabel: 'Xếp hạng của bạn',
                        };
                    })
                );
                setCourses(coursesWithProgress);
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Không thể tải khóa học. Vui lòng thử lại sau.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRatingUpdate = async (newRating) => {
        setCourses((prevCourses) =>
            prevCourses.map((course) =>
                course._id === selectedCourse._id ? { ...course, userRating: newRating } : course
            )
        );
        setIsModalUpdateOpen(false);
        await fetchUserCourses();
    };

    const handleReviewClick = (event, course) => {
        event.stopPropagation();
        if (user._id) {
            setSelectedCourse(course);
            setIsModalUpdateOpen(true);
        } else {
            notification.error({
                message: 'Lỗi',
                description: 'Bạn cần đăng nhập để đánh giá',
            });
        }
    };

    const handleCardClick = async (courseId) => {
        const userId = user._id;
        const res = await checkUserHasAddedCourse(courseId, userId);
        if (res.data.enrolled) {
            navigate(`/course/${courseId}/learning`, { state: { from: window.location.pathname } });
        } else {
            navigate(`/course/detail/${courseId}`);
        }
    };

    const handleMouseEnter = (courseId) => {
        setCourses((prevCourses) =>
            prevCourses.map((course) =>
                course._id === courseId ? { ...course, ratingLabel: 'Chỉnh sửa xếp hạng của bạn' } : course
            )
        );
    };

    const handleMouseLeave = (courseId) => {
        setCourses((prevCourses) =>
            prevCourses.map((course) =>
                course._id === courseId ? { ...course, ratingLabel: 'Xếp hạng của bạn' } : course
            )
        );
    };

    const getActionButton = (course) => {
        return course.completionPercentage < 100 ? (
            <Button 
                type="primary" 
                icon={<PlayCircleOutlined />}
                onClick={() => handleCardClick(course._id)} 
                style={{ marginTop: '16px', width: '100%' }}
                size="large"
            >
                Tiếp tục học
            </Button>
        ) : (
            <Button 
                type="default" 
                icon={<CheckCircleOutlined />}
                onClick={() => handleCardClick(course._id)} 
                style={{ marginTop: '16px', width: '100%' }}
                size="large"
            >
                Xem chi tiết
            </Button>
        );
    };

    const CourseCard = ({ course }) => (
        <Card
            hoverable
            cover={
                <div style={{ position: 'relative' }}>
                    <img
                        src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${course.avatar}`}
                        alt={course.name}
                        style={{ borderRadius: '16px 16px 0 0', height: '200px', objectFit: 'cover', width: '100%' }}
                    />
                </div>
            }
            className="course-card"
            data-completed={course.completionPercentage === 100}
        >
            <Meta 
                title={course.name} 
                description={course.description || 'Mô tả chưa có'} 
            />
            <div className="card-content">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <Rate
                        allowHalf
                        value={course.userRating || 0}
                        style={{ fontSize: '16px' }}
                    />
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                        {course.completionPercentage}% hoàn thành
                    </span>
                </div>
                
                <p
                    onClick={(event) => handleReviewClick(event, course)}
                    onMouseEnter={() => handleMouseEnter(course._id)}
                    onMouseLeave={() => handleMouseLeave(course._id)}
                    className="rating-label"
                >
                    {course.ratingLabel}
                </p>
                
                <Progress
                    percent={course.completionPercentage}
                    status={course.completionPercentage === 100 ? 'success' : 'active'}
                    strokeColor={
                        course.completionPercentage === 100 
                            ? '#10B981'
                            : {
                                '0%': '#E30613',
                                '100%': '#FF4757',
                            }
                    }
                    trailColor="#e2e8f0"
                    strokeWidth={8}
                    style={{ margin: '16px 0' }}
                />
                
                {getActionButton(course)}
            </div>
        </Card>
    );

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: '60vh',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    const inProgressCourses = courses.filter(course => course.completionPercentage < 100);
    const completedCourses = courses.filter(course => course.completionPercentage === 100);

    return (
        <>
            <Header />
            <div className="my-course-container">
                <div className="title-section">
                    <h2 className="title-course">
                        <BookOutlined style={{ marginRight: '12px' }} />
                        Khóa học của bạn
                    </h2>
                    {courses.length > 0 && (
                        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px', margin: 0 }}>
                            Bạn đang tham gia {courses.length} khóa học
                        </p>
                    )}
                </div>

                <div className="card-container">
                    {inProgressCourses.length > 0 ? (
                        <Row gutter={[24, 24]} justify="start">
                            {inProgressCourses.map((course) => (
                                <Col key={course._id} xs={24} sm={12} md={8} lg={6}>
                                    <CourseCard course={course} />
                                </Col>
                            ))}
                        </Row>
                    ) : courses.length === 0 ? (
                        <div className="no-courses">
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <span style={{ fontSize: '18px', color: '#64748b' }}>
                                        Bạn chưa tham gia khóa học nào
                                    </span>
                                }
                            >
                                <Button 
                                    type="primary" 
                                    size="large"
                                    onClick={() => navigate('/courses')}
                                >
                                    Khám phá khóa học
                                </Button>
                            </Empty>
                        </div>
                    ) : null}

                    {completedCourses.length > 0 && (
                        <>
                            <div className="title-section">
                                <h2 className="title-course">
                                    <TrophyOutlined style={{ marginRight: '12px', color: '#FFD700' }} />
                                    Các khóa học đã hoàn thành
                                </h2>
                                <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>
                                    Chúc mừng! Bạn đã hoàn thành {completedCourses.length} khóa học
                                </p>
                            </div>
                            <Row gutter={[24, 24]} justify="start">
                                {completedCourses.map((course) => (
                                    <Col key={course._id} xs={24} sm={12} md={8} lg={6}>
                                        <CourseCard course={course} />
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}
                </div>

                {selectedCourse && (
                    <ReviewUpdateModal
                        visible={isModalUpdateOpen}
                        onClose={() => setIsModalUpdateOpen(false)}
                        courseId={selectedCourse._id}
                        onRatingUpdate={handleRatingUpdate}
                    />
                )}
            </div>
            <Footer />
        </>
    );
};

export default MyCoursePage;