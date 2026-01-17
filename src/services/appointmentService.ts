import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Appointment } from '@/types/appointments';

const APPOINTMENTS_COLLECTION = 'appointments';

// Helper to convert Firestore doc to Appointment
const docToAppointment = (docSnap: any): Appointment => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    providerId: data.providerId,
    providerName: data.providerName,
    patientName: data.patientName,
    patientPhone: data.patientPhone,
    patientEmail: data.patientEmail,
    patientId: data.patientId,
    dateTime: data.dateTime?.toDate?.()?.toISOString() || data.dateTime,
    status: data.status || 'pending',
    notes: data.notes,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
  };
};

// Create a new appointment
export const createAppointment = async (
  appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const now = Timestamp.now();
  
  // Validate date is not in the past
  const appointmentDate = new Date(appointment.dateTime);
  if (appointmentDate < new Date()) {
    throw new Error('Cannot book appointments in the past');
  }
  
  // Validate not on Sunday (day 0)
  if (appointmentDate.getDay() === 0) {
    throw new Error('Cannot book appointments on Sundays');
  }
  
  const docRef = await addDoc(collection(db, APPOINTMENTS_COLLECTION), {
    ...appointment,
    dateTime: Timestamp.fromDate(appointmentDate),
    status: 'pending',
    createdAt: now,
    updatedAt: now
  });
  
  return docRef.id;
};

// Get appointments by patient ID
export const getAppointmentsByPatient = async (patientId: string): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where('patientId', '==', patientId),
      orderBy('dateTime', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToAppointment);
  } catch {
    return [];
  }
};

// Get appointments by provider ID
export const getAppointmentsByProvider = async (providerId: string): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where('providerId', '==', providerId),
      orderBy('dateTime', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToAppointment);
  } catch {
    return [];
  }
};

// Update appointment status
export const updateAppointmentStatus = async (
  id: string, 
  status: Appointment['status']
): Promise<void> => {
  const docRef = doc(db, APPOINTMENTS_COLLECTION, id);
  await updateDoc(docRef, {
    status,
    updatedAt: Timestamp.now()
  });
};

// Cancel an appointment
export const cancelAppointment = async (id: string): Promise<void> => {
  return updateAppointmentStatus(id, 'cancelled');
};

// Confirm an appointment (provider action)
export const confirmAppointment = async (id: string): Promise<void> => {
  return updateAppointmentStatus(id, 'confirmed');
};

// Complete an appointment (provider action)
export const completeAppointment = async (id: string): Promise<void> => {
  return updateAppointmentStatus(id, 'completed');
};

// Subscribe to real-time appointment updates for a patient
export const subscribeToPatientAppointments = (
  patientId: string,
  callback: (appointments: Appointment[]) => void
): (() => void) => {
  const q = query(
    collection(db, APPOINTMENTS_COLLECTION),
    where('patientId', '==', patientId),
    orderBy('dateTime', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const appointments = snapshot.docs.map(docToAppointment);
    callback(appointments);
  });
};

// Subscribe to real-time appointment updates for a provider
export const subscribeToProviderAppointments = (
  providerId: string,
  callback: (appointments: Appointment[]) => void
): (() => void) => {
  const q = query(
    collection(db, APPOINTMENTS_COLLECTION),
    where('providerId', '==', providerId),
    orderBy('dateTime', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const appointments = snapshot.docs.map(docToAppointment);
    callback(appointments);
  });
};

// Get upcoming appointments count for a provider (this week)
export const getUpcomingAppointmentsCount = async (providerId: string): Promise<number> => {
  const appointments = await getAppointmentsByProvider(providerId);
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return appointments.filter(apt => {
    const aptDate = new Date(apt.dateTime);
    return aptDate >= now && aptDate <= weekFromNow && apt.status !== 'cancelled';
  }).length;
};

// Get all appointments count for platform stats (admin)
export const getAllAppointmentsCount = async (): Promise<number> => {
  try {
    const snapshot = await getDocs(collection(db, APPOINTMENTS_COLLECTION));
    return snapshot.size;
  } catch {
    return 0;
  }
};
