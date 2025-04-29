import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import VideoCard from '../VideoCard/VideoCard';
import { fetchVideos } from '../../services/videoService';
import VideoCarouselFixedCenter from '../VideoCarousel/VideoCarousel';

const HorizontalCarousel = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCarousel, setShowCarousel] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef(null);

  console.log('videos', videos);

  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchVideos();
        setVideos(data);
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        setError('Failed to load videos. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  // Update scroll button states
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding errors
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      checkScroll(); // Initial check
    }

    return () => {
      if (container) container.removeEventListener('scroll', checkScroll);
    };
  }, [videos, loading]);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300, // Scroll by approx. 1-2 card widths (adjust as needed)
        behavior: 'smooth',
      });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300, // Scroll by approx. 1-2 card widths (adjust as needed)
        behavior: 'smooth',
      });
    }
  };

  const handleRetry = () => {
    const loadVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchVideos();
        setVideos(data);
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        setError('Failed to load videos. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadVideos();
  };

  const handleCardClick = (index) => {
    setSelectedIndex(index);
    setShowCarousel(true);
  };

  const handleCloseCarousel = () => {
    setShowCarousel(false);
  };

  return (
    <div className="w-full py-6 px-20">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-t-pink-400 border-gray-600 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col justify-center items-center h-64 text-white">
          <p className="text-lg font-medium mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-pink-400 text-white rounded-lg hover:bg-pink-500 transition-colors"
            aria-label="Retry loading videos"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={handleScrollLeft}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-lg transition-all duration-200 ${
              canScrollLeft
                ? 'bg-white/90 text-gray-800 hover:bg-white hover:shadow-xl'
                : 'bg-gray-400/50 text-gray-300 cursor-not-allowed'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft size={36} strokeWidth={2.5} />
          </button>
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-scroll py-2 scrollbar-hide scroll-smooth"
            style={{scrollbarWidth:"none"}}
          >
            {videos.map((video, index) => (
              <div
                key={video.id}
                onClick={() => handleCardClick(index)}
                className="cursor-pointer flex-shrink-0"
              >
                <VideoCard videoUrl={video.previewUrl} />
              </div>
            ))}
          </div>
          <button
            onClick={handleScrollRight}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-lg transition-all duration-200 ${
              canScrollRight
                ? 'bg-white/90 text-gray-800 hover:bg-white hover:shadow-xl'
                : 'bg-gray-400/50 text-gray-300 cursor-not-allowed'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight size={36} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {showCarousel && videos.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <button
            onClick={handleCloseCarousel}
            className="absolute top-4 right-4 z-50 text-white bg-black/70 p-2 rounded-full hover:bg-black/90 transition-colors"
            aria-label="Close video carousel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="relative w-full h-full max-w-[800px] max-h-[600px]">
            <VideoCarouselFixedCenter
              videos={videos}
              initialIndex={selectedIndex}
              onClose={handleCloseCarousel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HorizontalCarousel;