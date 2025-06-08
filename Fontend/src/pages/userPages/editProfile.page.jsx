import { useContext, useEffect, useState, useRef } from 'react';
import { CameraOutlined, UploadOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import { notification, Form, Input, Button, Typography, message, Space, Avatar, Image, Card, Divider } from 'antd';
import { LogoutApi, getAccount, handleUploadFile, updateUserApi, uploadAvatarUserApi } from '../../services/api.user.service';
import { AuthContext } from '../../components/context/auth.context';
import Footer from '../../components/user/layout/footer';
import './editProfile.page.css';
import Header from '../../components/user/layout/header';
import { forgotPasswordApi, resetPasswordApi } from '../../services/api.resetPassword.service';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ProfilePage = () => {
    const { user, setUser } = useContext(AuthContext);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [preview, setPreview] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadAccountData();
        return () => clearInterval(timerRef.current);
    }, [user]);

    const loadAccountData = async () => {
        setLoading(true);
        try {
            const accountData = await getAccount();
            setAvatarUrl(accountData.data.avatar);
            form.setFieldsValue(accountData.data);
        } catch (error) {
            message.error("Không thể tải thông tin người dùng");
        }
        setLoading(false);
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            if (selectedFile) {
                const resUpload = await handleUploadFile(selectedFile, "avatar");
                if (resUpload.data) {
                    const newAvatar = resUpload.data.path;
                    const resUpdateAvatar = await uploadAvatarUserApi(newAvatar, values._id, values.name, values.phone);
                    if (resUpdateAvatar.data.modifiedCount === 1) {
                        setPreview(null);
                    }
                }
            }
            
            const { _id, name, email, phone } = values;
            const res = await updateUserApi(_id, name, email, phone);
            if (res.data.modifiedCount === 1) {
                message.success('Cập nhật hồ sơ thành công');
                await loadAccountData();
            }
        } catch (error) {
            message.error(error.message || 'Cập nhật hồ sơ thất bại');
        }
        setLoading(false);
    };

    const handleOnChangeFile = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            setSelectedFile(null);
            setPreview(null);
            return;
        }
        const file = event.target.files[0];
        if (file) {
            // Kiểm tra loại file và kích thước
            if (!file.type.startsWith('image/')) {
                message.error('Vui lòng chọn file ảnh');
                return;
            }
            if (file.size > 2 * 1024 * 1024) { // Giới hạn 2MB
                message.error('Ảnh phải nhỏ hơn 2MB');
                return;
            }
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handlePasswordSubmit = async () => {
        try {
            const values = await form.validateFields(['newPassword', 'verificationCode', 'confirmPassword']);
            
            if (values.newPassword !== values.confirmPassword) {
                message.error('Mật khẩu không khớp');
                return;
            }
            
            if (values.newPassword.length < 6) {
                message.error('Mật khẩu phải có ít nhất 6 ký tự');
                return;
            }

            setLoading(true);
            const res = await resetPasswordApi(user.email, values.verificationCode, values.newPassword);
            
            if (res.status === 200) {
                message.success('Đổi mật khẩu thành công');
                const res1 = await LogoutApi();
                if (res1.data) {
                    localStorage.removeItem("access_token");
                    setUser({
                        "_id": "",
                        "name": "",
                        "email": "",
                        "password": "",
                        "phone": "",
                        "avatar": "",
                        "role": "",
                        "courseInfo": [],
                        "reviewInfo": [],
                    });
                    navigate("/login");
                }
            } else {
                message.error(res.message || 'Đổi mật khẩu thất bại');
            }
        } catch (error) {
            message.error(error.message || 'Đã xảy ra lỗi');
        } finally {
            setLoading(false);
        }
    };

    const startCountdown = async () => {
        try {
            setCountdown(60);
            timerRef.current = setInterval(() => {
                setCountdown((prevCountdown) => {
                    if (prevCountdown <= 1) {
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return prevCountdown - 1;
                });
            }, 1000);
            
            const res = await forgotPasswordApi(user.email);
            if (res.status === 200) {
                message.success('Đã gửi mã xác nhận đến email của bạn');
            } else {
                message.error(res.message || 'Gửi mã xác nhận thất bại');
            }
        } catch (error) {
            message.error(error.message || 'Đã xảy ra lỗi');
        }
    };

    return (
        <>
            <Header />
            <div className="profile-page-container">
                <div className="profile-content-wrapper">
                    <Card className="profile-sidebar">
                        <div className="avatar-section">
                            <div className="avatar-upload-container">
                                <div className="avatar-wrapper">
                                    <Image
                                        width={150}
                                        height={150}
                                        src={avatarUrl ? `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${avatarUrl}` : '/images/default-avatar.png'}
                                        preview={false}
                                        className="profile-avatar"
                                        fallback="/images/default-avatar.png"
                                    />
                                    <label htmlFor="fileUpload" className="avatar-upload-button">
                                        <CameraOutlined />
                                    </label>
                                    <input
                                        type="file"
                                        id="fileUpload"
                                        hidden
                                        accept="image/*"
                                        onChange={handleOnChangeFile}
                                    />
                                </div>
                                {preview && (
                                    <div className="avatar-preview-container">
                                        <Image
                                            width={150}
                                            src={preview}
                                            className="avatar-preview"
                                        />
                                        <Button 
                                            type="text" 
                                            danger 
                                            onClick={() => {
                                                setPreview(null);
                                                setSelectedFile(null);
                                            }}
                                            className="cancel-preview-btn"
                                        >
                                            Hủy
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <Title level={4} className="user-name">{user.name}</Title>
                            <Text type="secondary" className="user-email">{user.email}</Text>
                        </div>

                        <Divider className="sidebar-divider" />

                        <div className="profile-menu">
                            <Button 
                                icon={<UserOutlined />}
                                className={`menu-button ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                                block
                            >
                                Thông tin cá nhân
                            </Button>
                            <Button 
                                icon={<LockOutlined />}
                                className={`menu-button ${activeTab === 'password' ? 'active' : ''}`}
                                onClick={() => setActiveTab('password')}
                                block
                            >
                                Đổi mật khẩu
                            </Button>
                        </div>
                    </Card>

                    <Card className="profile-content-card">
                        <Title level={3} className="profile-section-title">
                            {activeTab === 'profile' ? 'Thông tin cá nhân' : 'Đổi mật khẩu'}
                        </Title>
                        
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={activeTab === 'profile' ? onFinish : handlePasswordSubmit}
                            className="profile-form"
                        >
                            {activeTab === 'profile' ? (
                                <>
                                    <Form.Item label="ID người dùng" name="_id" className="form-item">
                                        <Input disabled />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        label="Họ và tên"
                                        name="name"
                                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                                        className="form-item"
                                    >
                                        <Input placeholder="Nhập họ và tên" />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        rules={[{ required: true, message: 'Vui lòng nhập email' }]}
                                        className="form-item"
                                    >
                                        <Input disabled placeholder="Địa chỉ email" />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        label="Số điện thoại"
                                        name="phone"
                                        className="form-item"
                                    >
                                        <Input placeholder="Nhập số điện thoại" />
                                    </Form.Item>
                                    
                                    <div className="form-actions">
                                        <Button 
                                            type="primary" 
                                            htmlType="submit" 
                                            loading={loading}
                                            className="save-button"
                                        >
                                            Lưu thay đổi
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Form.Item
                                        label="Mật khẩu mới"
                                        name="newPassword"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                                        ]}
                                        className="form-item"
                                    >
                                        <Input.Password placeholder="Nhập mật khẩu mới" />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        label="Xác nhận mật khẩu"
                                        name="confirmPassword"
                                        rules={[
                                            { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('newPassword') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                                                },
                                            }),
                                        ]}
                                        className="form-item"
                                    >
                                        <Input.Password placeholder="Xác nhận mật khẩu mới" />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        label="Mã xác nhận"
                                        name="verificationCode"
                                        rules={[{ required: true, message: 'Vui lòng nhập mã xác nhận' }]}
                                        className="form-item"
                                    >
                                        <div className="verification-code-container">
                                            <Input 
                                                placeholder="Nhập mã xác nhận" 
                                                className="verification-input"
                                            />
                                            <Button
                                                type="default"
                                                onClick={startCountdown}
                                                disabled={countdown > 0}
                                                className={`send-code-button ${countdown > 0 ? 'countdown-active' : ''}`}
                                            >
                                                {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi mã'}
                                            </Button>
                                        </div>
                                    </Form.Item>
                                    
                                    <div className="form-actions">
                                        <Button 
                                            type="primary" 
                                            htmlType="submit" 
                                            loading={loading}
                                            className="change-password-button"
                                        >
                                            Đổi mật khẩu
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </Card>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ProfilePage;