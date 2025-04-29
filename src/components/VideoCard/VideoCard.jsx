import React, { useEffect, useRef, useState } from 'react';

const VideoCard = React.memo(({ videoUrl }) => {
    const videoRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            {
                threshold: 0.1, // 60% video dikhe to trigger kare
            }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (videoRef.current) {
            if (isVisible) {
                videoRef.current.play().catch((error) => {
                    console.log('Play prevented:', error);
                });
            } else {
                videoRef.current.pause();
            }
        }
    }, [isVisible]);

    return (
        <div className="flex-shrink-0 w-[200px] h-96 rounded-[15px] overflow-hidden shadow-md bg-gray-900">
            <video
                ref={videoRef}
                src={videoUrl}
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
            />
        </div>
    );
});

export default VideoCard;
