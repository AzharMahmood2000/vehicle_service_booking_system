import API_BASE_URL from '../api';

export const resolveImagePath = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (path.startsWith('/assets/')) {
    return path;
  }
  if (path.startsWith('/uploads/')) {
    // API_BASE_URL typically looks like http://localhost:5000/api
    // We want to replace /api with the path.
    const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${backendOrigin}${path}`;
  }
  return path;
};
