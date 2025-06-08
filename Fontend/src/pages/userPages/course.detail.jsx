import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
    Rate, Collapse, Spin, Button, Row, Col, List,
    notification, Typography, Space, Pagination, Select, Progress,
    Modal, Radio, Card
} from 'antd';
import { addUserToCourse, fetchCourseById } from '../../services/api.course.service';
import { fetchChapterWithLessAndTest } from '../../services/api.chapter.service';
import { useNavigate } from 'react-router-dom';
import ReviewUpdateModal from '../../components/user/mycourse/update.review.modal';
import { getUserReviewApi, fetchReviewsOfCourseApi } from '../../services/api.review.service';
import { AuthContext } from '../../components/context/auth.context';
import './course.detail.css';
import Footer from '../../components/user/layout/footer';
import { createPayment } from '../../services/api.order.service';
import MomoIcon from '../../../public/MoMo_Logo.png';
import ZaloPayIcon from '../../../public/zalopay-logo.png';

const { Panel } = Collapse;
const { Option } = Select;
const { Text, Title } = Typography;

const CourseDetail = () => {
    const { courseId } = useParams();
    const { user } = useContext(AuthContext);
    const [courseRating, setCourseRating] = useState("");
    const [course, setCourse] = useState("");
    const [chapterLessons, setChapterLessons] = useState({});
    const [loading, setLoading] = useState(true);
    const [ratingLabel, setRatingLabel] = useState('Xếp hạng của bạn');
    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [ratings, setRatings] = useState([]);
    const [selectedRating, setSelectedRating] = useState(null);
    const [filteredReviews, setFilteredReviews] = useState(reviews);
    const [noReviewsFound, setNoReviewsFound] = useState(false);
    const [isPurchaseModalVisible, setIsPurchaseModalVisible] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    const fetchCourseDetails = async () => {
        setLoading(true);
        const res = await fetchCourseById(courseId, { populate: 'lessonInfo' });
        if (res.data) {
            setCourse(res.data);
            setCourseRating(res.data.totalStar);
        }
        await fetchReviews();
        setLoading(false);
    };

    const fetchReviews = async () => {
        setReviewLoading(true);
        try {
            const res = await fetchReviewsOfCourseApi(current, pageSize, courseId);
            if (res.data) {
                setReviews(res.data.reviews);
                setRatings(res.data.ratings);
                setCurrent(res.meta.currentPage);
                setPageSize(res.meta.pageSize);
                setTotal(res.meta.totalEntity);
                setFilteredReviews(res.data.reviews);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách review:", error);
        }
        setReviewLoading(false);
    };

    const handleChapterChange = async (activeKeys) => {
        for (const chapterId of activeKeys) {
            if (!chapterLessons[chapterId]) {
                try {
                    const res = await fetchChapterWithLessAndTest(chapterId);
                    if (res.data) {
                        setChapterLessons((prev) => ({
                            ...prev,
                            [chapterId]: res.data.lessonInfo,
                        }));
                    }
                } catch (error) {
                    console.error(`Lỗi khi lấy bài học của chapter ${chapterId}:`, error);
                }
            }
        }
    };

    const handleRatingUpdate = () => {
        fetchCourseDetails();
        setIsModalUpdateOpen(false);
    };

    const handleOnClickJoin = async () => {
        if (!user._id) {
            navigate('/login');
            return;
        }
        await addUserToCourse(user._id, courseId);
        navigate(`/course/${courseId}/learning`);
    };

    const showPurchaseModal = () => {
        setIsPurchaseModalVisible(true);
    };

    const handlePaymentMethodChange = (e) => {
        setSelectedPaymentMethod(e.target.value);
    };

    const handlePurchaseClick = () => {
        if (!selectedPaymentMethod) {
            notification.error({ message: 'Error', description: 'Vui lòng chọn phương thức thanh toán' });
            return;
        }
        handlePurchase();
        setIsPurchaseModalVisible(false);
    };

    const handlePurchase = async () => {
        try {
            const response = await createPayment(user._id, courseId, course.price);
            if (response.data.payUrl) {
                window.location.href = response.data.payUrl;
            }
        } catch (error) {
            console.error('Lỗi thanh toán:', error);
            notification.error({ message: 'Lỗi', description: 'Thanh toán thất bại, vui lòng thử lại' });
        }
    };

    const handleReviewClick = () => {
        if (user._id) {
            setIsModalUpdateOpen(true);
        } else {
            notification.error({
                message: "Error",
                description: "Bạn cần đăng nhập để đánh giá"
            });
        }
    };

    const handleFilterChange = (value) => {
        setSelectedRating(value);
        if (value) {
            const filtered = reviews.filter((review) => review.rating === value);
            setFilteredReviews(filtered);
            setNoReviewsFound(filtered.length === 0);
        } else {
            setFilteredReviews(reviews);
            setNoReviewsFound(false);
        }
    };

    if (loading) {
        return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
    }

    if (!course) {
        return <div>Không có dữ liệu khóa học</div>;
    }

    return (
        <>
            <div className="course-detail-container">
                <Row gutter={[32, 32]} className="course-detail-wrapper">
                    <Col xs={24} md={5} className="left-column">
                        <Card className="course-card">
                            <img
                                alt={course.name}
                                src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${course.avatar}` || 'default_image_url'}
                                className="course-image"
                            />
                            <Title level={2} className="course-title">{course.name}</Title>
                            <Rate allowHalf disabled defaultValue={courseRating || 0} style={{ margin: '10px 0' }} />
                            {course.price === 0 ? (
                                <Button
                                    onClick={handleOnClickJoin}
                                    type="primary"
                                    size="large"
                                    className="join-button"
                                >
                                    Tham gia khóa học
                                </Button>
                            ) : (
                                <div>
                                    <Text
                                        style={{ display: 'block', margin: '10px 0', fontWeight: 'bold', color: '#fa541c' }}
                                    >
                                        {course.price.toLocaleString()} VND
                                    </Text>
                                    <Button
                                        onClick={showPurchaseModal}
                                        type="primary"
                                        size="large"
                                        className="join-button"
                                    >
                                        Mua khóa học
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </Col>

                    <Col xs={24} md={17} className="right-column">
                        <Card className="content-card">
                            <Title level={2} className="section-title">Mô tả khóa học</Title>
                            <p className="course-description">
                                {course.description || 'Đây là mô tả placeholder cho khóa học.'}
                            </p>
                        </Card>

                        <Card className="content-card">
                            <Title level={2} className="section-title">Danh sách chương</Title>
                            <Collapse
                                onChange={handleChapterChange}
                                className="chapter-collapse"
                                expandIconPosition="right"
                            >
                                {Array.isArray(course.chapterInfo) && course.chapterInfo.map((chapter) => (
                                    <Panel header={chapter.name} key={chapter._id}>
                                        <List
                                            dataSource={chapterLessons[chapter._id] || []}
                                            renderItem={(lesson) => (
                                                <List.Item className="lesson-list-item">
                                                    <Text strong>{lesson.name}</Text>
                                                </List.Item>
                                            )}
                                            bordered
                                        />
                                    </Panel>
                                ))}
                            </Collapse>
                        </Card>

                        <Card className="content-card">
                            <Title level={2} className="section-title">Yêu cầu</Title>
                            <p className="requirements-description">
                                Khóa học tiếng Anh giúp bạn nâng cao kỹ năng nghe, nói, đọc, viết một cách toàn diện, phù hợp cho mọi trình độ từ cơ bản đến nâng cao, giúp tự tin giao tiếp và phát triển sự nghiệp trong môi trường quốc tế.
                            </p>
                        </Card>

                        <Card className="content-card">
                            <Title level={2} className="section-title">Phản hồi của học viên</Title>
                            <div className="rating-stats">
                                {ratings.map((rating) => (
                                    <div key={rating.stars} className="rating-bar">
                                        <Rate disabled value={rating.stars} style={{ fontSize: 16, marginRight: 10 }} />
                                        <Progress
                                            percent={rating.percentage}
                                            showInfo={false}
                                            strokeColor="#fadb14"
                                            style={{ flex: 1, margin: '0 10px', maxWidth: '500px' }}
                                        />
                                        <Text type="secondary">{rating.percentage}%</Text>
                                    </div>
                                ))}
                            </div>
                            <div className="filter-section">
                                <Text strong>Lọc theo sao:</Text>
                                <Select
                                    value={selectedRating}
                                    onChange={handleFilterChange}
                                    placeholder="Chọn số sao"
                                    style={{ width: '200px', marginLeft: '10px' }}
                                >
                                    <Option value={null}>Tất cả</Option>
                                    {ratings.map((rating) => (
                                        <Option key={rating.stars} value={rating.stars}>
                                            {rating.stars} sao
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                            {reviewLoading ? (
                                <Spin size="large" style={{ display: 'block', margin: '20px auto' }} />
                            ) : noReviewsFound ? (
                                <Text type="danger" style={{ textAlign: 'center', display: 'block', marginTop: '20px' }}>
                                    Không tìm thấy đánh giá cho mức sao này.
                                </Text>
                            ) : (
                                <List
                                    dataSource={filteredReviews}
                                    renderItem={(review) => (
                                        <List.Item className="review-item">
                                            <Space direction="vertical">
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <Text strong>{review.username}</Text>
                                                    <Rate
                                                        disabled
                                                        value={review.rating}
                                                        style={{ marginLeft: 10, fontSize: 14 }}
                                                    />
                                                </div>
                                                <Text>{review.content}</Text>
                                                <Text type="secondary">{review.createdAt}</Text>
                                            </Space>
                                        </List.Item>
                                    )}
                                />
                            )}
                            <Pagination
                                style={{ marginTop: '20px', textAlign: 'center' }}
                                current={current}
                                pageSize={pageSize}
                                total={total}
                                onChange={(current, pageSize) => fetchReviews(current, pageSize, courseId)}
                            />
                            <Button
                                type="primary"
                                onClick={handleReviewClick}
                                style={{ marginTop: '20px' }}
                            >
                                Thêm đánh giá
                            </Button>
                        </Card>
                    </Col>
                </Row>
            </div>

            <Modal
                title="Xác nhận thanh toán"
                visible={isPurchaseModalVisible}
                onCancel={() => setIsPurchaseModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsPurchaseModalVisible(false)}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" onClick={handlePurchaseClick}>
                        Thanh toán
                    </Button>,
                ]}
                className="purchase-modal"
            >
                {course ? (
                    <div>
                        <div className="modal-course-info">
                            <img
                                src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${course.avatar}`}
                                alt={course.name}
                                className="modal-course-image"
                            />
                            <div>
                                <Title level={4}>Thông tin khóa học</Title>
                                <Text strong>Tên: {course.name}</Text>
                                <Text strong>Giá: {course.price.toLocaleString()} VND</Text>
                            </div>
                        </div>
                        <Title level={5} style={{ marginTop: '20px' }}>Phương thức thanh toán</Title>
                        <Radio.Group
                            onChange={handlePaymentMethodChange}
                            value={selectedPaymentMethod}
                            className="payment-methods"
                        >
                            <Radio value="momo" className="payment-option">
                                <img src={MomoIcon} alt="Momo" className="payment-icon" /> MoMo
                            </Radio>
                            <Radio value="zalopay" className="payment-option">
                                <img src={ZaloPayIcon} alt="ZaloPay" className="payment-icon" /> ZaloPay
                            </Radio>
                        </Radio.Group>
                    </div>
                ) : (
                    <p>Không có dữ liệu</p>
                )}
            </Modal>

            <ReviewUpdateModal
                visible={isModalUpdateOpen}
                onCancel={() => setIsModalUpdateOpen(false)}
                onUpdate={handleRatingUpdate}
                courseId={courseId}
            />

            <Footer />
        </>
    );
};

export default CourseDetail;