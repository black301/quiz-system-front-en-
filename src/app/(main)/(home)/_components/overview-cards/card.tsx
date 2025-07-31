import type { JSX, SVGProps } from "react";

type PropsType = {
  label: string;
  data: {
    value: number | string;
  };
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
};

export function OverviewCard({ label, data, Icon }: PropsType) {
  return (
    <div className="flex items-center gap-6 rounded-2xl bg-white p-6 shadow-lg transition hover:shadow-xl dark:bg-gray-900">
      {/* Icon container */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20">
        <Icon className="h-8 w-8" />
      </div>

      {/* Value and label */}
      <div>
        <dt className="text-3xl font-bold text-dark dark:text-white">
          {data.value}
        </dt>
        <dd className="mt-1 text-base font-medium text-gray-600 dark:text-gray-400">
          {label}
        </dd>
      </div>
    </div>
  );
}
