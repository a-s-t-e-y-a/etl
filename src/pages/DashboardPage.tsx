import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { API_ENDPOINTS } from '@/config/api';

const fetchDistinctData = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.data;
};

const formatMonthDisplay = (monthStr: string) => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const fetchDetailedSalesData = async (
  platform?: string,
  month?: string,
  region?: string,
  page: number = 1,
  limit: number = 10
) => {
  const params = new URLSearchParams();
  if (platform) params.append('platform', platform);
  if (month) params.append('sale_month', month);
  if (region) params.append('region', region);
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  const url = `${API_ENDPOINTS.DETAILED}?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data;
};

const fetchAggregatedData = async (platform?: string, month?: string, region?: string) => {
  const params = new URLSearchParams();
  if (platform) params.append('platform', platform);
  if (month) params.append('sale_month', month);
  if (region) params.append('region', region);
  
  const url = `${API_ENDPOINTS.AGGREGATED}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.data;
};

export default function DashboardPage() {
  const { logout } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  const { data: platforms = [], isLoading: platformsLoading } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => fetchDistinctData(API_ENDPOINTS.PLATFORMS),
  });

  const { data: months = [], isLoading: monthsLoading } = useQuery({
    queryKey: ['months'],
    queryFn: () => fetchDistinctData(API_ENDPOINTS.MONTHS),
  });

  const { data: regions = [], isLoading: regionsLoading } = useQuery({
    queryKey: ['regions'],
    queryFn: () => fetchDistinctData(API_ENDPOINTS.REGIONS),
  });

  const { data: detailedResponse, isLoading: detailedLoading } = useQuery({
    queryKey: ['detailed', selectedPlatform, selectedMonth, selectedRegion, currentPage, pageSize],
    queryFn: () => fetchDetailedSalesData(selectedPlatform, selectedMonth, selectedRegion, currentPage, pageSize),
  });

  const detailedData = detailedResponse?.data || [];
  const pagination = detailedResponse?.pagination || { page: 1, totalPages: 1, total: 0 };

  const { data: aggregatedData = [], isLoading: aggregatedLoading } = useQuery({
    queryKey: ['aggregated', selectedPlatform, selectedMonth, selectedRegion],
    queryFn: () => fetchAggregatedData(selectedPlatform, selectedMonth, selectedRegion),
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClearFilters = () => {
    setSelectedPlatform('');
    setSelectedMonth('');
    setSelectedRegion('');
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      if (selectedPlatform) params.append('platform', selectedPlatform);
      if (selectedMonth) params.append('sale_month', selectedMonth);
      if (selectedRegion) params.append('region', selectedRegion);

      const response = await fetch(`${API_ENDPOINTS.EXPORT}?${params.toString()}`);
      if (!response.ok) throw new Error('Export failed');
      
      const result = await response.json();
      const exportData = result.data;

      const worksheet = XLSX.utils.json_to_sheet(exportData.map((item: any) => ({
        'Platform': item.platform,
        'Month': item.sale_month,
        'Region': item.region,
        'Master Code': item.master_code,
        'SKU Name': item.master_name,
        'Total Units': Number(item.total_units),
        'Total GMV (₹)': Number(item.total_gmv)
      })));

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Detailed Data');
      
      const filename = `Sales_Data_${selectedPlatform || 'All'}_${selectedMonth || 'All'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const loading = platformsLoading || monthsLoading || regionsLoading;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">ETL Dashboard</h1>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Select filters to view aggregated sales data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3 mb-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger id="platform">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <div className="p-2 text-sm text-muted-foreground">Loading...</div>
                    ) : (
                      platforms.map((platform: string) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger id="month">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <div className="p-2 text-sm text-muted-foreground">Loading...</div>
                    ) : (
                      months.map((month: string) => (
                        <SelectItem key={month} value={month}>
                          {formatMonthDisplay(month)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {loading ? (
                      <div className="p-2 text-sm text-muted-foreground">Loading...</div>
                    ) : (
                      regions.map((region: string) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {(selectedPlatform || selectedMonth || selectedRegion) && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {(aggregatedLoading || aggregatedData.length > 0) && (
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle>Summary Statistics</CardTitle>
              <CardDescription>
                Aggregated totals for selected filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aggregatedLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground animate-pulse">Calculating statistics...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-muted/50 rounded-xl border">
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total GMV</p>
                    <p className="text-3xl font-extrabold text-primary">
                      ₹{aggregatedData.reduce((sum: number, d: any) => sum + Number(d.total_gmv || 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="text-center space-y-2 border-y md:border-y-0 md:border-x py-4 md:py-0">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Quantity</p>
                    <p className="text-3xl font-extrabold text-primary">
                      {aggregatedData.reduce((sum: number, d: any) => sum + Number(d.total_quantity || 0), 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Records</p>
                    <p className="text-3xl font-extrabold text-primary">
                      {aggregatedData.reduce((sum: number, d: any) => sum + Number(d.record_count || 0), 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Detailed Sales Data</CardTitle>
              <CardDescription>
                Detailed sales records grouped by SKU with pagination
              </CardDescription>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleExport} 
              disabled={isExporting || detailedData.length === 0}
              className="ml-auto"
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-2 h-4 w-4" />
              )}
              {isExporting ? "Exporting..." : "Export to Excel"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-muted/50 rounded-md border border-muted">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Note:</span> By default, the table displays data for <span className="font-semibold">Blinkit</span> platform and <span className="font-semibold">Delhi NCR region only</span>. Use filters above to view data for other platforms, months, or regions.
              </p>
            </div>
            {detailedLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium">Fetching sales data...</p>
              </div>
            ) : detailedData.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Platform</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead>City/Region</TableHead>
                        <TableHead>Master Code</TableHead>
                        <TableHead>SKU Name</TableHead>
                        <TableHead className="text-right">Total Units</TableHead>
                        <TableHead className="text-right">Total GMV</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailedData.map((data: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{data.platform}</TableCell>
                          <TableCell>{formatMonthDisplay(data.sale_month)}</TableCell>
                          <TableCell>{data.region}</TableCell>
                          <TableCell>{data.master_code}</TableCell>
                          <TableCell className="max-w-xs truncate">{data.master_name}</TableCell>
                          <TableCell className="text-right">
                            {Number(data.total_units || 0).toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{Number(data.total_gmv || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.total)} of {pagination.total} results
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => handlePageChange(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => currentPage < pagination.totalPages && handlePageChange(currentPage + 1)}
                          className={currentPage >= pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No data available. Showing default data for Blinkit - January 2025.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
