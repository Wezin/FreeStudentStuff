import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { AdminListingStats } from "@/features/listings/queries";

type AdminStatsProps = {
  stats: AdminListingStats;
  pendingSubmissions: number;
};

export function AdminStats({ stats, pendingSubmissions }: AdminStatsProps) {
  const items = [
    { label: "Published", value: stats.published },
    { label: "Draft", value: stats.draft },
    { label: "Expired", value: stats.expired },
    { label: "Archived", value: stats.archived },
    { label: "Pending Submissions", value: pendingSubmissions },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label} className="border-white/10 bg-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
