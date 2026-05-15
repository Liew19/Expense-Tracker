import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import ExpenseForm from "@/components/ExpenseForm";
import api from "@/lib/api";
import { useI18n } from "@/lib/I18nProvider";

const AddExpense = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const mutation = useMutation({
    mutationFn: (data) => api.post("/expenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success(t("addExpense.success"));
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t("addExpense.failed"));
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8">
        <ExpenseForm
          defaultValues={{
            title: "",
            amount: "",
            type: "",
            category: "",
            date: new Date().toISOString().split("T")[0],
            note: "",
          }}
          onSubmit={(data) => mutation.mutate(data)}
          isSubmitting={mutation.isPending}
          submitLabel={t("addExpense.save")}
          submittingLabel={t("addExpense.saving")}
          onCancel={() => navigate("/")}
        />
      </div>
    </div>
  );
};

export default AddExpense;
