import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, DbUser, DbVehicle, DbServiceMaster, DbInsuranceRenewal } from '@/lib/supabase';
import { User, VehicleData, ServiceMaster, InsuranceRenewal, DashboardStats } from '@/types';

// Transform database row to frontend type
const transformUser = (row: DbUser): User => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    active: row.active,
});

const transformVehicle = (row: DbVehicle): VehicleData => ({
    binNo: row.bin_no,
    productLine: row.product_line,
    vcNo: row.vc_no,
    saleDate: row.sale_date,
    regNo: row.reg_no,
    customerName: row.customer_name,
    mobile1: row.mobile1,
    mobile2: row.mobile2 || undefined,
    mobile3: row.mobile3 || undefined,
});

const transformServiceMaster = (row: DbServiceMaster): ServiceMaster => ({
    id: row.id,
    binNo: row.bin_no,
    regNo: row.reg_no,
    customerName: row.customer_name,
    mobile: row.mobile,
    productLine: row.product_line,
    serviceType: row.service_type,
    freeService: row.free_service,
    expectedDate: row.expected_date,
    expectedKms: row.expected_kms,
    status: row.status,
    agentId: row.agent_id || undefined,
    agentName: row.agent_name || undefined,
    priority: row.priority,
    lastCallDate: row.last_call_date || undefined,
    nextFollowUpDate: row.next_follow_up_date || undefined,
    callRemarks: row.call_remarks || undefined,
});

const transformInsuranceRenewal = (row: DbInsuranceRenewal): InsuranceRenewal => ({
    id: row.id,
    binNo: row.bin_no,
    regNo: row.reg_no,
    customerName: row.customer_name,
    mobile: row.mobile,
    lastPolicyDate: row.last_policy_date,
    policyExpiryDate: row.policy_expiry_date,
    expectedRenewalDate: row.expected_renewal_date,
    status: row.status,
    agentId: row.agent_id || undefined,
    agentName: row.agent_name || undefined,
    lastCallDate: row.last_call_date || undefined,
    nextFollowUpDate: row.next_follow_up_date || undefined,
    callRemarks: row.call_remarks || undefined,
});

// ============ USERS ============
export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('name');

            if (error) throw error;
            return (data as DbUser[]).map(transformUser);
        },
    });
};

export const useAgents = () => {
    return useQuery({
        queryKey: ['agents'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'agent')
                .order('name');

            if (error) throw error;
            return (data as DbUser[]).map(transformUser);
        },
    });
};

export const useAddUser = () => {
    const queryClient = useQueryClient();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    return useMutation({
        mutationFn: async (user: { name: string; email: string; password: string; role: 'admin' | 'agent'; active: boolean }) => {
            const token = localStorage.getItem('auth_token');

            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create user');
            }

            const data = await response.json();
            return transformUser(data.user as DbUser);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['agents'] });
        },
    });
};

export const useUpdateUserStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, active }: { userId: string; active: boolean }) => {
            const { error } = await supabase
                .from('users')
                .update({ active, updated_at: new Date().toISOString() })
                .eq('id', userId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['agents'] });
        },
    });
};

// ============ VEHICLES ============
export const useVehicles = () => {
    return useQuery({
        queryKey: ['vehicles'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .order('customer_name');

            if (error) throw error;
            return (data as DbVehicle[]).map(transformVehicle);
        },
    });
};

// ============ SERVICE CALLS ============
export const useServiceCalls = () => {
    return useQuery({
        queryKey: ['service_calls'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('service_master')
                .select('*')
                .order('expected_date');

            if (error) throw error;
            return (data as DbServiceMaster[]).map(transformServiceMaster);
        },
    });
};

export const useAgentServiceCalls = (agentId: string) => {
    return useQuery({
        queryKey: ['service_calls', 'agent', agentId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('service_master')
                .select('*')
                .eq('agent_id', agentId)
                .order('expected_date');

            if (error) throw error;
            return (data as DbServiceMaster[]).map(transformServiceMaster);
        },
        enabled: !!agentId,
    });
};

export const useUpdateServiceCall = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            status,
            callRemarks,
            nextFollowUpDate
        }: {
            id: string;
            status?: ServiceMaster['status'];
            callRemarks?: string;
            nextFollowUpDate?: string;
        }) => {
            const { error } = await supabase
                .from('service_master')
                .update({
                    status,
                    call_remarks: callRemarks,
                    next_follow_up_date: nextFollowUpDate,
                    last_call_date: new Date().toISOString().split('T')[0],
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service_calls'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
        },
    });
};

// ============ INSURANCE RENEWALS ============
export const useInsuranceRenewals = () => {
    return useQuery({
        queryKey: ['insurance_renewals'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('insurance_renewals')
                .select('*')
                .order('policy_expiry_date');

            if (error) throw error;
            return (data as DbInsuranceRenewal[]).map(transformInsuranceRenewal);
        },
    });
};

export const useAgentInsuranceCalls = (agentId: string) => {
    return useQuery({
        queryKey: ['insurance_renewals', 'agent', agentId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('insurance_renewals')
                .select('*')
                .eq('agent_id', agentId)
                .order('policy_expiry_date');

            if (error) throw error;
            return (data as DbInsuranceRenewal[]).map(transformInsuranceRenewal);
        },
        enabled: !!agentId,
    });
};

export const useUpdateInsuranceCall = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            status,
            callRemarks,
            nextFollowUpDate
        }: {
            id: string;
            status?: InsuranceRenewal['status'];
            callRemarks?: string;
            nextFollowUpDate?: string;
        }) => {
            const { error } = await supabase
                .from('insurance_renewals')
                .update({
                    status,
                    call_remarks: callRemarks,
                    next_follow_up_date: nextFollowUpDate,
                    last_call_date: new Date().toISOString().split('T')[0],
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['insurance_renewals'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
        },
    });
};

// ============ DASHBOARD STATS ============
export const useDashboardStats = (userId?: string, isAdmin?: boolean) => {
    return useQuery({
        queryKey: ['dashboard_stats', userId, isAdmin],
        queryFn: async (): Promise<DashboardStats> => {
            // For admin, get all stats; for agent, get their specific stats
            if (isAdmin) {
                // Get counts from service_master and insurance_renewals
                const [vehiclesRes, serviceRes, insuranceRes] = await Promise.all([
                    supabase.from('vehicles').select('*', { count: 'exact', head: true }),
                    supabase.from('service_master').select('*'),
                    supabase.from('insurance_renewals').select('*'),
                ]);

                const serviceCalls = (serviceRes.data || []) as DbServiceMaster[];
                const insuranceCalls = (insuranceRes.data || []) as DbInsuranceRenewal[];
                const today = new Date().toISOString().split('T')[0];

                return {
                    totalVehicles: vehiclesRes.count || 0,
                    serviceDue: serviceCalls.filter(s => s.status === 'planned' || s.status === 'called').length,
                    serviceOverdue: serviceCalls.filter(s => s.status === 'overdue').length,
                    insuranceDue: insuranceCalls.filter(i => i.status === 'planned' || i.status === 'called').length,
                    callsToday: serviceCalls.filter(s => s.last_call_date === today).length +
                        insuranceCalls.filter(i => i.last_call_date === today).length,
                    conversionsToday: serviceCalls.filter(s => s.status === 'booked' && s.updated_at?.startsWith(today)).length +
                        insuranceCalls.filter(i => i.status === 'renewed' && i.updated_at?.startsWith(today)).length,
                };
            } else if (userId) {
                // Get agent-specific stats
                const [serviceRes, insuranceRes] = await Promise.all([
                    supabase.from('service_master').select('*').eq('agent_id', userId),
                    supabase.from('insurance_renewals').select('*').eq('agent_id', userId),
                ]);

                const serviceCalls = (serviceRes.data || []) as DbServiceMaster[];
                const insuranceCalls = (insuranceRes.data || []) as DbInsuranceRenewal[];
                const today = new Date().toISOString().split('T')[0];

                return {
                    totalVehicles: serviceCalls.length + insuranceCalls.length,
                    serviceDue: serviceCalls.filter(s => s.status === 'planned' || s.status === 'called').length,
                    serviceOverdue: serviceCalls.filter(s => s.status === 'overdue').length,
                    insuranceDue: insuranceCalls.filter(i => i.status === 'planned' || i.status === 'called').length,
                    callsToday: serviceCalls.filter(s => s.last_call_date === today).length +
                        insuranceCalls.filter(i => i.last_call_date === today).length,
                    conversionsToday: serviceCalls.filter(s => s.status === 'booked' && s.updated_at?.startsWith(today)).length +
                        insuranceCalls.filter(i => i.status === 'renewed' && i.updated_at?.startsWith(today)).length,
                };
            }

            // Default empty stats
            return {
                totalVehicles: 0,
                serviceDue: 0,
                serviceOverdue: 0,
                insuranceDue: 0,
                callsToday: 0,
                conversionsToday: 0,
            };
        },
    });
};

// ============ REPORTS STATS ============
export const useReportsStats = () => {
    return useQuery({
        queryKey: ['reports_stats'],
        queryFn: async () => {
            const [serviceRes, insuranceRes, usersRes] = await Promise.all([
                supabase.from('service_master').select('*'),
                supabase.from('insurance_renewals').select('*'),
                supabase.from('users').select('*').eq('role', 'agent'),
            ]);

            if (serviceRes.error) throw serviceRes.error;
            if (insuranceRes.error) throw insuranceRes.error;
            if (usersRes.error) throw usersRes.error;

            const services = (serviceRes.data || []) as DbServiceMaster[];
            const insurance = (insuranceRes.data || []) as DbInsuranceRenewal[];
            const agents = (usersRes.data || []) as DbUser[];

            // 1. Calculate Aggregates
            const actionStatuses = ['called', 'booked', 'serviced', 'not_interested', 'wrong_number', 'renewed', 'shifted'];

            const activeServiceCalls = services.filter(s => actionStatuses.includes(s.status)).length;
            const activeInsuranceCalls = insurance.filter(i => actionStatuses.includes(i.status)).length;
            const totalCalls = activeServiceCalls + activeInsuranceCalls;

            const serviceConversions = services.filter(s => s.status === 'booked' || s.status === 'serviced').length;
            const insuranceConversions = insurance.filter(i => i.status === 'renewed').length;

            const serviceConversionRate = activeServiceCalls > 0 ? Math.round((serviceConversions / activeServiceCalls) * 100) : 0;

            // 2. Agent Performance
            const agentStats = agents.map(agent => {
                const agentServices = services.filter(s => s.agent_id === agent.id);
                const acted = agentServices.filter(s => actionStatuses.includes(s.status)).length;
                const converted = agentServices.filter(s => s.status === 'booked' || s.status === 'serviced').length;
                const rate = acted > 0 ? Math.round((converted / acted) * 100) : 0;

                return {
                    name: agent.name.split(' ')[0],
                    calls: acted,
                    conversions: converted,
                    rate: rate
                };
            }).sort((a, b) => b.conversions - a.conversions);

            // 3. Monthly Trends
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const trendMap = new Map<string, { service: number, insurance: number }>();

            const today = new Date();
            for (let i = 5; i >= 0; i--) {
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const key = months[d.getMonth()];
                trendMap.set(key, { service: 0, insurance: 0 });
            }

            services.forEach(s => {
                const d = new Date(s.expected_date); // Use expected date for planning trend
                const monthName = months[d.getMonth()];
                if (trendMap.has(monthName)) {
                    trendMap.get(monthName)!.service++;
                }
            });

            insurance.forEach(i => {
                const d = new Date(i.expected_renewal_date); // Use expected renewal
                const monthName = months[d.getMonth()];
                if (trendMap.has(monthName)) {
                    trendMap.get(monthName)!.insurance++;
                }
            });

            const monthlyTrend = Array.from(trendMap.entries()).map(([month, data]) => ({
                month,
                service: data.service,
                insurance: data.insurance
            }));

            // 4. Service Conversion Data
            const bookedCount = services.filter(s => s.status === 'booked').length;
            const notInterestedCount = services.filter(s => s.status === 'not_interested').length;
            const pendingCount = services.filter(s => s.status === 'planned' || s.status === 'called' || s.status === 'overdue').length;

            const conversionData = [
                { name: 'Total', booked: bookedCount, notInterested: notInterestedCount, pending: pendingCount }
            ];

            // 5. Insurance Status Data
            const renewedCount = insurance.filter(i => i.status === 'renewed').length;
            // 'shifted' doesn't exist in enum in schema? Schema says: 'planned', 'called', 'renewed', 'shifted', 'not_interested' YES it does.
            const shiftedCount = insurance.filter(i => i.status === 'shifted').length;
            const insNotInterested = insurance.filter(i => i.status === 'not_interested').length;
            const insPending = insurance.filter(i => i.status === 'planned' || i.status === 'called').length;

            const insuranceStatusData = [
                { name: 'Renewed', value: renewedCount, color: 'hsl(142, 76%, 36%)' },
                { name: 'Pending', value: insPending, color: 'hsl(38, 92%, 50%)' },
                { name: 'Shifted', value: shiftedCount, color: 'hsl(0, 72%, 51%)' },
                { name: 'Not Interested', value: insNotInterested, color: 'hsl(217, 33%, 17%)' },
            ].filter(d => d.value > 0);

            if (insuranceStatusData.length === 0) {
                insuranceStatusData.push({ name: 'No Data', value: 1, color: 'hsl(220, 13%, 80%)' });
            }

            return {
                totalCalls,
                serviceConversions,
                insuranceRenewed: insuranceConversions,
                activeAgents: agents.length,
                serviceConversionRate,
                agentPerformance: agentStats,
                monthlyTrend,
                conversionData,
                insuranceStatusData
            };
        },
    });
};
