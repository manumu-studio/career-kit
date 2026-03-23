"use client";

/** History page listing past analyses with search, filters, and pagination. */
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { HistoryList, useHistoryList } from "@/components/ui/HistoryList";
import { useSession } from "@/features/auth";

export default function HistoryPage() {
  const t = useTranslations("history");
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.externalId;

  const {
    items,
    total,
    page,
    limit,
    companySearch,
    typeFilter,
    setCompanySearch,
    setTypeFilter,
    setPage,
    deleteItem,
    deletingId,
    isLoading,
    error,
  } = useHistoryList({ userId });

  const handleView = (id: string): void => {
    router.push(`/history/${id}`);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link
          className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:border-foreground hover:text-foreground"
          href="/home"
        >
          {t("backToUpload")}
        </Link>
      </header>

      <HistoryList
        companySearch={companySearch}
        deletingId={deletingId}
        error={error}
        isLoading={isLoading}
        items={items}
        limit={limit}
        onCompanySearchChange={setCompanySearch}
        onDelete={deleteItem}
        onPageChange={setPage}
        onTypeFilterChange={setTypeFilter}
        onView={handleView}
        page={page}
        total={total}
        typeFilter={typeFilter}
      />
    </div>
  );
}
