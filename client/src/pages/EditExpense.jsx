import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import ExpenseForm from "@/components/ExpenseForm";
import api from "@/lib/api";
import { useI18n } from "@/lib/I18nProvider";

const EditExpense = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const { data: expense, isLoading, isError } = useQuery({
    queryKey: ["expense", id],
    queryFn: async () => {
      const res = await api.get(`/expenses/${id}`);
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => api.put(`/expenses/${id}`, data),
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
        <ExpenseForm
          key={id}
          defaultValues={{
            title: expense.title,
            amount: String(expense.amount),
            type: expense.type,
            category: expense.category || "",
            date: expense.date,
            note: expense.note || "",
          }}
          onSubmit={(data) => mutation.mutate(data)}
          isSubmitting={mutation.isPending}
          submitLabel={t("editExpense.update")}
          submittingLabel={t("editExpense.updating")}
          onCancel={() => navigate("/")}
        />
      </div>
    </div>
  );
};

export default EditExpense;
