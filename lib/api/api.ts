import axios from "axios";

const PUBLIC_API_UR = process.env.NEXT_PUBLIC_API_URL;

export const nextServer = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export const api = axios.create({
  baseURL: PUBLIC_API_UR,
  withCredentials: true,
});
