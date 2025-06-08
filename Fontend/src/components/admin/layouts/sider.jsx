import { useState, useContext } from "react";
import { AuthContext } from '../../context/auth.context';
import { Layout, Menu, Typography } from "antd";
import {
    UsergroupAddOutlined, HomeOutlined,
    BookOutlined, ProductOutlined, ReadOutlined,
    HddOutlined, ArrowLeftOutlined, BarChartOutlined,
    BankOutlined, EyeOutlined, DollarOutlined
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Sider = ({ collapsed, setCollapsed }) => {
    const { Sider } = Layout;
    const { user } = useContext(AuthContext);
    const [current, setCurrent] = useState('');
    const location = useLocation();

    const onClick = (e) => {
        setCurrent(e.key);
    };

    const items = [
        {
            label: <Link to="/">Home Page</Link>,
            key: 'exit',
            icon: <ArrowLeftOutlined />,
        },
        {
            label: <Link to="/admin">Dashboard</Link>,
            key: 'home',
            icon: <HomeOutlined />,
        },
        {
            label: "Management",
            key: 'management',
            icon: <ProductOutlined />,
            children: [
                {
                    label: <Link to="/admin/courses">Courses</Link>,
                    key: 'courses',
                    icon: <ReadOutlined />,
                },
                {
                    label: <Link to="/admin/chapters">Chapters</Link>,
                    key: 'chapters',
                    icon: <HddOutlined />,
                },
                {
                    label: <Link to="/admin/lessons">Lessons</Link>,
                    key: 'lessons',
                    icon: <BookOutlined />,
                },
                {
                    label: <Link to="/admin/exams">Tests</Link>,
                    key: 'exams',
                    icon: <BookOutlined />,
                },
                {
                    label: <Link to="/admin/reviews">Reviews</Link>,
                    key: 'reviews',
                    icon: <EyeOutlined />,
                },
                {
                    label: <Link to="/admin/orders">Orders</Link>,
                    key: 'orders',
                    icon: <BankOutlined />,
                },
                {
                    label: <Link to="/admin/token_packages">Token Packages</Link>,
                    key: 'token_packages',
                    icon: <DollarOutlined />,
                },
            ]
        },
        {
            label: <Link to="/admin/users">Users</Link>,
            key: 'users',
            icon: <UsergroupAddOutlined />,
        },
        {
            label: <Link to="/admin/revenue-chart">Revenue Chart</Link>,
            key: 'revenue_chart',
            icon: <BarChartOutlined />,
        },
    ];

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            theme="dark"
            width={230}
            style={{
                position: 'sticky',
                top: 0,
                height: '100vh',
                zIndex: 10,
                overflow: 'auto',
            }}
        >
            <div style={{
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: 18,
                color: '#fff',
                letterSpacing: 1,
            }}>
                {collapsed ? "AD" : "Admin Panel"}
            </div>
            <Menu
                onClick={onClick}
                theme="dark"
                selectedKeys={[location.pathname.split('/')[2]]}
                mode="inline"
                items={items}
                style={{
                    paddingBottom: 50,
                }}
            />
        </Sider>
    );
};

export default Sider;
