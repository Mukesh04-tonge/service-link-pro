import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  Car,
  Wrench,
  Calendar,
  Shield,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabase';

interface UploadCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onUpload: (file: File) => void;
  onDownloadTemplate: () => void;
  isUploading?: boolean;
  progress?: number;
  lastUpload?: string;
}

const UploadCard: React.FC<UploadCardProps> = ({
  title,
  description,
  icon: Icon,
  onUpload,
  onDownloadTemplate,
  isUploading,
  progress = 0,
  lastUpload,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <Card className="border-border bg-card transition-all hover:border-primary/30">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          {lastUpload && (
            <span className="text-xs text-muted-foreground">
              Last: {lastUpload}
            </span>
          )}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isUploading ? (
          <div className="space-y-3">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              Uploading... {progress}%
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => inputRef.current?.click()}
            >
              Select File
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={onDownloadTemplate}
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Supports CSV, XLSX, XLS
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const UploadPage: React.FC = () => {
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [recentUploads, setRecentUploads] = useState([
    { name: 'vehicle_data_dec24.xlsx', type: 'Vehicle Data', date: 'Dec 1, 2024', status: 'success', rows: 1245 },
    { name: 'service_records_q4.csv', type: 'Service Records', date: 'Dec 3, 2024', status: 'success', rows: 3420 },
    { name: 'insurance_batch_12.xlsx', type: 'Insurance Data', date: 'Dec 2, 2024', status: 'success', rows: 890 },
    { name: 'service_schedule_v2.csv', type: 'Service Schedule', date: 'Nov 15, 2024', status: 'success', rows: 48 },
  ]);

  const parseDate = (dateStr: string): string | null => {
    if (!dateStr) return null;
    const cleanStr = dateStr.toString().trim();

    // Try to parse DD-MM-YYYY, DD/MM/YYYY, or similar
    const dmyMatch = cleanStr.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (dmyMatch) {
      const [_, day, month, year] = dmyMatch;
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      console.log(`Parsed date '${dateStr}' to '${isoDate}'`);
      return isoDate;
    }

    // Try standard Date parsing
    const date = new Date(cleanStr);
    if (!isNaN(date.getTime())) {
      const iso = date.toISOString().split('T')[0];
      console.log(`Parsed standard date '${dateStr}' to '${iso}'`);
      return iso;
    }

    console.warn(`Failed to parse date: '${dateStr}'`);
    return null;
  };

  const processServiceScheduleUpload = async (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data;
          console.log('Parsed CSV rows:', rows);

          if (rows.length === 0) {
            toast.error('File is empty');
            setUploadingType(null);
            return;
          }

          // Validate headers (basic check)
          const requiredHeaders = ['vc_no', 'product_line', 'free_service', 'frequency_days', 'km_frequency', 'max_services'];
          const headers = results.meta.fields || [];
          const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

          if (missingHeaders.length > 0) {
            toast.error(`Missing columns: ${missingHeaders.join(', ')}`);
            setUploadingType(null);
            return;
          }

          // Transform and insert
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const formattedRows = rows.map((row: any) => ({
            vc_no: row.vc_no,
            product_line: row.product_line,
            free_service: parseInt(row.free_service) || 0,
            frequency_days: parseInt(row.frequency_days) || 0,
            km_frequency: parseInt(row.km_frequency) || 0,
            max_services: parseInt(row.max_services) || 0,
            variation_days: parseInt(row.variation_days) || 0,
            variation_kms: parseInt(row.variation_kms) || 0,
          }));

          // Since there is no unique constraint on product_line in the database,
          // we cannot use upsert with onConflict. 
          // Instead, we will delete existing entries for these product lines and insert new ones.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const productLines = formattedRows.map((r: any) => r.product_line).filter(Boolean);

          if (productLines.length > 0) {
            const { error: deleteError } = await supabase
              .from('service_schedules')
              .delete()
              .in('product_line', productLines);

            if (deleteError) {
              console.error('Delete error:', deleteError);
              throw new Error('Failed to clear existing records: ' + deleteError.message);
            }
          }

          const { error } = await supabase
            .from('service_schedules')
            .insert(formattedRows);

          if (error) throw error;

          toast.success('Service Schedule uploaded successfully');

          setRecentUploads(prev => [{
            name: file.name,
            type: 'Service Schedule',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'success',
            rows: rows.length
          }, ...prev]);

        } catch (error: any) {
          console.error('Upload error:', error);
          toast.error('Upload failed: ' + error.message);
        } finally {
          setUploadingType(null);
          setProgress(0);
        }
      },
      error: (error) => {
        console.error('CSV Parse error:', error);
        toast.error('Failed to parse CSV');
        setUploadingType(null);
      }
    });
  };

  const processVehicleDataUpload = async (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data;
          console.log('Parsed Vehicle CSV rows:', rows);

          if (rows.length === 0) {
            toast.error('File is empty');
            setUploadingType(null);
            return;
          }

          // Validate headers (basic check)
          const requiredHeaders = ['bin_no', 'product_line', 'vc_no', 'sale_date', 'reg_no', 'customer_name', 'mobile1'];
          const headers = results.meta.fields || [];
          const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

          if (missingHeaders.length > 0) {
            toast.error(`Missing columns: ${missingHeaders.join(', ')}`);
            setUploadingType(null);
            return;
          }

          // Transform and insert
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const formattedRows = rows.map((row: any) => ({
            bin_no: row.bin_no,
            product_line: row.product_line,
            vc_no: row.vc_no,
            sale_date: parseDate(row.sale_date),
            reg_no: row.reg_no || `TMP-${row.bin_no}`, // Fallback for missing reg_no to satisfy UNIQUE constraint
            customer_name: row.customer_name,
            mobile1: row.mobile1,
            mobile2: row.mobile2 || null,
            mobile3: row.mobile3 || null,
          }));

          console.log('Inserting vehicles...');
          // vehicles table has UNIQUE(bin_no), so we can use upsert
          const { error } = await supabase
            .from('vehicles')
            .upsert(formattedRows, { onConflict: 'bin_no' });

          if (error) throw error;

          toast.success('Vehicle Data uploaded successfully');

          setRecentUploads(prev => [{
            name: file.name,
            type: 'Vehicle Data',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'success',
            rows: rows.length
          }, ...prev]);

        } catch (error: any) {
          console.error('Upload error:', error);
          toast.error('Upload failed: ' + error.message);
        } finally {
          setUploadingType(null);
          setProgress(0);
        }
      },
      error: (error) => {
        console.error('CSV Parse error:', error);
        toast.error('Failed to parse CSV');
        setUploadingType(null);
      }
    });
  };

  const simulateUpload = (type: string, file: File) => {
    setUploadingType(type);
    setProgress(0);

    // Use real upload for Service Schedule
    if (type === 'Service Schedule') {
      // Simulate progress for a bit then parse
      let p = 0;
      const interval = setInterval(() => {
        p += 10;
        setProgress(p);
        if (p >= 50) {
          clearInterval(interval);
          processServiceScheduleUpload(file);
        }
      }, 100);
      return;
    }

    if (type === 'Vehicle Data') {
      // Simulate progress for a bit then parse
      let p = 0;
      const interval = setInterval(() => {
        p += 10;
        setProgress(p);
        if (p >= 50) {
          clearInterval(interval);
          processVehicleDataUpload(file);
        }
      }, 100);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadingType(null);
          toast.success(`${type} uploaded successfully`, {
            description: `${file.name} - ${Math.round(file.size / 1024)}KB`,
          });
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDownloadTemplate = (type: string) => {
    let headers = '';
    let fileName = '';

    switch (type) {
      case 'Vehicle Data':
        headers = 'bin_no,product_line,vc_no,sale_date,reg_no,customer_name,mobile1,mobile2,mobile3';
        fileName = 'vehicle_data_template.csv';
        break;
      case 'Service Records':
        headers = 'jc_no,jc_closed_date,service_type,km_runs,bin_no';
        fileName = 'service_records_template.csv';
        break;
      case 'Service Schedule':
        headers = 'vc_no,product_line,free_service,frequency_days,km_frequency,max_services,variation_days,variation_kms';
        fileName = 'service_schedule_template.csv';
        break;
      case 'Insurance Data':
        headers = 'bin_no,reg_no,policy_date,policy_type';
        fileName = 'insurance_data_template.csv';
        break;
      default:
        return;
    }

    const blob = new Blob([headers], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success(`${type} template downloaded`);
  };

  const handleRebuildMaster = async (type: 'service' | 'insurance') => {
    if (type === 'service') {
      try {
        const { error } = await supabase.rpc('rebuild_service_master');

        if (error) throw error;

        toast.success('Service master rebuilt successfully');
      } catch (error: any) {
        console.error('Rebuild error:', error);
        toast.error('Failed to rebuild master: ' + error.message);
      }
    } else {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 3000)),
        {
          loading: `Rebuilding ${type} master...`,
          success: 'Insurance master rebuilt successfully',
          error: 'Failed to rebuild master',
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Data Upload</h1>
        <p className="text-muted-foreground">
          Upload and manage data files for the system
        </p>
      </div>

      {/* Upload Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <UploadCard
          title="Vehicle Data"
          description="Upload vehicle master data with customer details"
          icon={Car}
          onUpload={(file) => simulateUpload('Vehicle Data', file)}
          onDownloadTemplate={() => handleDownloadTemplate('Vehicle Data')}
          isUploading={uploadingType === 'Vehicle Data'}
          progress={progress}
          lastUpload="Dec 1, 2024"
        />
        <UploadCard
          title="Service Records"
          description="Upload job card and service history data"
          icon={Wrench}
          onUpload={(file) => simulateUpload('Service Records', file)}
          onDownloadTemplate={() => handleDownloadTemplate('Service Records')}
          isUploading={uploadingType === 'Service Records'}
          progress={progress}
          lastUpload="Dec 3, 2024"
        />
        <UploadCard
          title="Service Schedule"
          description="Upload service schedule master configuration"
          icon={Calendar}
          onUpload={(file) => simulateUpload('Service Schedule', file)}
          onDownloadTemplate={() => handleDownloadTemplate('Service Schedule')}
          isUploading={uploadingType === 'Service Schedule'}
          progress={progress}
          lastUpload="Nov 15, 2024"
        />
        <UploadCard
          title="Insurance Data"
          description="Upload insurance policy information"
          icon={Shield}
          onUpload={(file) => simulateUpload('Insurance Data', file)}
          onDownloadTemplate={() => handleDownloadTemplate('Insurance Data')}
          isUploading={uploadingType === 'Insurance Data'}
          progress={progress}
          lastUpload="Dec 2, 2024"
        />
      </div>

      {/* Master Rebuild Section */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Rebuild Master Data
          </CardTitle>
          <CardDescription>
            Recalculate service schedules and insurance renewals based on uploaded data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleRebuildMaster('service')}
            >
              <Wrench className="h-4 w-4" />
              Rebuild Service Master
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleRebuildMaster('insurance')}
            >
              <Shield className="h-4 w-4" />
              Rebuild Insurance Master
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload History */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentUploads.map((upload, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{upload.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {upload.type} • {upload.rows.toLocaleString()} rows
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{upload.date}</span>
                  {upload.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPage;
