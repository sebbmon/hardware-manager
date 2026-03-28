import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useHardware = (params?: any) => {
  return useQuery({
    queryKey: ['hardware', params],
    queryFn: async () => {
      const { data } = await api.get('/hardware/', { params });
      return data;
    },
  });
};

export const useMyRentals = () => {
  return useQuery({
    queryKey: ['my-rentals'],
    queryFn: async () => {
      const { data } = await api.get('/my-rentals/');
      return data;
    },
  });
};
