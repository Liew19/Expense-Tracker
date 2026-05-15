 import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useI18n } from "@/lib/I18nProvider";

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { t } = useI18n();

  return (
    <>
      <tr>
        <td className="font-medium">{expense.title}</td>
        <td>
          <span
            className={
              expense.type === "income" ? "text-green-600" : "text-red-600"
            }
          >
            {expense.type === "expense" ? "-" : ""}RM
            {Number(expense.amount).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </span>
        </td>
        <td>
          <Badge variant={expense.type === "income" ? "default" : "destructive"}>
            {expense.type === "income" ? t("editExpense.income") : t("editExpense.expense")}
          </Badge>
        </td>
        <td className="text-muted-foreground">
          {expense.category ? t(`categories.${expense.category}`) : "-"}
        </td>
        <td className="text-muted-foreground">{expense.date}</td>
        <td className="text-right">
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(expense)}>
              {t("home.edit")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              {t("home.delete")}
            </Button>
          </div>
        </td>
      </tr>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("home.deleteConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("home.deleteConfirmMsg", { title: expense.title })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              {t("home.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(expense.id);
                setShowDeleteDialog(false);
              }}
            >
              {t("home.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpenseCard;
