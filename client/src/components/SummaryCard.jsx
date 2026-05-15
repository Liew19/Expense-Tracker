import { Card, CardContent } from "@/components/ui/card";

const SummaryCard = ({ title, amount, type }) => {
  const colorClass =
    type === "income"
      ? "text-green-600"
      : type === "expense"
        ? "text-red-600"
        : amount >= 0
          ? "text-green-600"
          : "text-red-600";

  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className={`text-2xl font-bold ${colorClass}`}>
          {type === "expense" || (type === "balance" && amount < 0) ? "-" : ""}RM
          {Math.abs(amount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;