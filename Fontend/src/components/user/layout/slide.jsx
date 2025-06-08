import { Carousel } from "antd";
import './css/homePage.css';
import banner from './images/banner/banner1.jpg';
import banner2 from './images/banner/banner2.jpg';
import banner3 from './images/banner/banner3.jpg';

const Slide = () => {
    const banners = [
        { src: banner, alt: "Banner 1" },
        { src: banner2, alt: "Banner 2" },
        { src: banner3, alt: "Banner 3" }
    ];

    return (
        <div className="carousel-container">
            <Carousel autoplay dots={true} effect="fade" className="carousel-slide">
                {banners.map((item, index) => (
                    <div className="carousel-item" key={index}>
                        <img
                            src={item.src}
                            alt={item.alt}
                            className="carousel-image"
                        />
                    </div>
                ))}
            </Carousel>
        </div>
    );
};

export default Slide;
