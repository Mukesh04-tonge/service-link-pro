// User Types
export type UserRole = 'admin' | 'agent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

// Vehicle Types
export interface VehicleData {
  binNo: string;
  productLine: string;
  vcNo: string;
  saleDate: string;
  regNo: string;
  customerName: string;
  mobile1: string;
  mobile2?: string;
  mobile3?: string;
}

// Service Record Types
export interface ServiceRecord {
  jcNo: string;
  jcClosedDate: string;
  serviceType: string;
  kmRuns: number;
  binNo: string;
}

// Service Schedule Types
export interface ServiceSchedule {
  vcNo: string;
  productLine: string;
  serviceType: string;
  freeService: boolean;
  frequencyDays: number;
  kmFrequency: number;
  maxServices: number;
  variationDays: number;
  variationKms: number;
}

// Service Master Types
export type ServiceStatus = 'planned' | 'called' | 'booked' | 'serviced' | 'not_interested' | 'wrong_number' | 'overdue';
export type Priority = 'high' | 'medium' | 'low';

export interface ServiceMaster {
  id: string;
  binNo: string;
  regNo: string;
  customerName: string;
  mobile: string;
  productLine: string;
  serviceType: string;
  freeService: boolean;
  expectedDate: string;
  expectedKms: number;
  status: ServiceStatus;
  agentId?: string;
  agentName?: string;
  priority: Priority;
  lastCallDate?: string;
  nextFollowUpDate?: string;
  callRemarks?: string;
}

// Insurance Types
export type InsuranceStatus = 'planned' | 'called' | 'renewed' | 'shifted' | 'not_interested';

export interface InsuranceData {
  binNo: string;
  regNo: string;
  policyDate: string;
  policyType?: string;
}

export interface InsuranceRenewal {
  id: string;
  binNo: string;
  regNo: string;
  customerName: string;
  mobile: string;
  lastPolicyDate: string;
  policyExpiryDate: string;
  expectedRenewalDate: string;
  status: InsuranceStatus;
  agentId?: string;
  agentName?: string;
  lastCallDate?: string;
  nextFollowUpDate?: string;
  callRemarks?: string;
}

// Call Update Types
export type CallOutcome = 'connected' | 'not_connected' | 'switched_off' | 'wrong_number';
export type CustomerDecision = 'will_book' | 'not_interested' | 'already_serviced' | 'sold_vehicle' | 'follow_up';

export interface CallUpdate {
  outcome: CallOutcome;
  decision?: CustomerDecision;
  nextFollowUpDate?: string;
  bookingDate?: string;
  remarks: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalVehicles: number;
  serviceDue: number;
  serviceOverdue: number;
  insuranceDue: number;
  callsToday: number;
  conversionsToday: number;
}
