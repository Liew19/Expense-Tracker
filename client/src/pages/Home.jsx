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

const fetchExpenses = async () => {
  const res = await api.get("/expenses");
  return res.data;
};

const deleteExpense = async (id) => {
  await api.delete(`/expenses/${id}`);
};

const seedData = async () => {
  const res = await api.get("/expenses/seed");
  return res.data;
};

const Home = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [filterType, setFilterType] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterDate, setFilterDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterMonth, filterDate]);

  const {
    data: expenses = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
  });

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
    deleteMutation.mutate(id);
  };

  const seedMutation = useMutation({
    mutationFn: seedData,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success(`Added ${data.count} sample records`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Seed failed");
    },
  });

  const handleDateSelect = (date) => {
    // Toggle: clicking the same date deselects it
    if (date && filterDate && date.getTime() === filterDate.getTime()) {
      setFilterDate(null);
    } else {
      setFilterDate(date);
    }
  };

  // Get unique dates that have records (for calendar dots)
  const datesWithRecords = (() => {
    const dateStrings = [...new Set(expenses.map((e) => e.date.split("T")[0]))];
    return dateStrings.map((s) => {
      const [y, m, d] = s.split("-").map(Number);
      return new Date(y, m - 1, d);
    });
  })();

  // Filter expenses
  const filteredExpenses = expenses.filter((e) => {
    if (filterType !== "all" && e.type !== filterType) return false;
    if (filterMonth !== "all") {
      const expenseMonth = e.date.substring(0, 7);
      if (expenseMonth !== filterMonth) return false;
    }
    if (filterDate && e.date.split("T")[0] !== format(filterDate, "yyyy-MM-dd")) return false;
    return true;
  });

  // Summary cards reflect filtered data
  const totalIncome = filteredExpenses
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalExpense = filteredExpenses
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const balance = totalIncome - totalExpense;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedExpenses = filteredExpenses.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  // Get unique months for filter
  const months = [
    ...new Set(expenses.map((e) => e.date.substring(0, 7))),
  ].sort();

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
            {expenses.length === 0 && (
              <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
                {seedMutation.isPending ? "Seeding..." : "Load Sample Data"}
              </Button>
            )}
            <Button onClick={() => navigate("/add")}>{t("home.addNew")}</Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            {t("home.loading")}
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">{t("home.noRecords")}</div>
            <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
              {seedMutation.isPending ? "Seeding..." : "Load Sample Data"}
            </Button>
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
                  {paginatedExpenses.map((expense) => (
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
              {paginatedExpenses.map((expense) => (
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
                  {(safePage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(safePage * ITEMS_PER_PAGE, filteredExpenses.length)} / {filteredExpenses.length}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    ‹ Prev
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - safePage) <= 1) return true;
                      return false;
                    })
                    .map((page, idx, arr) => (
                      <span key={page} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-1 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={page === safePage ? "default" : "outline"}
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
                    disabled={safePage >= totalPages}
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
    </div>
  );
};

export default Home;