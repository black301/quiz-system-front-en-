import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { InvoiceTable } from "@/components/Tables/invoice-table";
import { TopChannels } from "@/components/Tables/top-channels";
import { TopChannelsSkeleton } from "@/components/Tables/top-channels/skeleton";
import { TopStudents } from "@/components/Tables/top-products";
import { TopProductsSkeleton } from "@/components/Tables/top-products/skeleton";

import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Students",
};

const TablesPage = () => {
  return (
    <>
      <Breadcrumb pageName="Students" />

      <div className="space-y-10">        
        <Suspense fallback={<TopProductsSkeleton />}>
          <TopStudents />
        </Suspense>
      </div>
    </>
  );
};

export default TablesPage;
