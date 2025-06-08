import {
  Form,
  Button,
  Input,
  notification,
  Row,
  Col,
  Divider,
  Modal,
  Card,
  Typography
} from "antd";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUserAPI, verifyCode } from "../services/api.user.service";

const { Title, Text } = Typography;

const RegisterPage = () => {
  const [form] = Form.useForm();
  const [verificationForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const { name, email, password, repeat_password, phone } = values;
      setEmail(email);

      const res = await registerUserAPI(name, email, password, repeat_password, phone);
      if (res && res.data) {
        notification.success({
          message: "Đăng ký thành công",
          description: "Mã xác thực đã được gửi đến email của bạn.",
        });
        setIsModalOpen(true);
      } else {
        notification.error({
          message: "Lỗi đăng ký",
          description: res.message,
        });
      }
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Lỗi hệ thống",
        description: "Đã xảy ra lỗi khi đăng ký.",
      });
    }
  };

  const handleVerifyCode = async (values) => {
    try {
      const { verificationCode } = values;
      const res = await verifyCode(email, verificationCode);
      if (res && res.data) {
        notification.success({
          message: "Xác minh thành công",
          description: "Tài khoản của bạn đã được tạo!",
        });
        setIsModalOpen(false);
        navigate("/login");
      } else {
        notification.error({
          message: "Lỗi xác minh",
          description: res.message || "Mã xác minh không hợp lệ!",
        });
      }
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Lỗi hệ thống",
        description: "Không thể xác minh mã.",
      });
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: "60px", paddingBottom: "60px" }}>
      <Card style={{ width: "100%", maxWidth: 600 }} bordered hoverable>
        <Title level={3} style={{ textAlign: "center" }}>Đăng ký tài khoản</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Họ và tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email", message: "Email không hợp lệ!" }]}
          >
            <Input placeholder="example@gmail.com" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password placeholder="********" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Nhập lại mật khẩu"
                name="repeat_password"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu không khớp!"));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="********" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              { pattern: /^[0-9]{9,11}$/, message: "Số điện thoại không hợp lệ!" },
            ]}
          >
            <Input placeholder="0123456789" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đăng ký
            </Button>
          </Form.Item>

          <Divider />
          <Text>Bạn đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link></Text>
        </Form>
      </Card>

      <Modal
        title="Xác thực Email"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={verificationForm} layout="vertical" onFinish={handleVerifyCode}>
          <Form.Item
            label="Mã xác nhận"
            name="verificationCode"
            rules={[{ required: true, message: "Nhập mã xác nhận đã gửi tới email của bạn!" }]}
          >
            <Input placeholder="Nhập mã xác nhận..." />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Xác nhận
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default RegisterPage;
