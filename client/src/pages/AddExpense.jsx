import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

const createExpense = async (data) => {
  const res = await api.post("/expenses", data);
  return res.data;
};

const AddExpense = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      amount: "",
      type: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      note: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success(t("addExpense.success"));
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t("addExpense.failed"));
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{t("addExpense.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t("addExpense.titleLabel")}</Label>
                <Input
                  id="title"
                  placeholder={t("addExpense.titlePlaceholder")}
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{t("addExpense.amountLabel")}</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={t("addExpense.amountPlaceholder")}
                  {...register("amount")}
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t("addExpense.typeLabel")}</Label>
                <Select
                  onValueChange={(value) => setValue("type", value, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("addExpense.typePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">{t("addExpense.income")}</SelectItem>
                    <SelectItem value="expense">{t("addExpense.expense")}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t("addExpense.categoryLabel")}</Label>
                <Select
                  onValueChange={(value) => setValue("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("addExpense.categoryPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {t(`categories.${cat}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">{t("addExpense.dateLabel")}</Label>
                <Input
                  id="date"
                  type="date"
                  {...register("date")}
                />
                {errors.date && (
                  <p className="text-sm text-red-500">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">{t("addExpense.noteLabel")}</Label>
                <Textarea
                  id="note"
                  placeholder={t("addExpense.notePlaceholder")}
                  {...register("note")}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("addExpense.saving") : t("addExpense.save")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/")}
                >
                  {t("addExpense.cancel")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddExpense;