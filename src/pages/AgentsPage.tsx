import React, { useState } from 'react';
import { useAgents, useServiceCalls, useInsuranceRenewals, useAddUser, useUpdateUserStatus } from '@/hooks/useSupabase';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Search, UserPlus, Wrench, Shield } from 'lucide-react';
import { toast } from 'sonner';

const AgentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentEmail, setNewAgentEmail] = useState('');
  const [newAgentPassword, setNewAgentPassword] = useState('');
  const [newAgentActive, setNewAgentActive] = useState(true);

  const { data: agents = [], isLoading: agentsLoading } = useAgents();
  const { data: serviceCalls = [], isLoading: serviceLoading } = useServiceCalls();
  const { data: insuranceCalls = [], isLoading: insuranceLoading } = useInsuranceRenewals();

  const addUserMutation = useAddUser();
  const updateStatusMutation = useUpdateUserStatus();

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAgentStats = (agentId: string) => {
    const agentServiceCalls = serviceCalls.filter(s => s.agentId === agentId);
    const agentInsuranceCalls = insuranceCalls.filter(i => i.agentId === agentId);
    const completedService = agentServiceCalls.filter(s => s.status === 'booked' || s.status === 'serviced').length;
    const renewedInsurance = agentInsuranceCalls.filter(i => i.status === 'renewed').length;

    return {
      totalService: agentServiceCalls.length,
      completedService,
      totalInsurance: agentInsuranceCalls.length,
      renewedInsurance,
    };
  };

  const handleAddAgent = async () => {
    if (!newAgentName || !newAgentEmail || !newAgentPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addUserMutation.mutateAsync({
        name: newAgentName,
        email: newAgentEmail,
        password: newAgentPassword,
        role: 'agent',
        active: newAgentActive,
      });
      toast.success('Agent added successfully');
      setIsAddDialogOpen(false);
      setNewAgentName('');
      setNewAgentEmail('');
      setNewAgentPassword('');
      setNewAgentActive(true);
    } catch (error) {
      toast.error('Failed to add agent');
      console.error(error);
    }
  };

  const handleToggleStatus = async (agentId: string, currentStatus: boolean) => {
    try {
      await updateStatusMutation.mutateAsync({
        userId: agentId,
        active: !currentStatus,
      });
      toast.success(`Agent ${currentStatus ? 'deactivated' : 'activated'}`);
    } catch (error) {
      toast.error('Failed to update agent status');
      console.error(error);
    }
  };

  const totalCalls = serviceCalls.length + insuranceCalls.length;

  if (agentsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
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
          <h1 className="text-2xl font-bold text-foreground">Agents</h1>
          <p className="text-muted-foreground">
            Manage team members and their work allocation
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Add Agent
        </Button>
      </div>

      {/* Search */}
      <Card className="border-2 border-border bg-card shadow-sm">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border-2 border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{agents.length}</p>
        </div>
        <div className="rounded-lg border-2 border-success/40 bg-success/10 p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Active</p>
          <p className="mt-1 text-2xl font-bold text-success">
            {agents.filter(a => a.active).length}
          </p>
        </div>
        <div className="rounded-lg border-2 border-muted bg-muted/50 p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Inactive</p>
          <p className="mt-1 text-2xl font-bold text-muted-foreground">
            {agents.filter(a => !a.active).length}
          </p>
        </div>
        <div className="rounded-lg border-2 border-primary/40 bg-primary/10 p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Calls Assigned</p>
          <p className="mt-1 text-2xl font-bold text-primary">
            {totalCalls}
          </p>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map((agent) => {
          const stats = getAgentStats(agent.id);
          return (
            <Card key={agent.id} className="border-2 border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-semibold text-primary">
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{agent.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{agent.email}</p>
                    </div>
                  </div>
                  <Badge variant={agent.active ? 'default' : 'secondary'}>
                    {agent.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Wrench className="h-4 w-4" />
                        <span className="text-xs">Service Calls</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold">
                        {stats.completedService}/{stats.totalService}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        <span className="text-xs">Insurance</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold">
                        {stats.renewedInsurance}/{stats.totalInsurance}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={agent.active}
                        disabled={updateStatusMutation.isPending}
                        onCheckedChange={() => handleToggleStatus(agent.id, agent.active)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {agent.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAgents.length === 0 && !agentsLoading && (
        <div className="text-center py-12 text-muted-foreground">
          No agents found
        </div>
      )}

      {/* Add Agent Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="Enter agent name"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="agent@dealership.com"
                value={newAgentEmail}
                onChange={(e) => setNewAgentEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Create password"
                value={newAgentPassword}
                onChange={(e) => setNewAgentPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newAgentActive}
                onCheckedChange={setNewAgentActive}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddAgent}
              disabled={addUserMutation.isPending}
            >
              {addUserMutation.isPending ? 'Adding...' : 'Add Agent'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentsPage;
