import axios from 'axios';
import { envConfig } from '../config/env';

const API = envConfig.BACKEND_URL;

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

