import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Type helpers for database tables
export interface DbUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'agent';
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DbVehicle {
  id: string;
  bin_no: string;
  product_line: string;
  vc_no: string;
  sale_date: string;
  reg_no: string;
  customer_name: string;
  mobile1: string;
  mobile2?: string | null;
  mobile3?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbServiceMaster {
  id: string;
  bin_no: string;
  reg_no: string;
  customer_name: string;
  mobile: string;
  product_line: string;
  service_type: string;
  free_service: boolean;
  expected_date: string;
  expected_kms: number;
  status: 'planned' | 'called' | 'booked' | 'serviced' | 'not_interested' | 'wrong_number' | 'overdue';
  agent_id?: string | null;
  agent_name?: string | null;
  priority: 'high' | 'medium' | 'low';
  last_call_date?: string | null;
  next_follow_up_date?: string | null;
  call_remarks?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbInsuranceRenewal {
  id: string;
  bin_no: string;
  reg_no: string;
  customer_name: string;
  mobile: string;
  last_policy_date: string;
  policy_expiry_date: string;
  expected_renewal_date: string;
  status: 'planned' | 'called' | 'renewed' | 'shifted' | 'not_interested';
  agent_id?: string | null;
  agent_name?: string | null;
  last_call_date?: string | null;
  next_follow_up_date?: string | null;
  call_remarks?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbCallLog {
  id: string;
  service_master_id?: string | null;
  insurance_renewal_id?: string | null;
  agent_id?: string | null;
  agent_name?: string | null;
  customer_name: string;
  mobile: string;
  call_date?: string;
  call_duration?: number | null;
  call_status?: 'answered' | 'not_answered' | 'busy' | 'wrong_number' | 'switched_off' | null;
  call_outcome?: 'interested' | 'not_interested' | 'callback_requested' | 'booked' | 'completed' | 'no_response' | null;
  remarks?: string | null;
  next_follow_up_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbServiceReminder {
  id: string;
  vehicle_id?: string | null;
  bin_no: string;
  reg_no: string;
  customer_name: string;
  mobile: string;
  product_line: string;
  last_service_date?: string | null;
  last_service_kms?: number | null;
  next_service_date: string;
  next_service_kms: number;
  service_type: string;
  reminder_status?: 'pending' | 'sent' | 'acknowledged' | 'completed' | 'cancelled';
  reminder_sent_date?: string | null;
  reminder_method?: 'sms' | 'call' | 'email' | 'whatsapp' | null;
  agent_id?: string | null;
  agent_name?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

