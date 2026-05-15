import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

export default function ExpenseForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  submittingLabel,
  onCancel,
}) {
  const { t } = useI18n();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    values: defaultValues,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {submitLabel === t("addExpense.save")
            ? t("addExpense.title")
            : t("editExpense.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t("addExpense.titleLabel")}</Label>
            <Input
              id="title"
              placeholder={t("addExpense.titlePlaceholder")}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Amount */}
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
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>{t("addExpense.typeLabel")}</Label>
            <Select
              onValueChange={(value) =>
                setValue("type", value, { shouldValidate: true })
              }
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

          {/* Category */}
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

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">{t("addExpense.dateLabel")}</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">{t("addExpense.noteLabel")}</Label>
            <Textarea
              id="note"
              placeholder={t("addExpense.notePlaceholder")}
              {...register("note")}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              {t("addExpense.cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
