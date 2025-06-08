import { Link, useNavigate } from 'react-router-dom';
import { Menu, Layout, Avatar, Dropdown, Space, Typography, message, theme } from 'antd';
import { LoginOutlined, LogoutOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { useState, useContext } from 'react';
import { AuthContext } from '../../context/auth.context';
import { LogoutApi } from '../../../services/api.user.service';

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = () => {
    const [current, setCurrent] = useState('');
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const onClick = (e) => {
        setCurrent(e.key);
    };

    const handleLogout = async () => {
        const res = await LogoutApi();
        if (res.data) {
            localStorage.removeItem("access_token");
            setUser({
                _id: "",
                name: "",
                email: "",
                password: "",
                phone: "",
                avatar: "",
                role: "",
                courseInfo: [],
                reviewInfo: [],
            });
            message.success("Đăng xuất thành công");
            navigate("/login");
        }
    };

    const menuItems = [
        {
            key: 'setting',
            label: <span>Cài đặt</span>,
            icon: <SettingOutlined />,
        },
        {
            key: 'logout',
            label: <span onClick={handleLogout}>Đăng xuất</span>,
            icon: <LogoutOutlined />,
        }
    ];

    return (
        <Header
            style={{
                padding: '0 24px',
                background: colorBgContainer,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 64,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
        >
            <Link to="/" style={{ fontSize: 20, fontWeight: 'bold' }}>
                🧠 Admin Dashboard
            </Link>

            {!user._id ? (
                <Menu mode="horizontal" selectedKeys={[current]} onClick={onClick} style={{ borderBottom: 'none' }}>
                    <Menu.Item key="login" icon={<LoginOutlined />}>
                        <Link to="/login">Đăng nhập</Link>
                    </Menu.Item>
                </Menu>
            ) : (
                <Dropdown
                    menu={{ items: menuItems }}
                    placement="bottomRight"
                    arrow
                >
                    <Space style={{ cursor: 'pointer' }}>
                        <Avatar
                            size={38}
                            src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user.avatar}`}
                            icon={<UserOutlined />}
                        />
                        <Text strong>{user.name || 'Admin'}</Text>
                    </Space>
                </Dropdown>
            )}
        </Header>
    );
};

export default AppHeader;
