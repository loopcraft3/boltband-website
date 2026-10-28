const API = process.env.API_URL || "http://localhost:5000";
export default {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API}/api/:path*` }];
  },
};
