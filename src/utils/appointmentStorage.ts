import { Appointment } from '@/types/appointments';

const APPOINTMENTS_KEY = 'cityhealth_appointments';

export const saveAppointment = (appointment: Appointment): void => {
  const appointments = getAppointments();
  appointments.push(appointment);
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
};

export const getAppointments = (): Appointment[] => {
  const stored = localStorage.getItem(APPOINTMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getAppointmentsByProvider = (providerId: string): Appointment[] => {
  return getAppointments().filter(apt => apt.providerId === providerId);
};

export const getAppointmentsByPatient = (patientEmail: string): Appointment[] => {
  return getAppointments().filter(apt => apt.patientEmail === patientEmail);
};

export const updateAppointmentStatus = (
  id: string, 
  status: Appointment['status']
): void => {
  const appointments = getAppointments();
  const index = appointments.findIndex(apt => apt.id === id);
  if (index !== -1) {
    appointments[index].status = status;
    appointments[index].updatedAt = new Date().toISOString();
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  }
};

export const deleteAppointment = (id: string): void => {
  const appointments = getAppointments().filter(apt => apt.id !== id);
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
};
