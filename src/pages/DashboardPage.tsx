import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats, useServiceCalls, useInsuranceRenewals } from '@/hooks/useSupabase';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable } from '@/components/common/DataTable';
import { ServiceMaster, InsuranceRenewal } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Car,
  Wrench,
  AlertTriangle,
  Shield,
  Phone,
  TrendingUp,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const { data: stats, isLoading: statsLoading } = useDashboardStats(user?.id, isAdmin);
  const { data: serviceCalls, isLoading: serviceLoading } = useServiceCalls();
  const { data: insuranceCalls, isLoading: insuranceLoading } = useInsuranceRenewals();

  // Get urgent items
  const overdueServices = (serviceCalls || []).filter(s => s.status === 'overdue').slice(0, 5);
  const upcomingInsurance = (insuranceCalls || [])
    .filter(i => i.status === 'planned' || i.status === 'called')
    .slice(0, 5);

  const serviceColumns = [
    { key: 'regNo', header: 'Reg No' },
    { key: 'customerName', header: 'Customer' },
    { key: 'serviceType', header: 'Service' },
    { key: 'expectedDate', header: 'Due Date' },
    {
      key: 'status',
      header: 'Status',
      render: (item: ServiceMaster) => <StatusBadge status={item.status} />,
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (item: ServiceMaster) => <StatusBadge status={item.priority} />,
    },
  ];

  const insuranceColumns = [
    { key: 'regNo', header: 'Reg No' },
    { key: 'customerName', header: 'Customer' },
    { key: 'policyExpiryDate', header: 'Expiry' },
    {
      key: 'status',
      header: 'Status',
      render: (item: InsuranceRenewal) => <StatusBadge status={item.status} />,
    },
  ];

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your {isAdmin ? 'dealership' : 'calls'} today
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Vehicles"
          value={stats?.totalVehicles?.toLocaleString() || '0'}
          icon={Car}
          variant="primary"
        />
        <StatCard
          title="Service Due"
          value={stats?.serviceDue || 0}
          icon={Wrench}
          variant="warning"
          trend={{ value: 12, isPositive: false }}
        />
        <StatCard
          title="Service Overdue"
          value={stats?.serviceOverdue || 0}
          icon={AlertTriangle}
          variant="danger"
        />
        <StatCard
          title="Insurance Due"
          value={stats?.insuranceDue || 0}
          icon={Shield}
          variant="warning"
        />
        <StatCard
          title="Calls Today"
          value={stats?.callsToday || 0}
          icon={Phone}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Conversions"
          value={stats?.conversionsToday || 0}
          icon={TrendingUp}
          variant="success"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Tables Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Overdue Services */}
        <Card className="border-2 border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Overdue Services
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => navigate('/service-calls')}
            >
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {serviceLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <DataTable
                data={overdueServices}
                columns={serviceColumns}
                emptyMessage="No overdue services"
              />
            )}
          </CardContent>
        </Card>

        {/* Upcoming Insurance Renewals */}
        <Card className="border-2 border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-warning" />
              Insurance Renewals Due
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => navigate('/insurance')}
            >
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {insuranceLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <DataTable
                data={upcomingInsurance}
                columns={insuranceColumns}
                emptyMessage="No pending renewals"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Admin */}
      {isAdmin && (
        <Card className="border-2 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => navigate('/upload')}>
                Upload Vehicle Data
              </Button>
              <Button variant="outline" onClick={() => navigate('/agents')}>
                Manage Agents
              </Button>
              <Button variant="outline" onClick={() => navigate('/reports')}>
                View Reports
              </Button>
              <Button variant="default">
                Auto-Allocate Work
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
