import axios from "axios";

// Placeholder for getToken, set by AuthProvider
let getToken: () => Promise<string | null> = async () => null;

export const setAxiosGetToken = (tokenFn: () => Promise<string | null>) => {
  getToken = tokenFn; // Called by AuthProvider to inject getToken
};

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7070",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      window.location.href = "/login";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
