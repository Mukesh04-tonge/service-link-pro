import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAgentServiceCalls, useAgentInsuranceCalls, useUpdateServiceCall, useUpdateInsuranceCall } from '@/hooks/useSupabase';
import { ServiceMaster, InsuranceRenewal } from '@/types';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Phone, Wrench, Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const MyCallsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState<ServiceMaster | null>(null);
  const [selectedInsurance, setSelectedInsurance] = useState<InsuranceRenewal | null>(null);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isInsuranceDialogOpen, setIsInsuranceDialogOpen] = useState(false);
  const [serviceStatus, setServiceStatus] = useState('');
  const [insuranceStatus, setInsuranceStatus] = useState('');
  const [serviceRemarks, setServiceRemarks] = useState('');
  const [insuranceRemarks, setInsuranceRemarks] = useState('');
  const [serviceFollowUp, setServiceFollowUp] = useState('');
  const [insuranceFollowUp, setInsuranceFollowUp] = useState('');

  const { data: serviceCalls = [], isLoading: serviceLoading } = useAgentServiceCalls(user?.id || '');
  const { data: insuranceCalls = [], isLoading: insuranceLoading } = useAgentInsuranceCalls(user?.id || '');
  const updateServiceMutation = useUpdateServiceCall();
  const updateInsuranceMutation = useUpdateInsuranceCall();

  const overdueServiceCalls = serviceCalls.filter(s => s.status === 'overdue');
  const todayServiceCalls = serviceCalls.filter(s => s.status === 'planned' || s.status === 'called');
  const pendingInsurance = insuranceCalls.filter(i => i.status === 'planned' || i.status === 'called');

  const handleServiceCall = (item: ServiceMaster) => {
    setSelectedService(item);
    setServiceStatus(item.status);
    setServiceRemarks(item.callRemarks || '');
    setServiceFollowUp(item.nextFollowUpDate || '');
    setIsServiceDialogOpen(true);
  };

  const handleInsuranceCall = (item: InsuranceRenewal) => {
    setSelectedInsurance(item);
    setInsuranceStatus(item.status);
    setInsuranceRemarks(item.callRemarks || '');
    setInsuranceFollowUp(item.nextFollowUpDate || '');
    setIsInsuranceDialogOpen(true);
  };

  const handleUpdateService = async () => {
    if (!selectedService) return;

    try {
      await updateServiceMutation.mutateAsync({
        id: selectedService.id,
        status: serviceStatus as ServiceMaster['status'],
        callRemarks: serviceRemarks,
        nextFollowUpDate: serviceFollowUp || undefined,
      });
      toast.success('Service call updated');
      setIsServiceDialogOpen(false);
      setSelectedService(null);
    } catch (error) {
      toast.error('Failed to update service call');
      console.error(error);
    }
  };

  const handleUpdateInsurance = async () => {
    if (!selectedInsurance) return;

    try {
      await updateInsuranceMutation.mutateAsync({
        id: selectedInsurance.id,
        status: insuranceStatus as InsuranceRenewal['status'],
        callRemarks: insuranceRemarks,
        nextFollowUpDate: insuranceFollowUp || undefined,
      });
      toast.success('Insurance call updated');
      setIsInsuranceDialogOpen(false);
      setSelectedInsurance(null);
    } catch (error) {
      toast.error('Failed to update insurance call');
      console.error(error);
    }
  };

  const serviceColumns = [
    {
      key: 'priority',
      header: '',
      render: (item: ServiceMaster) => (
        <div className={`h-2 w-2 rounded-full ${item.priority === 'high' ? 'bg-destructive' :
            item.priority === 'medium' ? 'bg-warning' : 'bg-muted-foreground'
          }`} />
      ),
    },
    {
      key: 'regNo',
      header: 'Vehicle',
      render: (item: ServiceMaster) => (
        <div>
          <p className="font-medium text-foreground">{item.regNo}</p>
          <p className="text-sm text-muted-foreground">{item.customerName}</p>
        </div>
      ),
    },
    {
      key: 'mobile',
      header: 'Contact',
      render: (item: ServiceMaster) => (
        <a href={`tel:${item.mobile}`} className="text-info hover:underline">
          {item.mobile}
        </a>
      ),
    },
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
      header: 'Due',
      render: (item: ServiceMaster) => (
        <span className={item.status === 'overdue' ? 'font-medium text-destructive' : ''}>
          {item.expectedDate}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: ServiceMaster) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: '',
      render: (item: ServiceMaster) => (
        <Button
          size="sm"
          variant="default"
          className="gap-1"
          onClick={(e) => {
            e.stopPropagation();
            handleServiceCall(item);
          }}
        >
          <Phone className="h-3 w-3" />
          Call
        </Button>
      ),
    },
  ];

  const insuranceColumns = [
    {
      key: 'regNo',
      header: 'Vehicle',
      render: (item: InsuranceRenewal) => (
        <div>
          <p className="font-medium text-foreground">{item.regNo}</p>
          <p className="text-sm text-muted-foreground">{item.customerName}</p>
        </div>
      ),
    },
    {
      key: 'mobile',
      header: 'Contact',
      render: (item: InsuranceRenewal) => (
        <a href={`tel:${item.mobile}`} className="text-info hover:underline">
          {item.mobile}
        </a>
      ),
    },
    {
      key: 'policyExpiryDate',
      header: 'Expiry',
      render: (item: InsuranceRenewal) => {
        const isExpired = new Date(item.policyExpiryDate) < new Date();
        return (
          <span className={isExpired ? 'font-medium text-destructive' : ''}>
            {item.policyExpiryDate}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: InsuranceRenewal) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: '',
      render: (item: InsuranceRenewal) => (
        <Button
          size="sm"
          variant="default"
          className="gap-1"
          onClick={(e) => {
            e.stopPropagation();
            handleInsuranceCall(item);
          }}
        >
          <Phone className="h-3 w-3" />
          Call
        </Button>
      ),
    },
  ];

  const isLoading = serviceLoading || insuranceLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Call Queue</h1>
        <p className="text-muted-foreground">
          Your assigned calls for today
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 border-destructive/40 bg-destructive/10 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">{overdueServiceCalls.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-warning/40 bg-warning/10 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-warning" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Service Due</p>
                <p className="text-2xl font-bold text-warning">{todayServiceCalls.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-info/40 bg-info/10 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-info" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Insurance Due</p>
                <p className="text-2xl font-bold text-info">{pendingInsurance.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-success/40 bg-success/10 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold text-success">
                  {serviceCalls.filter(s => s.status === 'booked' || s.status === 'serviced').length +
                    insuranceCalls.filter(i => i.status === 'renewed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="service" className="space-y-4">
        <TabsList>
          <TabsTrigger value="service" className="gap-2">
            <Wrench className="h-4 w-4" />
            Service Calls ({serviceCalls.length})
          </TabsTrigger>
          <TabsTrigger value="insurance" className="gap-2">
            <Shield className="h-4 w-4" />
            Insurance Calls ({insuranceCalls.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="service">
          <DataTable
            data={serviceCalls}
            columns={serviceColumns}
            emptyMessage="No service calls assigned"
          />
        </TabsContent>

        <TabsContent value="insurance">
          <DataTable
            data={insuranceCalls}
            columns={insuranceColumns}
            emptyMessage="No insurance calls assigned"
          />
        </TabsContent>
      </Tabs>

      {/* Service Call Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Service Call</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Customer:</span>
                    <p className="font-medium">{selectedService.customerName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mobile:</span>
                    <p className="font-medium">{selectedService.mobile}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vehicle:</span>
                    <p className="font-medium">{selectedService.regNo}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Service:</span>
                    <p className="font-medium">{selectedService.serviceType}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Call Outcome</Label>
                <Select value={serviceStatus} onValueChange={setServiceStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="called">Called</SelectItem>
                    <SelectItem value="booked">Booked Appointment</SelectItem>
                    <SelectItem value="serviced">Serviced</SelectItem>
                    <SelectItem value="not_interested">Not Interested</SelectItem>
                    <SelectItem value="wrong_number">Wrong Number</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Next Follow-up</Label>
                <Input
                  type="date"
                  value={serviceFollowUp}
                  onChange={(e) => setServiceFollowUp(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Remarks</Label>
                <Textarea
                  placeholder="Add notes..."
                  rows={3}
                  value={serviceRemarks}
                  onChange={(e) => setServiceRemarks(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateService}
              disabled={updateServiceMutation.isPending}
            >
              {updateServiceMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Insurance Call Dialog */}
      <Dialog open={isInsuranceDialogOpen} onOpenChange={setIsInsuranceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Insurance Call</DialogTitle>
          </DialogHeader>
          {selectedInsurance && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Customer:</span>
                    <p className="font-medium">{selectedInsurance.customerName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mobile:</span>
                    <p className="font-medium">{selectedInsurance.mobile}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vehicle:</span>
                    <p className="font-medium">{selectedInsurance.regNo}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expiry:</span>
                    <p className="font-medium">{selectedInsurance.policyExpiryDate}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Renewal Status</Label>
                <Select value={insuranceStatus} onValueChange={setInsuranceStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="called">Called</SelectItem>
                    <SelectItem value="renewed">Renewed with Us</SelectItem>
                    <SelectItem value="shifted">Shifted to Other</SelectItem>
                    <SelectItem value="not_interested">Not Interested</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Next Follow-up</Label>
                <Input
                  type="date"
                  value={insuranceFollowUp}
                  onChange={(e) => setInsuranceFollowUp(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Remarks</Label>
                <Textarea
                  placeholder="Add notes..."
                  rows={3}
                  value={insuranceRemarks}
                  onChange={(e) => setInsuranceRemarks(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInsuranceDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateInsurance}
              disabled={updateInsuranceMutation.isPending}
            >
              {updateInsuranceMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyCallsPage;
