import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { shareVideo } from '../../services/videoService';

const ShareModal = ({ videoUrl, videoId, onClose }) => {
  const modalRef = useRef(null);
  const [loading, setLoading] = useState(null); // Tracks which button is loading: 'whatsapp', 'x', 'copy', or null

  // Debug modal position
  useEffect(() => {
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      console.log('ShareModal position:', {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      });
    }
    console.log('ShareModal rendered with videoUrl:', videoUrl, 'videoId:', videoId);
  }, [videoUrl, videoId]);

  // Close modal when clicking outside
  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      console.log('Clicked outside modal, closing');
      onClose();
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Share actions with API integration and loading state
  const handleShareWhatsApp = async () => {
    if (loading) return; // Prevent action if already loading
    setLoading('whatsapp');
    try {
      await shareVideo(videoId, 'whatsapp');
      const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(videoUrl)}`;
      window.open(shareUrl, '_blank');
      console.log('Shared via WhatsApp:', videoUrl);
      onClose();
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      alert('Failed to share video. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleShareX = async () => {
    if (loading) return; // Prevent action if already loading
    setLoading('x');
    try {
      await shareVideo(videoId, 'x');
      const shareUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent('Check out this video!')}`;
      window.open(shareUrl, '_blank');
      console.log('Shared via X:', videoUrl);
      onClose();
    } catch (error) {
      console.error('Error sharing to X:', error);
      alert('Failed to share video. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleCopyLink = async () => {
    if (loading) return; // Prevent action if already loading
    setLoading('copy');
    try {
      await shareVideo(videoId, 'copy');
      await navigator.clipboard.writeText(videoUrl);
      alert('Link copied to clipboard!');
      console.log('Link copied:', videoUrl);
      onClose();
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <motion.div
      ref={modalRef}
      className="absolute top-[40%] left-[10%] transform -translate-x-1/2 -translate-y-[30%] w-48 bg-gray-800 rounded-lg shadow-lg z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-label="Share video options"
    >
      <div className="flex flex-col p-2">
        <button
          onClick={handleShareWhatsApp}
          disabled={loading !== null}
          className={`flex items-center gap-2 px-4 py-2 text-white rounded ${
            loading === 'whatsapp'
              ? 'bg-gray-600 cursor-wait'
              : loading
              ? 'bg-gray-700 cursor-not-allowed'
              : 'hover:bg-gray-700'
          }`}
        >
          {loading === 'whatsapp' ? (
            <div className="w-5 h-5 border-2 border-t-white border-gray-400 rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.134.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.074-.149-.669-.648-.916-.994-.246-.346-.317-.397-.669-.099-.35.297-1.366.995-2.104 1.592-.737.596-1.232.996-1.381 1.294-.149.297-.074.546.075.645.148.099.346.347.644.744.445.595 1.738 1.937 3.773 3.024 2.035 1.087 3.024 1.284 3.669 1.383.645.099 1.242-.05 1.738-.347.496-.297 1.49-.993 2.137-1.937.644-.943.644-1.738.446-1.937-.198-.198-.396-.247-.693-.396zM12 0C5.373 0 0 5.373 0 12c0 2.118.553 4.108 1.512 5.854L0 24l6.291-1.512C8.036 23.447 10.026 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
            </svg>
          )}
          WhatsApp
        </button>
        <button
          onClick={handleShareX}
          disabled={loading !== null}
          className={`flex items-center gap-2 px-4 py-2 text-white rounded ${
            loading === 'x'
              ? 'bg-gray-600 cursor-wait'
              : loading
              ? 'bg-gray-700 cursor-not-allowed'
              : 'hover:bg-gray-700'
          }`}
        >
          {loading === 'x' ? (
            <div className="w-5 h-5 border-2 border-t-white border-gray-400 rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
            </svg>
          )}
          X
        </button>
        <button
          onClick={handleCopyLink}
          disabled={loading !== null}
          className={`flex items-center gap-2 px-4 py-2 text-white rounded ${
            loading === 'copy'
              ? 'bg-gray-600 cursor-wait'
              : loading
              ? 'bg-gray-700 cursor-not-allowed'
              : 'hover:bg-gray-700'
          }`}
        >
          {loading === 'copy' ? (
            <div className="w-5 h-5 border-2 border-t-white border-gray-400 rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          )}
          Copy Link
        </button>
      </div>
    </motion.div>
  );
};

export default ShareModal;