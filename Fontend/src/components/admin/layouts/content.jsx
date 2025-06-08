import { Layout, Breadcrumb, theme } from "antd";
import { Outlet, useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const Content = () => {
    const { Content } = Layout;
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const location = useLocation();
    const pathSnippets = location.pathname.split('/').filter(i => i);

    const breadcrumbItems = [
        {
            title: <HomeOutlined />,
        },
        ...pathSnippets.map((_, index) => {
            const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
            return {
                title: pathSnippets[index].charAt(0).toUpperCase() + pathSnippets[index].slice(1),
                href: url,
            };
        })
    ];

    return (
        <Content style={{ margin: '24px 16px 0', height: '100%' }}>
            <Breadcrumb
                style={{ marginBottom: 16 }}
                items={breadcrumbItems}
            />
            <div
                style={{
                    padding: 24,
                    minHeight: 700,
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}
            >
                <Outlet />
            </div>
        </Content>
    );
};

export default Content;
