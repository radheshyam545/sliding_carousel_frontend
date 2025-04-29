import React from 'react';
import HorizontalCarousel from '../components/HorizontalCarousel/HorizontalCarousel';

const Home = () => {
  return (
    <div className="home-page flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-center text-2xl font-bold my-4">Socially Approved Carousel</h1>
      <div className="w-full max-w-7xl">
        <HorizontalCarousel />
      </div>
      
    </div>
  );
};

export default Home;
