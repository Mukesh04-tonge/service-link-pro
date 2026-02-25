import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  Download,
  TrendingUp,
  Users,
  Wrench,
  Shield,
  Calendar,
} from 'lucide-react';
import { useReportsStats } from '@/hooks/useSupabase';
import { Skeleton } from '@/components/ui/skeleton';

const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('30days');
  const { data: stats, isLoading } = useReportsStats();

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">
            Analytics and performance insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-border bg-card shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Calls Made</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalCalls.toLocaleString()}</p>
                <p className="text-sm text-success font-medium">↑ Active Period</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-border bg-card shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Service Conversions</p>
                <p className="text-3xl font-bold text-foreground">{stats.serviceConversions.toLocaleString()}</p>
                <p className="text-sm text-success font-medium">{stats.serviceConversionRate}% conversion rate</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/15">
                <Wrench className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-border bg-card shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Insurance Renewed</p>
                <p className="text-3xl font-bold text-foreground">{stats.insuranceRenewed.toLocaleString()}</p>
                <p className="text-sm text-success font-medium">Global Stat</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/15">
                <Shield className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-border bg-card shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Agents</p>
                <p className="text-3xl font-bold text-foreground">{stats.activeAgents}</p>
                <p className="text-sm text-muted-foreground">Based on role 'agent'</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/15">
                <Users className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Service Conversion Chart */}
        <Card className="border-2 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Service Call Status (Current)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.conversionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 85%)" />
                  <XAxis dataKey="name" stroke="hsl(220, 9%, 46%)" />
                  <YAxis stroke="hsl(220, 9%, 46%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '2px solid hsl(220, 13%, 80%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="booked" fill="hsl(142, 76%, 36%)" name="Booked" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" fill="hsl(38, 92%, 50%)" name="Pending" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="notInterested" fill="hsl(0, 72%, 51%)" name="Not Interested" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Insurance Status Pie Chart */}
        <Card className="border-2 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Insurance Renewal Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.insuranceStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {stats.insuranceStatusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '2px solid hsl(220, 13%, 80%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trend */}
        <Card className="border-2 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Upcoming Schedule Trend (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 85%)" />
                  <XAxis dataKey="month" stroke="hsl(220, 9%, 46%)" />
                  <YAxis stroke="hsl(220, 9%, 46%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '2px solid hsl(220, 13%, 80%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="service"
                    stroke="hsl(38, 92%, 50%)"
                    strokeWidth={2}
                    name="Service Schedules"
                    dot={{ fill: 'hsl(38, 92%, 50%)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="insurance"
                    stroke="hsl(199, 89%, 48%)"
                    strokeWidth={2}
                    name="Insurance Renewals"
                    dot={{ fill: 'hsl(199, 89%, 48%)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Agent Performance */}
        <Card className="border-2 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.agentPerformance.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No agents found</p>
              ) : (
                stats.agentPerformance.map((agent, index) => (
                  <div key={agent.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
                          {index + 1}
                        </div>
                        <span className="font-medium text-foreground">{agent.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{agent.conversions} conversions</p>
                        <p className="text-sm text-muted-foreground">{agent.calls} calls • {agent.rate}% rate</p>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${Math.min((agent.conversions / 50) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
