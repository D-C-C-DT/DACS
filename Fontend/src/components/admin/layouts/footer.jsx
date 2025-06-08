import { Layout, Typography } from 'antd';

const AppFooter = () => {
    const { Footer } = Layout;
    const { Text } = Typography;

    return (
        <Footer
            style={{
                textAlign: 'center',
                padding: '12px 50px',
                background: '#f0f2f5',
                borderTop: '1px solid #e0e0e0',
            }}
        >
            <Text type="secondary">
                © {new Date().getFullYear()} <strong>Admin Dashboard</strong> | Built with ❤️ using Ant Design
            </Text>
        </Footer>
    );
};

export default AppFooter;
