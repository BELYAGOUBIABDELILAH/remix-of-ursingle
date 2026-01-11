import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { 
  getAppointmentsByPatient, 
  getAppointmentsByProvider, 
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment as cancelAppointmentService,
  confirmAppointment as confirmAppointmentService,
  completeAppointment as completeAppointmentService,
  subscribeToPatientAppointments,
  subscribeToProviderAppointments,
  getUpcomingAppointmentsCount
} from '@/services/appointmentService';
import { Appointment } from '@/types/appointments';
import { useAuth } from '@/contexts/AuthContext';

// Query keys factory
export const appointmentKeys = {
  all: ['appointments'] as const,
  byPatient: (patientId: string) => [...appointmentKeys.all, 'patient', patientId] as const,
  byProvider: (providerId: string) => [...appointmentKeys.all, 'provider', providerId] as const,
  upcomingCount: (providerId: string) => [...appointmentKeys.all, 'upcoming', providerId] as const,
};

// Hook to fetch appointments for current patient (user)
export const usePatientAppointments = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: appointmentKeys.byPatient(user?.uid || ''),
    queryFn: () => getAppointmentsByPatient(user!.uid),
    enabled: !!user?.uid,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to fetch appointments for a provider
export const useProviderAppointments = (providerId: string | undefined) => {
  return useQuery({
    queryKey: appointmentKeys.byProvider(providerId || ''),
    queryFn: () => getAppointmentsByProvider(providerId!),
    enabled: !!providerId,
    staleTime: 2 * 60 * 1000,
  });
};

// Hook to get upcoming appointments count for a provider
export const useUpcomingAppointmentsCount = (providerId: string | undefined) => {
  return useQuery({
    queryKey: appointmentKeys.upcomingCount(providerId || ''),
    queryFn: () => getUpcomingAppointmentsCount(providerId!),
    enabled: !!providerId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to create a new appointment
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      providerId: string;
      providerName: string;
      patientName: string;
      patientPhone: string;
      patientEmail?: string;
      dateTime: string;
      notes?: string;
    }) => {
      return createAppointment({
        ...data,
        patientId: user?.uid || 'anonymous',
        status: 'pending',
      });
    },
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries
      if (user?.uid) {
        queryClient.invalidateQueries({ queryKey: appointmentKeys.byPatient(user.uid) });
      }
      queryClient.invalidateQueries({ queryKey: appointmentKeys.byProvider(variables.providerId) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcomingCount(variables.providerId) });
    },
  });
};

// Hook to update appointment status
export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Appointment['status'] }) => {
      return updateAppointmentStatus(id, status);
    },
    onSuccess: () => {
      // Invalidate all appointment queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

// Hook to cancel an appointment
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cancelAppointmentService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

// Hook to confirm an appointment (provider)
export const useConfirmAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: confirmAppointmentService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

// Hook to complete an appointment (provider)
export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: completeAppointmentService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

// Hook for real-time patient appointments
export const useRealtimePatientAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user?.uid) {
      setAppointments([]);
      setLoading(false);
      return;
    }
    
    const unsubscribe = subscribeToPatientAppointments(user.uid, (data) => {
      setAppointments(data);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user?.uid]);
  
  return { appointments, loading };
};

// Hook for real-time provider appointments
export const useRealtimeProviderAppointments = (providerId: string | undefined) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!providerId) {
      setAppointments([]);
      setLoading(false);
      return;
    }
    
    const unsubscribe = subscribeToProviderAppointments(providerId, (data) => {
      setAppointments(data);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [providerId]);
  
  return { appointments, loading };
};
