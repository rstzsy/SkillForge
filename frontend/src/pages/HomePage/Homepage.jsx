import React from 'react'
import SliderComponent from '../../component/SliderComponent/SliderComponent';

const sliderImages = [
    '/assets/slider1.png',
    '/assets/slider2.png',
    '/assets/slider3.png',
    '/assets/slider4.png',
    '/assets/slider5.png',
  ];

const HomePage = () => {
  return (
    <>
        {/* Slider Section */}
        <div id="container1">
            <SliderComponent images={sliderImages} />
        </div>
    </>
  )
}

export default HomePage