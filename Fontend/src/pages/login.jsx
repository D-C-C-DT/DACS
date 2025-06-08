import {
  ArrowLeftOutlined,
  MailOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  Row,
  Col,
  Divider,
  Checkbox,
  message,
  notification,
  Typography,
  Card,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { loginAPI } from "../services/api.user.service";
import { useState, useContext } from "react";
import { AuthContext } from "../components/context/auth.context";
import ForgotPasswordModal from "./forgotPassword.modal";

const { Title, Text } = Typography;

const LoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const { setUser } = useContext(AuthContext);

  const onFinish = async (values) => {
    setLoading(true);
    const res = await loginAPI(values.email, values.password);
    if (res.data) {
      message.success("Đăng nhập thành công");
      localStorage.setItem("access_token", res.accessToken);
      setUser(res.data);
      setLoading(false);
      navigate("/");
    } else {
      notification.error({
        message: "Đăng nhập thất bại",
        description: JSON.stringify(res.message),
      });
      setLoading(false);
    }
  };

  const onKeyEnter = (event) => {
    if (event.key === "Enter") form.submit();
  };

  return (
    <>
      <Row
        justify="center"
        align="middle"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to right, #e0eafc, #cfdef3)",
        }}
      >
        <Col xs={22} sm={16} md={10} lg={8}>
          <Card
            bordered={false}
            style={{
              padding: "40px 30px",
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              background: "#ffffff",
            }}
          >
            <Title level={3} style={{ textAlign: "center", marginBottom: 0 }}>
              👋 Chào mừng trở lại!
            </Title>
            <Text type="secondary" style={{ display: "block", textAlign: "center", marginBottom: 32 }}>
              Vui lòng đăng nhập để tiếp tục học tập nhé.
            </Text>

            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Email không được để trống!",
                  },
                  {
                    type: "email",
                    message: "Email không đúng định dạng!",
                  },
                ]}
              >
                <Input
                  size="large"
                  prefix={<MailOutlined />}
                  onKeyDown={onKeyEnter}
                  placeholder="example@gmail.com"
                />
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Mật khẩu không được để trống!",
                  },
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined />}
                  onKeyDown={onKeyEnter}
                  placeholder="••••••••"
                />
              </Form.Item>

              <Row justify="space-between" align="middle">
                <Col>
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Ghi nhớ</Checkbox>
                  </Form.Item>
                </Col>
                <Col>
                  <Button type="link" onClick={() => setForgotPasswordVisible(true)}>
                    Quên mật khẩu?
                  </Button>
                </Col>
              </Row>

              <Form.Item style={{ marginTop: 24 }}>
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={loading}
                  onClick={() => form.submit()}
                >
                  Đăng nhập
                </Button>
              </Form.Item>

              <Divider>hoặc</Divider>

              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <Text>Bạn chưa có tài khoản? </Text>
                <Link to="/register">Đăng ký ngay</Link>
              </div>

              <div style={{ textAlign: "center" }}>
                <Link to="/">
                  <ArrowLeftOutlined /> Quay lại trang chủ
                </Link>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>

      <ForgotPasswordModal
        visible={forgotPasswordVisible}
        onClose={() => setForgotPasswordVisible(false)}
      />
    </>
  );
};

export default LoginPage;
