"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/chip";
import { ListingCard } from "@/components/listing-card";
import { NEIGHBORHOODS, TERMS } from "@/lib/filters";
import { TRANSFER_LABEL, TRANSFER_SHORT, UNIT_LABEL } from "@/lib/format";
import { useStore } from "@/lib/store";
import type {
  Listing,
  Neighborhood,
  TransferType,
  UnitType,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { COPY } from "@/lib/copy";

// Rough walking distance from each neighborhood's center to campus. Real version would geocode the address.
const DISTANCE: Record<Neighborhood, number> = {
  Uptown: 0.4,
  Clifton: 0.7,
  Corryville: 0.6,
  "Over-the-Rhine": 2.1,
};

const inputCls =
  "h-12 w-full rounded-2xl border border-border bg-background px-4 text-base outline-none focus:border-primary aria-invalid:border-destructive";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-medium">
      {label}
      {children}
      {error && (
        <span className="block text-sm font-normal text-destructive">
          {error}
        </span>
      )}
    </label>
  );
}

export default function PostPage() {
  const router = useRouter();
  const { addListing, showToast } = useStore();
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [hood, setHood] = useState<Neighborhood>("Uptown");
  const [rent, setRent] = useState("");
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(true);
  const [utilities, setUtilities] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [bedrooms, setBedrooms] = useState("1");
  const [furnished, setFurnished] = useState(false);
  const [unitType, setUnitType] = useState<UnitType>("room");
  const [transfer, setTransfer] = useState<TransferType>("sublease");
  const [description, setDescription] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Same object feeds the live preview and the final post (placeholders only show while a field is empty).
  const draft: Listing = {
    id: "draft",
    title: title.trim() || "Your headline here",
    address: address.trim(),
    neighborhood: hood,
    rent: Number(rent) || 650,
    utilitiesIncluded,
    utilitiesEstimate: utilitiesIncluded ? 0 : Number(utilities) || 0,
    startDate: start || "2027-01-04",
    endDate: end || "2027-04-30",
    bedrooms: Number(bedrooms),
    furnished,
    unitType,
    transferType: transfer,
    distanceMiles: DISTANCE[hood],
    description: description.trim() || "No description yet.",
    amenities: [],
    landlordConsent: true,
    confirmedDaysAgo: 0,
    photos: [
      "/photos/living-3.jpg",
      "/photos/bedroom-2.jpg",
      "/photos/kitchen-5.jpg",
    ],
    sublessor: { id: "me", name: "You", detail: "UC verified" },
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!title.trim()) err.title = COPY.post.title;
    if (!address.trim()) err.address = COPY.post.address;
    if (!(Number(rent) > 0)) err.rent = COPY.post.rent;
    if (!utilitiesIncluded && !(Number(utilities) >= 0 && utilities !== ""))
      err.utilities = COPY.post.utilities;
    if (!start) err.start = COPY.post.start;
    if (!end) err.end = COPY.post.end;
    else if (start && end <= start)
      err.end = COPY.post.endBeforeStart;
    if (!consent) err.consent = COPY.post.consent;
    setErrors(err);
    if (Object.keys(err).length) return;

    const listing: Listing = { ...draft, id: `mine-${Date.now()}` };
    addListing(listing);
    showToast(COPY.toast.posted);
    router.push(`/listing/${listing.id}`);
  };

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-12 px-4 pb-8 pt-6 md:px-6 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)]">
      <form onSubmit={submit} noValidate className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Post a listing
          </h1>
          <p className="text-sm text-muted-foreground">
            Clear details get faster replies. Photos aren&apos;t part of this
            demo.
          </p>
        </div>

        <Field label="Headline" error={errors.title}>
          <input
            className={inputCls}
            aria-invalid={!!errors.title}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sunny room near campus"
          />
        </Field>

        <Field label="Street address" error={errors.address}>
          <input
            className={inputCls}
            aria-invalid={!!errors.address}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Example St"
          />
        </Field>

        <div className="space-y-1.5">
          <p className="text-sm font-medium">Neighborhood</p>
          <div className="flex flex-wrap gap-2">
            {NEIGHBORHOODS.map((n) => (
              <Chip key={n} active={hood === n} onClick={() => setHood(n)}>
                {n}
              </Chip>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Rent per month ($)" error={errors.rent}>
            <input
              className={inputCls}
              aria-invalid={!!errors.rent}
              inputMode="numeric"
              type="number"
              min={0}
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              placeholder="650"
            />
          </Field>
          <Field label="Bedrooms in unit">
            <select
              className={inputCls}
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
            >
              <option value="0">Studio</option>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Utilities included in rent</p>
            <input
              type="checkbox"
              role="switch"
              aria-label="Utilities included in rent"
              checked={utilitiesIncluded}
              onChange={(e) => setUtilitiesIncluded(e.target.checked)}
              className="relative h-7 w-12 shrink-0 cursor-pointer appearance-none rounded-full bg-neutral-300 dark:bg-neutral-600 transition-colors before:absolute before:left-0.5 before:top-0.5 before:size-6 before:rounded-full before:bg-white before:shadow before:transition-transform checked:bg-primary dark:checked:bg-primary checked:before:translate-x-5"
            />
          </div>
          {!utilitiesIncluded && (
            <Field
              label="Estimated utilities per month ($)"
              error={errors.utilities}
            >
              <input
                className={inputCls}
                aria-invalid={!!errors.utilities}
                type="number"
                min={0}
                value={utilities}
                onChange={(e) => setUtilities(e.target.value)}
                placeholder="80"
              />
            </Field>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Quick fill for a co-op term</p>
          <div className="flex flex-wrap gap-2">
            {TERMS.map((t) => (
              <Chip
                key={t.id}
                active={start === t.from && end === t.to}
                onClick={() => {
                  setStart(t.from);
                  setEnd(t.to);
                }}
              >
                {t.label}{" "}
                <span className="ml-1 text-muted-foreground">{t.hint}</span>
              </Chip>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start date" error={errors.start}>
            <input
              className={inputCls}
              aria-invalid={!!errors.start}
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </Field>
          <Field label="End date" error={errors.end}>
            <input
              className={inputCls}
              aria-invalid={!!errors.end}
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </Field>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Furnished</p>
          <input
            type="checkbox"
            role="switch"
            aria-label="Furnished"
            checked={furnished}
            onChange={(e) => setFurnished(e.target.checked)}
            className="relative h-7 w-12 shrink-0 cursor-pointer appearance-none rounded-full bg-neutral-300 dark:bg-neutral-600 transition-colors before:absolute before:left-0.5 before:top-0.5 before:size-6 before:rounded-full before:bg-white before:shadow before:transition-transform checked:bg-primary dark:checked:bg-primary checked:before:translate-x-5"
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-medium">What are you offering?</p>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
            {(Object.keys(UNIT_LABEL) as UnitType[]).map((u) => (
              <button
                key={u}
                type="button"
                aria-pressed={unitType === u}
                onClick={() => setUnitType(u)}
                className={cn(
                  "rounded-xl py-2.5 text-sm font-medium transition-colors",
                  unitType === u
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {u === "room" ? "A room" : "Whole unit"}
              </button>
            ))}
          </div>
        </div>

        <Field label="Lease transfer type">
          <select
            className={inputCls}
            value={transfer}
            onChange={(e) => setTransfer(e.target.value as TransferType)}
          >
            {(Object.keys(TRANSFER_LABEL) as TransferType[]).map((t) => (
              <option key={t} value={t}>
                {TRANSFER_SHORT[t]}
              </option>
            ))}
          </select>
        </Field>
        <p className="-mt-3 text-xs text-muted-foreground">{TRANSFER_LABEL[transfer]}</p>

        <Field label="Description (optional)">
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Roommates, what's included, anything a subletter should know."
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
          />
        </Field>

        <div className="space-y-1.5">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border p-4 text-sm">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              aria-required
              aria-invalid={!!errors.consent}
              className="mt-0.5 size-5 shrink-0 accent-primary"
            />
            My lease allows subletting / I have landlord consent.
          </label>
          {errors.consent && (
            <p className="text-sm text-destructive">{errors.consent}</p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full">
          Post listing
        </Button>
      </form>

      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Live preview
          </p>
          <div className="h-[34rem] max-w-sm">
            <ListingCard listing={draft} interactive preview />
          </div>
          <p className="max-w-sm text-xs text-muted-foreground">
            This is how students will see your listing in the deck. Demo photos
            stand in for yours.
          </p>
        </div>
      </aside>
    </div>
  );
}
