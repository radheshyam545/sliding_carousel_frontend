import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/videos'; // Update with actual backend URL

// export const getVideos = async () => {
//   try {
//     const response = await axios.get(API_URL);
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching videos:', error);
//     throw error;
//   }
// };



// import axios from 'axios';

const API = 'http://localhost:5000/api';

export const fetchVideos = async () => {
  const res = await axios.get(`${API}/videos`);
  return res.data.data;
};

export const likeVideo = async (videoId) => {
  const res = await axios.post(`${API}/like`, { videoId });
  return res.data;
};

export const shareVideo = async (videoId, platform) => {
  const res = await axios.post(`${API}/share`, { videoId, platform });
  return res.data;
};

