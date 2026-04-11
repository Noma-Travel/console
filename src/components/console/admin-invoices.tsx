import { useState, useEffect, useContext, useMemo } from 'react';
import { GlobalContext } from "@/components/console/global-context";
import { NavLink } from "react-router-dom";
import { ArrowBigLeft, RefreshCcw, DollarSign, FileText, AlertTriangle, CheckCircle2, Loader2, ArrowUpDown } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";


interface InvoiceItem {
  description: string;
  amount: number;
}

interface Invoice {
  _id?: string;
  invoiceId: string;
  userId: string;
  companyId: string;
  tripId: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  status: string;
  invoiceType: string;
  items: InvoiceItem[];
}

interface EnrichedInvoice extends Invoice {
  portfolioName: string;
  portfolioId: string;
  orgName: string;
  orgId: string;
  productType: string;
  supplier: string;
}

const SUPPLIER_MAP: Record<string, string> = {
  hotel: 'CVC',
  flight: 'Rextur',
  transfer: 'Conectaas',
};

function extractProductType(invoice: Invoice): string {
  const desc = invoice.items?.[0]?.description?.toLowerCase() ?? '';
  if (desc.startsWith('hotel')) return 'hotel';
  if (desc.startsWith('flight')) return 'flight';
  if (desc.startsWith('transfer')) return 'transfer';
  return 'other';
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(iso: string): string {
  if (!iso) return '-';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase() ?? '';
  if (normalized === 'paid') {
    return <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">Paid</Badge>;
  }
  if (normalized === 'overdue') {
    return <Badge className="bg-red-600 text-white hover:bg-red-700">Overdue</Badge>;
  }
  return <Badge className="bg-amber-500 text-white hover:bg-amber-600">Unpaid</Badge>;
}

function ProductTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    hotel: 'Hotel',
    flight: 'Flight',
    transfer: 'Transfer',
    other: 'Other',
  };
  const colors: Record<string, string> = {
    hotel: 'bg-blue-600 text-white hover:bg-blue-700',
    flight: 'bg-violet-600 text-white hover:bg-violet-700',
    transfer: 'bg-orange-600 text-white hover:bg-orange-700',
    other: 'bg-gray-500 text-white hover:bg-gray-600',
  };
  return <Badge className={colors[type] ?? colors.other}>{labels[type] ?? type}</Badge>;
}


export default function AdminInvoices() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('No GlobalProvider');
  }
  const { tree } = context;

  const [invoices, setInvoices] = useState<EnrichedInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'invoiceDate', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPortfolio, setFilterPortfolio] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');

  const fetchAllInvoices = async () => {
    if (!tree?.portfolios) return;

    setLoading(true);
    setError(null);
    const allInvoices: EnrichedInvoice[] = [];

    try {
      const portfolios = tree.portfolios;
      const fetchPromises: Promise<void>[] = [];

      for (const [portfolioId, portfolio] of Object.entries(portfolios)) {
        if (!portfolio.orgs) continue;

        for (const [orgId, org] of Object.entries(portfolio.orgs)) {
          const promise = (async () => {
            try {
              const url = `${import.meta.env.VITE_API_URL}/_schd/${portfolioId}/${orgId}/call/noma/get_invoices`;
              const response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${sessionStorage.accessToken}`,
                },
                body: JSON.stringify({ portfolio: portfolioId, org: orgId }),
              });

              if (!response.ok) return;

              const data = await response.json();
              const innerOutput = data?.output?.output ?? data?.output ?? {};
              const items: Invoice[] = innerOutput.items ?? [];

              for (const inv of items) {
                const productType = extractProductType(inv);
                const numericAmount = typeof inv.amount === 'string' ? parseFloat(inv.amount) : (inv.amount ?? 0);
                allInvoices.push({
                  ...inv,
                  amount: isNaN(numericAmount) ? 0 : numericAmount,
                  portfolioName: portfolio.name,
                  portfolioId,
                  orgName: org.name,
                  orgId,
                  productType,
                  supplier: SUPPLIER_MAP[productType] ?? 'N/A',
                });
              }
            } catch (e) {
              console.error(`Failed to fetch invoices for ${portfolioId}/${orgId}:`, e);
            }
          })();

          fetchPromises.push(promise);
        }
      }

      await Promise.all(fetchPromises);
      setInvoices(allInvoices);
    } catch (e) {
      setError('Failed to load invoices. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllInvoices();
  }, [tree]);

  const filteredData = useMemo(() => {
    return invoices.filter((inv) => {
      if (filterType !== 'all' && inv.productType !== filterType) return false;
      if (filterStatus !== 'all' && inv.status?.toLowerCase() !== filterStatus) return false;
      if (filterPortfolio !== 'all' && inv.portfolioId !== filterPortfolio) return false;
      if (filterSupplier !== 'all' && inv.supplier !== filterSupplier) return false;
      return true;
    });
  }, [invoices, filterType, filterStatus, filterPortfolio, filterSupplier]);

  const summaryStats = useMemo(() => {
    const total = filteredData.reduce((sum, inv) => sum + (inv.amount ?? 0), 0);
    const count = filteredData.length;
    const paid = filteredData.filter((i) => i.status?.toLowerCase() === 'paid');
    const unpaid = filteredData.filter((i) => i.status?.toLowerCase() === 'unpaid');
    const overdue = filteredData.filter((i) => i.status?.toLowerCase() === 'overdue');
    return {
      total,
      count,
      paidCount: paid.length,
      paidTotal: paid.reduce((s, i) => s + (i.amount ?? 0), 0),
      unpaidCount: unpaid.length,
      unpaidTotal: unpaid.reduce((s, i) => s + (i.amount ?? 0), 0),
      overdueCount: overdue.length,
      overdueTotal: overdue.reduce((s, i) => s + (i.amount ?? 0), 0),
    };
  }, [filteredData]);

  const columns: ColumnDef<EnrichedInvoice>[] = useMemo(
    () => [
      {
        accessorKey: 'invoiceId',
        header: 'Invoice',
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.getValue('invoiceId')}</span>
        ),
      },
      {
        accessorKey: 'invoiceDate',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Date
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => formatDate(row.getValue('invoiceDate')),
      },
      {
        accessorKey: 'portfolioName',
        header: 'Client',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.portfolioName}</span>
        ),
      },
      {
        accessorKey: 'orgName',
        header: 'Organization',
      },
      {
        accessorKey: 'productType',
        header: 'Type',
        cell: ({ row }) => <ProductTypeBadge type={row.getValue('productType')} />,
      },
      {
        accessorKey: 'supplier',
        header: 'Supplier',
        cell: ({ row }) => (
          <span className="font-medium">{row.getValue('supplier')}</span>
        ),
      },
      {
        id: 'description',
        header: 'Description',
        cell: ({ row }) => {
          const desc = row.original.items?.[0]?.description ?? '-';
          return <span className="text-muted-foreground text-xs max-w-[200px] truncate block">{desc}</span>;
        },
      },
      {
        accessorKey: 'amount',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Amount
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold">{formatCurrency(row.getValue('amount'))}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
      },
      {
        accessorKey: 'tripId',
        header: 'Trip',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {(row.getValue('tripId') as string)?.substring(0, 8)}...
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 20 },
    },
  });

  const portfolioOptions = useMemo(() => {
    if (!tree?.portfolios) return [];
    return Object.entries(tree.portfolios).map(([id, p]) => ({
      id,
      name: p.name,
    }));
  }, [tree]);

  const uniqueSuppliers = useMemo(() => {
    const set = new Set(invoices.map((i) => i.supplier));
    return Array.from(set).filter(Boolean).sort();
  }, [invoices]);

  return (
    <div className="flex w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-6 md:p-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex items-center gap-4 mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <NavLink to="/home">
                      <ArrowBigLeft className="h-5 w-5" />
                    </NavLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div>
              <h1 className="text-2xl font-semibold">Sales Control</h1>
              <p className="text-sm text-muted-foreground">
                Track all purchases across portfolios
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={fetchAllInvoices}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summaryStats.total)}</div>
                <p className="text-xs text-muted-foreground">
                  {summaryStats.count} invoice{summaryStats.count !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(summaryStats.paidTotal)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summaryStats.paidCount} invoice{summaryStats.paidCount !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unpaid</CardTitle>
                <FileText className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-500">
                  {formatCurrency(summaryStats.unpaidTotal)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summaryStats.unpaidCount} invoice{summaryStats.unpaidCount !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(summaryStats.overdueTotal)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summaryStats.overdueCount} invoice{summaryStats.overdueCount !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Filters</CardTitle>
              <CardDescription>Filter invoices by type, status, client, or supplier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                <Input
                  placeholder="Search invoices..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="h-9"
                />

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="flight">Flight</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPortfolio} onValueChange={setFilterPortfolio}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {portfolioOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterSupplier} onValueChange={setFilterSupplier}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    {uniqueSuppliers.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-sm text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Invoices</CardTitle>
              <CardDescription>
                Showing {table.getRowModel().rows.length} of {filteredData.length} invoice{filteredData.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-3 text-muted-foreground">Loading invoices...</span>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">No invoices found</p>
                  <p className="text-xs mt-1">Try adjusting your filters or refresh the data</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <TableHead key={header.id} className="whitespace-nowrap">
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(header.column.columnDef.header, header.getContext())}
                              </TableHead>
                            ))}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {table.getRowModel().rows.map((row) => (
                          <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} className="whitespace-nowrap">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <div className="text-xs text-muted-foreground">
                      Page {table.getState().pagination.pageIndex + 1} of{' '}
                      {table.getPageCount()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
