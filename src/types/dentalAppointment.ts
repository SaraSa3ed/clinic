export interface DentalAppointment {
  appointment_id: string;
  patient_name: string;
  patient_phone: string;
  patient_email?: string;
  doctor_id?: string;
  doctor_name?: string;
  treatment_id?: string;
  treatment_name?: string;
  treatment_type?: string;
  tooth_number?: string;
  consultation_fee?: number;
  treatment_cost?: number;
  appointment_datetime: string;
  visit_date: string;
  next_appointment?: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  diagnosis?: string;
  notes?: string;
  payment_amount?: number;
  discount_amount?: number;
  remaining_amount?: number;
  payment_method?: 'cash' | 'card' | 'insurance' | 'installment';
  insurance_company?: string;
  insurance_coverage?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentRequest {
  patient_name: string;
  patient_phone: string;
  patient_email?: string;
  doctor_id?: string;
  doctor_name?: string;
  treatment_id?: string;
  treatment_name?: string;
  treatment_type?: string;
  tooth_number?: string;
  consultation_fee?: number;
  treatment_cost?: number;
  appointment_datetime: string;
  visit_date: string;
  next_appointment?: string;
  diagnosis?: string;
  notes?: string;
  status?: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  payment_amount?: number;
  discount_amount?: number;
  remaining_amount?: number;
  payment_method?: 'cash' | 'card' | 'insurance' | 'installment';
  insurance_company?: string;
  insurance_coverage?: number;
}

export interface UpdateAppointmentRequest extends Partial<CreateAppointmentRequest> {
  appointment_id?: string;
}

export interface Doctor {
  doctor_id: string;
  doctor_name: string;
  specialty?: string;
  phone?: string;
  email?: string;
}

export interface Treatment {
  treatment_id: string;
  treatment_name: string;
  treatment_type?: string;
  cost?: number;
  duration?: number; // بالدقائق
  description?: string;
}
