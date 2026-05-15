import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { expenseSchema } from "@/lib/schemas";
import api from "@/lib/api";
import { useI18n } from "@/lib/I18nProvider";

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Others",
  "Salary",
  "Freelance",
];

const fetchExpense = async (id) => {
  const res = await api.get(`/expenses/${id}`);
  return res.data;
};

const updateExpense = async ({ id, data }) => {
  const res = await api.put(`/expenses/${id}`, data);
  return res.data;
};

const EditExpense = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(expenseSchema),
  });

  const {
    data: expense,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["expense", id],
    queryFn: () => fetchExpense(id),
  });

  useEffect(() => {
    if (expense) {
      reset({
        title: expense.title,
        amount: String(expense.amount),
        type: expense.type,
        category: expense.category || "",
        date: expense.date,
        note: expense.note || "",
      });
    }
  }, [expense, reset]);

  const mutation = useMutation({
    mutationFn: updateExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense", id] });
      toast.success(t("editExpense.success"));
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t("editExpense.failed"));
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({ id, data });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-8 text-center text-muted-foreground">
          {t("editExpense.loading")}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-8 text-center text-red-500">
          {t("editExpense.failedLoad")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{t("editExpense.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t("editExpense.titleLabel")}</Label>
                <Input
                  id="title"
                  placeholder={t("editExpense.titlePlaceholder")}
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{t("editExpense.amountLabel")}</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={t("editExpense.amountPlaceholder")}
                  {...register("amount")}
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t("editExpense.typeLabel")}</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("editExpense.typePlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">{t("editExpense.income")}</SelectItem>
                        <SelectItem value="expense">{t("editExpense.expense")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t("editExpense.categoryLabel")}</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("editExpense.categoryPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {t(`categories.${cat}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">{t("editExpense.dateLabel")}</Label>
                <Input id="date" type="date" {...register("date")} />
                {errors.date && (
                  <p className="text-sm text-red-500">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">{t("editExpense.noteLabel")}</Label>
                <Textarea
                  id="note"
                  placeholder={t("editExpense.notePlaceholder")}
                  {...register("note")}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("editExpense.updating") : t("editExpense.update")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/")}
                >
                  {t("editExpense.cancel")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditExpense;