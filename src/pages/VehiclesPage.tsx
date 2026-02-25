import React, { useState } from 'react';
import { useVehicles } from '@/hooks/useSupabase';
import { VehicleData } from '@/types';
import { DataTable } from '@/components/common/DataTable';
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
import { Search, Upload, Car, Plus } from 'lucide-react';

const VehiclesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState<string>('all');

  const { data: vehicles = [], isLoading } = useVehicles();

  // Get unique product lines
  const productLines = [...new Set(vehicles.map(v => v.productLine))];

  const filteredData = vehicles.filter((item) => {
    const matchesSearch =
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.binNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mobile1.includes(searchTerm);

    const matchesProduct = productFilter === 'all' || item.productLine === productFilter;

    return matchesSearch && matchesProduct;
  });

  // Add id field for DataTable
  const dataWithId = filteredData.map(v => ({ ...v, id: v.binNo }));

  const columns = [
    {
      key: 'binNo',
      header: 'Bin No',
      render: (item: VehicleData & { id: string }) => (
        <span className="font-mono text-sm">{item.binNo}</span>
      ),
    },
    {
      key: 'regNo',
      header: 'Reg No',
      render: (item: VehicleData & { id: string }) => (
        <span className="font-medium text-foreground">{item.regNo}</span>
      ),
    },
    { key: 'customerName', header: 'Customer' },
    {
      key: 'mobile1',
      header: 'Mobile',
      render: (item: VehicleData & { id: string }) => (
        <a href={`tel:${item.mobile1}`} className="text-info hover:underline">
          {item.mobile1}
        </a>
      ),
    },
    { key: 'productLine', header: 'Product Line' },
    { key: 'vcNo', header: 'VC No' },
    { key: 'saleDate', header: 'Sale Date' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vehicles</h1>
          <p className="text-muted-foreground">
            Manage all registered vehicles in the system
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-2 border-border bg-card shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, reg no, bin no, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Product Line" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {productLines.map((line) => (
                  <SelectItem key={line} value={line}>
                    {line}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border-2 border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Total Vehicles</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">{dataWithId.length}</p>
        </div>
        {productLines.slice(0, 3).map((line) => (
          <div key={line} className="rounded-lg border-2 border-border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">{line}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {vehicles.filter(v => v.productLine === line).length}
            </p>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        data={dataWithId}
        columns={columns}
        emptyMessage="No vehicles found"
      />
    </div>
  );
};

export default VehiclesPage;
