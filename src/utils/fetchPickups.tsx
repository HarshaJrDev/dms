import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchPickups = async ({ queryKey }) => {
  const [_key, userId, latitude, longitude] = queryKey;

  if (!userId || latitude == null || longitude == null) return [];

  const url = `http://193.203.163.114:5000/api/drivers/driver-donations/${userId}?lat=${latitude}&long=${longitude}`;
  const response = await axios.get(url);
  return response.data;
};

export const usePickups = (userId, latitude, longitude) => {
  return useQuery({
    queryKey: ["pickups", userId, latitude, longitude],
    queryFn: fetchPickups,
    enabled: !!userId && latitude != null && longitude != null, // prevent query from auto-running until all values are present
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });
};
