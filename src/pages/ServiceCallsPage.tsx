import React, { useState } from 'react';
import { useServiceCalls, useUpdateServiceCall } from '@/hooks/useSupabase';
import { ServiceMaster } from '@/types';
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
import { Search, Filter, Phone } from 'lucide-react';
import { toast } from 'sonner';

const ServiceCallsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedCall, setSelectedCall] = useState<ServiceMaster | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [callRemarks, setCallRemarks] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [nextFollowUp, setNextFollowUp] = useState('');

  const { data: serviceCalls = [], isLoading } = useServiceCalls();
  const updateMutation = useUpdateServiceCall();

  const filteredData = serviceCalls.filter((item) => {
    const matchesSearch =
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mobile.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' ||
      (typeFilter === 'free' && item.freeService) ||
      (typeFilter === 'paid' && !item.freeService);

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCallClick = (item: ServiceMaster) => {
    setSelectedCall(item);
    setCallRemarks(item.callRemarks || '');
    setSelectedStatus(item.status);
    setNextFollowUp(item.nextFollowUpDate || '');
    setIsDialogOpen(true);
  };

  const handleUpdateCall = async () => {
    if (!selectedCall) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedCall.id,
        status: selectedStatus as ServiceMaster['status'],
        callRemarks,
        nextFollowUpDate: nextFollowUp || undefined,
      });
      toast.success('Call status updated successfully');
      setIsDialogOpen(false);
      setSelectedCall(null);
    } catch (error) {
      toast.error('Failed to update call status');
      console.error(error);
    }
  };

  const columns = [
    {
      key: 'regNo',
      header: 'Reg No',
      render: (item: ServiceMaster) => (
        <span className="font-medium text-foreground">{item.regNo}</span>
      ),
    },
    { key: 'customerName', header: 'Customer' },
    {
      key: 'mobile',
      header: 'Mobile',
      render: (item: ServiceMaster) => (
        <a href={`tel:${item.mobile}`} className="text-info hover:underline">
          {item.mobile}
        </a>
      ),
    },
    { key: 'productLine', header: 'Product' },
    {
      key: 'serviceType',
      header: 'Service',
      render: (item: ServiceMaster) => (
        <div className="flex items-center gap-2">
          <span>{item.serviceType}</span>
          {item.freeService && (
            <span className="rounded bg-success/20 px-1.5 py-0.5 text-xs text-success">Free</span>
          )}
        </div>
      ),
    },
    {
      key: 'expectedDate',
      header: 'Due Date',
      render: (item: ServiceMaster) => (
        <span className={item.status === 'overdue' ? 'text-destructive font-medium' : ''}>
          {item.expectedDate}
        </span>
      ),
    },
    {
      key: 'expectedKms',
      header: 'Expected KMs',
      render: (item: ServiceMaster) => item.expectedKms.toLocaleString(),
    },
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
    { key: 'agentName', header: 'Agent' },
    {
      key: 'actions',
      header: 'Action',
      render: (item: ServiceMaster) => (
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
        <h1 className="text-2xl font-bold text-foreground">Service Calls</h1>
        <p className="text-muted-foreground">
          Manage and track all service follow-up calls
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
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="called">Called</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="serviced">Serviced</SelectItem>
                <SelectItem value="not_interested">Not Interested</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="free">Free Service</SelectItem>
                <SelectItem value="paid">Paid Service</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border-2 border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground">{filteredData.length}</p>
        </div>
        <div className="rounded-lg border-2 border-warning/40 bg-warning/10 p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Due Today</p>
          <p className="text-2xl font-bold text-warning">
            {filteredData.filter(d => d.expectedDate === new Date().toISOString().split('T')[0]).length}
          </p>
        </div>
        <div className="rounded-lg border-2 border-destructive/40 bg-destructive/10 p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Overdue</p>
          <p className="text-2xl font-bold text-destructive">
            {filteredData.filter(d => d.status === 'overdue').length}
          </p>
        </div>
        <div className="rounded-lg border-2 border-success/40 bg-success/10 p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Booked</p>
          <p className="text-2xl font-bold text-success">
            {filteredData.filter(d => d.status === 'booked').length}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        emptyMessage="No service calls found"
      />

      {/* Call Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Call Status</DialogTitle>
          </DialogHeader>
          {selectedCall && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Customer:</span>
                    <p className="font-medium">{selectedCall.customerName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reg No:</span>
                    <p className="font-medium">{selectedCall.regNo}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mobile:</span>
                    <p className="font-medium">{selectedCall.mobile}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Service:</span>
                    <p className="font-medium">{selectedCall.serviceType}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Call Outcome</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="called">Called</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="serviced">Serviced</SelectItem>
                    <SelectItem value="not_interested">Not Interested</SelectItem>
                    <SelectItem value="wrong_number">Wrong Number</SelectItem>
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

export default ServiceCallsPage;
