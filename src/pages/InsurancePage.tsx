import React, { useState } from 'react';
import { useInsuranceRenewals, useUpdateInsuranceCall } from '@/hooks/useSupabase';
import { InsuranceRenewal } from '@/types';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Phone, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const InsurancePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<InsuranceRenewal | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [callRemarks, setCallRemarks] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [nextFollowUp, setNextFollowUp] = useState('');

  const { data: insuranceRenewals = [], isLoading } = useInsuranceRenewals();
  const updateMutation = useUpdateInsuranceCall();

  const filteredData = insuranceRenewals.filter((item) => {
    const matchesSearch =
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mobile.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCallClick = (item: InsuranceRenewal) => {
    setSelectedItem(item);
    setCallRemarks(item.callRemarks || '');
    setSelectedStatus(item.status);
    setNextFollowUp(item.nextFollowUpDate || '');
    setIsDialogOpen(true);
  };

  const handleUpdateCall = async () => {
    if (!selectedItem) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedItem.id,
        status: selectedStatus as InsuranceRenewal['status'],
        callRemarks,
        nextFollowUpDate: nextFollowUp || undefined,
      });
      toast.success('Insurance call status updated');
      setIsDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  const columns = [
    {
      key: 'regNo',
      header: 'Reg No',
      render: (item: InsuranceRenewal) => (
        <span className="font-medium text-foreground">{item.regNo}</span>
      ),
    },
    { key: 'customerName', header: 'Customer' },
    {
      key: 'mobile',
      header: 'Mobile',
      render: (item: InsuranceRenewal) => (
        <a href={`tel:${item.mobile}`} className="text-info hover:underline">
          {item.mobile}
        </a>
      ),
    },
    { key: 'lastPolicyDate', header: 'Last Policy' },
    {
      key: 'policyExpiryDate',
      header: 'Expiry Date',
      render: (item: InsuranceRenewal) => {
        const isExpired = new Date(item.policyExpiryDate) < new Date();
        return (
          <span className={isExpired ? 'text-destructive font-medium' : ''}>
            {item.policyExpiryDate}
          </span>
        );
      },
    },
    { key: 'expectedRenewalDate', header: 'Call Due' },
    {
      key: 'status',
      header: 'Status',
      render: (item: InsuranceRenewal) => <StatusBadge status={item.status} />,
    },
    { key: 'agentName', header: 'Agent' },
    { key: 'nextFollowUpDate', header: 'Follow-up' },
    {
      key: 'actions',
      header: 'Action',
      render: (item: InsuranceRenewal) => (
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={(e) => {
            e.stopPropagation();
            handleCallClick(item);
          }}
        >
          <Phone className="h-3 w-3" />
          Update
        </Button>
      ),
    },
  ];

  const renewedCount = filteredData.filter(d => d.status === 'renewed').length;
  const pendingCount = filteredData.filter(d => d.status === 'planned' || d.status === 'called').length;
  const lostCount = filteredData.filter(d => d.status === 'shifted' || d.status === 'not_interested').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Insurance Renewals</h1>
        <p className="text-muted-foreground">
          Track and manage insurance renewal follow-ups
        </p>
      </div>

      {/* Filters */}
      <Card className="border-2 border-border bg-card shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, reg no, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="called">Called</SelectItem>
                <SelectItem value="renewed">Renewed</SelectItem>
                <SelectItem value="shifted">Shifted to Other</SelectItem>
                <SelectItem value="not_interested">Not Interested</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border-2 border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Total</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">{filteredData.length}</p>
        </div>
        <div className="rounded-lg border-2 border-warning/40 bg-warning/10 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-warning">{pendingCount}</p>
        </div>
        <div className="rounded-lg border-2 border-success/40 bg-success/10 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <p className="text-sm font-medium text-muted-foreground">Renewed</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-success">{renewedCount}</p>
        </div>
        <div className="rounded-lg border-2 border-destructive/40 bg-destructive/10 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm font-medium text-muted-foreground">Lost</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-destructive">{lostCount}</p>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        emptyMessage="No insurance renewals found"
      />

      {/* Call Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Insurance Call</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Customer:</span>
                    <p className="font-medium">{selectedItem.customerName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reg No:</span>
                    <p className="font-medium">{selectedItem.regNo}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mobile:</span>
                    <p className="font-medium">{selectedItem.mobile}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expiry:</span>
                    <p className="font-medium">{selectedItem.policyExpiryDate}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Renewal Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="called">Called</SelectItem>
                    <SelectItem value="renewed">Renewed with Us</SelectItem>
                    <SelectItem value="shifted">Shifted to Other Insurer</SelectItem>
                    <SelectItem value="not_interested">Not Interested</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Next Follow-up Date</Label>
                <Input
                  type="date"
                  value={nextFollowUp}
                  onChange={(e) => setNextFollowUp(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Remarks</Label>
                <Textarea
                  placeholder="Add call notes..."
                  value={callRemarks}
                  onChange={(e) => setCallRemarks(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCall}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InsurancePage;
