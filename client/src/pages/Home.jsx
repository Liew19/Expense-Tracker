import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import SummaryCard from "@/components/SummaryCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import api from "@/lib/api";
import { useI18n } from "@/lib/I18nProvider";

const ITEMS_PER_PAGE = 10;

const fetchExpenses = async ({ queryKey }) => {
  const [, page, type, month, date] = queryKey;
  const params = { page, limit: ITEMS_PER_PAGE };
  if (type !== "all") params.type = type;
  if (month !== "all") params.month = month;
  if (date) params.date = format(date, "yyyy-MM-dd");
  const res = await api.get("/expenses", { params });
  return res.data;
};

const deleteExpense = async (id) => {
  await api.delete(`/expenses/${id}`);
};

const Home = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [filterType, setFilterType] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterDate, setFilterDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterMonth, filterDate]);

  const {
    data: resp,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["expenses", currentPage, filterType, filterMonth, filterDate],
    queryFn: fetchExpenses,
  });

  const expenses = resp?.data ?? [];
  const totalPages = resp?.totalPages ?? 1;
  const totalIncome = resp?.totalIncome ?? 0;
  const totalExpense = resp?.totalExpense ?? 0;
  const balance = totalIncome - totalExpense;
  const datesWithRecords = (resp?.datesWithRecords ?? []).map((s) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  });
  const months = resp?.months ?? [];

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success(t("common.deleteSuccess"));
    },
    onError: () => {
      toast.error(t("common.deleteFailed"));
    },
  });

   const handleDelete = (id) => {
     setDeleteId(id);
   };

  const handleDateSelect = (date) => {
    // Toggle: clicking the same date deselects it
    if (date && filterDate && date.getTime() === filterDate.getTime()) {
      setFilterDate(null);
    } else {
      setFilterDate(date);
    }
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-red-500">
          {t("home.failedLoad")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <SummaryCard title={t("home.totalIncome")} amount={totalIncome} type="income" />
          <SummaryCard
            title={t("home.totalExpenses")}
            amount={totalExpense}
            type="expense"
          />
          <SummaryCard title={t("home.balance")} amount={balance} type="balance" />
        </div>

        {/* Filters & Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {/* Date filter - popover calendar */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[160px] justify-start text-left font-normal",
                    !filterDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filterDate
                    ? format(filterDate, "yyyy-MM-dd")
                    : t("home.selectDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filterDate}
                  onSelect={handleDateSelect}
                  modifiers={{ hasRecords: datesWithRecords }}
                  modifiersStyles={{
                    hasRecords: { fontWeight: 600 },
                  }}
                  initialFocus
                />
                {filterDate && (
                  <div className="flex items-center justify-center gap-2 border-t p-2">
                    <span className="text-xs text-muted-foreground">
                      {t("home.filteringBy")}: {format(filterDate, "MMM d, yyyy")}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-2 py-0.5 text-xs"
                      onClick={() => setFilterDate(null)}
                    >
                      {t("home.clear")}
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t("home.filterType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("home.all")}</SelectItem>
                <SelectItem value="income">{t("editExpense.income")}</SelectItem>
                <SelectItem value="expense">{t("editExpense.expense")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t("home.filterMonth")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("home.allMonths")}</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => navigate("/add")}>{t("home.addNew")}</Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-6">
            {/* Summary Cards Skeletons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
            {/* Filters Skeleton */}
            <div className="flex gap-2">
              <Skeleton className="h-10 w-[160px] rounded-md" />
              <Skeleton className="h-10 w-[140px] rounded-md" />
              <Skeleton className="h-10 w-[140px] rounded-md" />
            </div>
            {/* Table Rows Skeleton */}
            <div className="rounded-lg border overflow-hidden">
              <div className="bg-muted/50 p-4">
                <Skeleton className="h-4 w-full" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-t">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-[10%]" />
                  <Skeleton className="h-4 w-[10%]" />
                  <Skeleton className="h-4 w-[12%]" />
                  <Skeleton className="h-4 w-[12%]" />
                  <Skeleton className="h-4 w-[15%] ml-auto" />
                </div>
              ))}
            </div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">{t("home.noRecords")}</div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[25%]">{t("home.title")}</TableHead>
                    <TableHead className="w-[15%]">{t("home.amount")}</TableHead>
                    <TableHead className="w-[12%]">{t("home.type")}</TableHead>
                    <TableHead className="w-[15%]">{t("home.category")}</TableHead>
                    <TableHead className="w-[15%]">{t("home.date")}</TableHead>
                    <TableHead className="w-[18%] text-right">{t("home.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id} className="group">
                      <TableCell className="font-medium">{expense.title}</TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${
                            expense.type === "income" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {expense.type === "expense" ? "-" : ""}RM
                          {Number(expense.amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={expense.type === "income" ? "default" : "destructive"}
                        >
                          {expense.type === "income" ? t("editExpense.income") : t("editExpense.expense")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {expense.category ? t(`categories.${expense.category}`) : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {expense.date ? expense.date.split("T")[0] : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/edit/${expense.id}`)}
                          >
                            {t("home.edit")}
                          </Button>
                          <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(expense.id)}
                            >
                              {t("home.delete")}
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="rounded-lg border bg-card p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium">{expense.title}</div>
                    <span
                      className={`font-semibold whitespace-nowrap ${
                        expense.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {expense.type === "expense" ? "-" : ""}RM
                      {Number(expense.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Badge
                      variant={expense.type === "income" ? "default" : "destructive"}
                    >
                      {expense.type === "income" ? t("editExpense.income") : t("editExpense.expense")}
                    </Badge>
                    <span>{expense.category ? t(`categories.${expense.category}`) : "-"}</span>
                    <span className="text-xs">{expense.date ? expense.date.split("T")[0] : "-"}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/edit/${expense.id}`)}
                    >
                      {t("home.edit")}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(expense.id)}
                    >
                      {t("home.delete")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, resp?.total ?? 0)} / {resp?.total ?? 0}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    ‹ Prev
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((page, idx, arr) => (
                      <span key={page} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-1 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          className="min-w-[36px]"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      </span>
                    ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next ›
                  </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <DialogContent className="w-[320px]">
            <DialogHeader>
              <DialogTitle>{t("home.deleteConfirmTitle")}</DialogTitle>
              <DialogDescription>{t("home.deleteDescription")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                {t("home.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteMutation.mutate(deleteId);
                  setDeleteId(null);
                }}
              >
                {t("home.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

export default Home;