import { compactFormat } from "@/lib/format-number";
import { getOverviewData } from "../../fetch";
import { OverviewCard } from "./card";
import * as icons from "./icons";

export async function OverviewCardsGroup() {
  const { views, profit, products, users } = await getOverviewData();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 2xl:gap-7.5">
      <OverviewCard
        label="Total Quizes"
        data={{
          ...products,
          value: compactFormat(products.value),
        }}
        Icon={icons.Product}
      />
      <OverviewCard
        label="Total Students"
        data={{
          ...users,
          value: compactFormat(users.value),
        }}
        Icon={icons.Users}
      />
      <OverviewCard
        label="Total Submissions"
        data={{
          ...views,
          value: compactFormat(views.value),
        }}
        Icon={icons.Views}
      />
    </div>
  );
}
