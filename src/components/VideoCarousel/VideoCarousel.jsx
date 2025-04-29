import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Heart, Share2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ShareModal from '../ShareModal/ShareModal';
import { likeVideo } from '../../services/videoService';

export default function VideoCarouselFixedCenter({ videos, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [likes, setLikes] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const centerVideoRef = useRef(null);
  const videoContainerRef = useRef(null);

  // Debug video container dimensions
  useEffect(() => {
    if (videoContainerRef.current) {
      const rect = videoContainerRef.current.getBoundingClientRect();
      console.log('Video container dimensions:', {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      });
    }
  }, [currentIndex, showShareModal]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      setIsLoading(true);
      setIsPaused(false);
      console.log('Navigated to previous video, currentIndex:', currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setIsLoading(true);
      setIsPaused(false);
      console.log('Navigated to next video, currentIndex:', currentIndex + 1);
    }
  };

  const getVideo = (index) => {
    if (index >= 0 && index < videos.length) {
      return videos[index];
    }
    return null;
  };

  const toggleMute = () => {
    if (centerVideoRef.current) {
      centerVideoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      console.log('Mute toggled:', !isMuted);
    }
  };

  const togglePlayPause = () => {
    if (centerVideoRef.current) {
      const video = centerVideoRef.current;
      console.log('togglePlayPause called:', {
        isPaused: isPaused,
        videoPaused: video.paused,
        readyState: video.readyState,
        currentTime: video.currentTime,
        duration: video.duration,
        src: video.src,
      });

      if (video.paused) {
        video.play().then(() => {
          console.log('Video play promise resolved');
          setIsPaused(false);
        }).catch((error) => {
          console.error('Error playing video:', error);
          setIsPaused(true);
        });
      } else {
        video.pause();
        console.log('Video pause called');
        setIsPaused(true);
      }
    } else {
      console.warn('Video ref not available');
    }
  };

  const handleVideoClick = (e) => {
    e.stopPropagation();
    console.log('handleVideoClick triggered');
    togglePlayPause();
  };

  const handleLike = async () => {
    const video = getVideo(currentIndex);
    if (!video) return;
    const videoId = video.id;
    const isCurrentlyLiked = likes[videoId]?.liked || false;


    // Optimistic update
    setLikes((prev) => ({
      ...prev,
      [videoId]: { liked: !isCurrentlyLiked },
    }));
    console.log('Optimistic like update for video:', video.fullUrl, 'Liked:', !isCurrentlyLiked);

    try {
      const response = await likeVideo(video.id);
      if (response.success) {

        console.log('API like successful:', response.video);
      } else {
        throw new Error('API response unsuccessful');
      }
    } catch (error) {
      // Revert optimistic update
      setLikes((prev) => ({
        ...prev,
        [videoId]: { liked: isCurrentlyLiked },
      }));
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
    console.log('Share clicked for video:', getVideo(currentIndex)?.fullUrl);
  };

  // Sync isPaused with video state
  useEffect(() => {
    if (centerVideoRef.current) {
      const video = centerVideoRef.current;

      const handlePlay = () => {
        setIsPaused(false);
        console.log('Video play event triggered, isPaused set to false');
      };

      const handlePause = () => {
        setIsPaused(true);
        console.log('Video pause event triggered, isPaused set to true');
      };

      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);

      // Initial sync
      setIsPaused(video.paused);
      console.log('Initial video state:', {
        paused: video.paused,
        readyState: video.readyState,
        src: video.src,
      });

      return () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }
  }, [currentIndex]);

  // Debug showShareModal changes
  useEffect(() => {
    console.log(showShareModal, 'showShareModal');
  }, [showShareModal]);

  // Handle video loading and playback
  useEffect(() => {
    if (centerVideoRef.current) {
      const video = centerVideoRef.current;
      const currentVideo = getVideo(currentIndex);

      if (currentVideo) {
        if (video.src !== currentVideo.fullUrl) {
          console.log('Loading new video:', currentVideo.fullUrl);
          video.src = currentVideo.fullUrl;
          setIsLoading(true);
          setIsPaused(false);
        }

        video.muted = isMuted;

        const handleCanPlay = () => {
          setIsLoading(false);
          console.log('Video can play, isLoading set to false:', currentVideo.fullUrl);
          if (!isPaused) {
            video.play().then(() => {
              console.log('Video auto-played successfully');
              setIsPaused(false);
            }).catch((error) => {
              console.error('Error auto-playing video:', error);
              setIsPaused(true);
            });
          }
        };

        video.addEventListener('canplay', handleCanPlay);

        return () => {
          video.removeEventListener('canplay', handleCanPlay);
        };
      }
    }
  }, [currentIndex, isMuted, isPaused]);

  // Handle progress updates
  useEffect(() => {
    if (centerVideoRef.current) {
      const video = centerVideoRef.current;

      const updateProgress = () => {
        const duration = video.duration;
        const currentTime = video.currentTime;
        if (duration && currentTime) {
          const progressPercent = (currentTime / duration) * 100;
          setProgress(progressPercent);
        }
      };

      video.addEventListener('timeupdate', updateProgress);

      return () => {
        video.removeEventListener('timeupdate', updateProgress);
      };
    }
  }, [currentIndex]);

  // Calculate total likes to display
  const getTotalLikes = () => {
    const video = getVideo(currentIndex);
    if (!video) return 0;
    const baseLikes = video.likes || 0;
    const userLiked = likes[video.id]?.liked || false;
    console.log('getTotalLikes:', { userLiked, baseLikes, likes });
    return baseLikes + (userLiked ? 1 : 0);
  };

  const variants = {
    center: {
      x: 0,
      scale: 1.2,
      zIndex: 10,
      opacity: 1,
      height: '450px',
      width: '260px',
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    left: {
      x: '-110%',
      scale: 0.8,
      zIndex: 5,
      opacity: 1,
      height: '400px',
      width: '240px',
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    right: {
      x: '110%',
      scale: 0.8,
      zIndex: 5,
      opacity: 1,
      height: '400px',
      width: '240px',
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    exitLeft: {
      x: '-150%',
      scale: 0.6,
      opacity: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    exitRight: {
      x: '150%',
      scale: 0.6,
      opacity: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className="relative flex items-center justify-center h-screen overflow-hidden">
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className={`absolute left-6 z-20 p-3 rounded-full shadow-lg transition-all duration-200 ${currentIndex === 0
            ? 'bg-gray-400/50 cursor-not-allowed text-gray-300'
            : 'bg-white/90 text-gray-800 hover:bg-white hover:shadow-xl'
          }`}
      >
        <ChevronLeft size={36} strokeWidth={2.5} />
      </button>

      <div className="relative flex items-center justify-center w-full h-full">
        <AnimatePresence initial={false} custom={direction}>
          {getVideo(currentIndex - 1) && (
            <motion.div
              key={currentIndex - 1}
              className="absolute"
              variants={variants}
              initial="exitLeft"
              animate="left"
              exit="exitLeft"
              custom={direction}
            >
              <video
                src={getVideo(currentIndex - 1).fullUrl}
                muted
                playsInline
                className="rounded-xl w-full h-full object-cover"
              />
            </motion.div>
          )}

          {getVideo(currentIndex) && (
            <motion.div
              key={currentIndex}
              className="absolute"
              variants={variants}
              initial={direction > 0 ? 'right' : 'left'}
              animate="center"
              exit={direction > 0 ? 'exitLeft' : 'exitRight'}
              custom={direction}
            >
              <div ref={videoContainerRef} className="relative w-full h-full">
                <video
                  ref={centerVideoRef}
                  onClick={handleVideoClick}
                  autoPlay
                  muted={isMuted}
                  loop
                  playsInline
                  className="rounded-2xl w-full h-full object-cover border-4 border-white shadow-lg"
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                    <div className="w-12 h-12 border-4 border-t-pink-400 border-gray-600 rounded-full animate-spin"></div>
                  </div>
                )}
                {/* Play overlay */}
                {isPaused && (
                  <div
                    onClick={handleVideoClick}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl z-10 cursor-pointer"
                  >
                    <Play size={48} className="text-white/80" />
                  </div>
                )}
                <div className="absolute top-1 left-1 w-[calc(100%-8px)] h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-pink-400 transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="absolute top-2 right-2 flex flex-col items-center z-10">
                  <button
                    onClick={toggleMute}
                    className="p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <span className="mt-1 text-xs text-white/80 font-medium">Volume</span>
                </div>
                <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex flex-col items-center z-10">
                  <button
                    onClick={handleLike}
                    className="p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <Heart
                      size={20}
                      fill={likes[getVideo(currentIndex).id]?.liked ? 'red' : 'none'}
                      stroke={likes[getVideo(currentIndex).id]?.liked ? 'red' : 'white'}
                    />
                  </button>
                  <span className="mt-1 text-xs text-white/80 font-medium">Like</span>
                  <span className="mt-1 text-xs text-white/80 font-medium">
                    {getTotalLikes()}
                  </span>
                </div>
                <div className="absolute top-1/2 right-2 transform translate-y-1/2 mt-4 flex flex-col items-center z-10">
                  <button
                    onClick={handleShare}
                    className="p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <Share2 size={20} />
                  </button>
                  <span className="mt-1 text-xs text-white/80 font-medium">Share</span>
                </div>
                {showShareModal && (
                  <ShareModal
                    videoUrl={getVideo(currentIndex).fullUrl}
                    videoId={getVideo(currentIndex).id}
                    onClose={() => {
                      setShowShareModal(false);
                      console.log('Share modal closed via onClose');
                    }}
                  />
                )}
              </div>
            </motion.div>
          )}

          {getVideo(currentIndex + 1) && (
            <motion.div
              key={currentIndex + 1}
              className="absolute"
              variants={variants}
              initial="exitRight"
              animate="right"
              exit="exitRight"
              custom={direction}
            >
              <video
                src={getVideo(currentIndex + 1).fullUrl}
                muted
                playsInline
                className="rounded-xl w-full h-full object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={handleNext}
        disabled={currentIndex === videos.length - 1}
        className={`absolute right-6 z-20 p-3 rounded-full shadow-lg transition-all duration-200 ${currentIndex === videos.length - 1
          ? 'bg-gray-400/50 cursor-not-allowed text-gray-300'
          : 'bg-white/90 text-gray-800 hover:bg-white hover:shadow-xl'
          }`}
      >
        <ChevronRight size={36} strokeWidth={2.5} />
      </button>
    </div>
  );
}