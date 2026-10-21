"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddressField, type Place } from "@/components/address-field";
import { CompanyField } from "@/components/company-field";
import type { Company } from "@/lib/places";
import { AMENITY_ICONS } from "@/components/amenity-icons";
import { Chip } from "@/components/chip";
import { ListingCard } from "@/components/listing-card";
import { PhotoUploader } from "@/components/photo-uploader";
import { CheckRow, RatingScale } from "@/components/rating-scale";
import { Button } from "@/components/ui/button";
import { AMENITY_IDS, AMENITY_LABEL } from "@/lib/amenities";
import { COPY } from "@/lib/copy";
import { TERMS } from "@/lib/filters";
import type { ProcessedPhoto } from "@/lib/images";
import {
  feeShares,
  fmtMoney0,
  TRANSFER_LABEL,
  TRANSFER_SHORT,
  UNIT_LABEL,
} from "@/lib/format";
import { milesFromUC } from "@/lib/geo";
import { TRAITS } from "@/lib/roommates";
import { useStore } from "@/lib/store";
import type {
  AmenityId,
  Household,
  Listing,
  TransferType,
  UnitType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const inputCls =
  "h-12 w-full rounded-2xl border border-border bg-background px-4 text-base outline-none focus:border-primary aria-invalid:border-destructive";

const DEFAULT_HOUSEHOLD: Household = {
  roommates: 2,
  cleanliness: 3,
  noise: 3,
  social: 2,
  guests: 2,
  sleep: 3,
  approachability: 3,
  smokeFree: true,
  cat: false,
  dog: false,
};

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

function Switch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium">{label}</p>
      <input
        type="checkbox"
        role="switch"
        aria-label={label}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="relative h-7 w-12 shrink-0 cursor-pointer appearance-none rounded-full bg-neutral-300 transition-colors before:absolute before:left-0.5 before:top-0.5 before:size-6 before:rounded-full before:bg-white before:shadow before:transition-transform checked:bg-primary checked:before:translate-x-5 dark:bg-neutral-600 dark:checked:bg-primary"
      />
    </div>
  );
}

export default function PostPage() {
  const router = useRouter();
  const { postListing } = useStore();
  const [posting, setPosting] = useState(false);
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [place, setPlace] = useState<Place | null>(null);
  const [rent, setRent] = useState("");
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(true);
  const [utilities, setUtilities] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [bedrooms, setBedrooms] = useState("1");
  const [furnished, setFurnished] = useState(false);
  const [unitType, setUnitType] = useState<UnitType>("room");
  const [transfer, setTransfer] = useState<TransferType>("sublease");
  const [amenities, setAmenities] = useState<AmenityId[]>([]);
  const [household, setHousehold] = useState<Household>(DEFAULT_HOUSEHOLD);
  const [description, setDescription] = useState("");
  const [uploads, setUploads] = useState<ProcessedPhoto[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [consent, setConsent] = useState(false);
  const [fee, setFee] = useState("");
  const [coverPct, setCoverPct] = useState(50); // share of the sublet fee the current tenant (you) will cover
  const [errors, setErrors] = useState<Record<string, string>>({});

  const feeNum = Math.max(0, Number(fee) || 0);
  const subletterPct = 100 - coverPct;
  const shares = feeShares(feeNum, subletterPct);
  const setH = (id: keyof Household, v: number | boolean) =>
    setHousehold((h) => ({ ...h, [id]: v }));

  // One object feeds both the live preview and the final post (placeholders show only while a field is empty).
  const at = place ?? {
    lat: 39.1412,
    lng: -84.5215,
    area: "Near UC",
    label: "",
  };
  const draft: Listing = {
    id: "draft",
    title: title.trim() || "Your headline here",
    address: address.trim(),
    neighborhood: at.area || "Near UC",
    lat: at.lat,
    lng: at.lng,
    rent: Number(rent) || 650,
    utilitiesIncluded,
    utilitiesEstimate: utilitiesIncluded ? 0 : Number(utilities) || 0,
    startDate: start || "2027-01-04",
    endDate: end || "2027-04-30",
    bedrooms: Number(bedrooms),
    furnished,
    unitType,
    transferType: transfer,
    distanceMiles: milesFromUC(at.lat, at.lng),
    description: description.trim() || "No description yet.",
    amenities,
    subletFee: consent ? feeNum : 0,
    feeSplitPct: subletterPct,
    household: unitType === "room" ? household : undefined,
    googlePlaceId: company?.id,
    landlordConsent: true,
    confirmedDaysAgo: 0,
    photos: uploads.length
      ? uploads.map((u) => u.full)
      : [
          "/photos/living-3.jpg",
          "/photos/bedroom-2.jpg",
          "/photos/kitchen-5.jpg",
        ],
    thumbs: uploads.length ? uploads.map((u) => u.thumb) : undefined,
    sublessor: { id: "me", name: "You", detail: "UC verified" },
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (posting) return;
    const err: Record<string, string> = {};
    if (!title.trim()) err.title = COPY.post.title;
    if (!place) err.address = COPY.post.address;
    if (!(Number(rent) > 0)) err.rent = COPY.post.rent;
    if (!utilitiesIncluded && !(Number(utilities) >= 0 && utilities !== ""))
      err.utilities = COPY.post.utilities;
    if (!start) err.start = COPY.post.start;
    if (!end) err.end = COPY.post.end;
    else if (start && end <= start) err.end = COPY.post.endBeforeStart;
    if (!uploads.length) err.photos = COPY.errors.photos;
    if (!consent) err.consent = COPY.post.consent;
    setErrors(err);
    if (Object.keys(err).length) return;

    setPosting(true);
    const id = await postListing(draft, uploads);
    setPosting(false);
    if (id) router.push(`/listing/${id}`);
  };

  const toggleAmenity = (id: AmenityId) =>
    setAmenities((a) =>
      a.includes(id) ? a.filter((x) => x !== id) : [...a, id],
    );

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-12 px-4 pb-8 pt-6 md:px-6 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)]">
      <form onSubmit={submit} noValidate className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Post a listing
          </h1>
          <p className="text-sm text-muted-foreground">
            Clear details get faster replies. Add photos of any size and we&apos;ll
            shrink them for you.
          </p>
        </div>

        <PhotoUploader photos={uploads} onChange={setUploads} error={errors.photos} />

        <Field label="Headline" error={errors.title}>
          <input
            className={inputCls}
            aria-invalid={!!errors.title}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sunny room near campus"
          />
        </Field>

        <div className="space-y-1.5">
          <p className="text-sm font-medium">Street address</p>
          <AddressField
            value={address}
            place={place}
            onChange={(text, p) => {
              setAddress(text);
              setPlace(p);
            }}
            error={errors.address}
          />
          <p className="text-xs text-muted-foreground">
            We measure the distance from the UC campus automatically.
          </p>
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
          <Switch
            label="Utilities included in rent"
            checked={utilitiesIncluded}
            onChange={setUtilitiesIncluded}
          />
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

        <Switch label="Furnished" checked={furnished} onChange={setFurnished} />

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

        <div className="space-y-1.5">
          <Field label="Lease transfer type">
            <select
              className={inputCls}
              value={transfer}
              onChange={(e) => setTransfer(e.target.value as TransferType)}
            >
              {(Object.keys(TRANSFER_SHORT) as TransferType[]).map((t) => (
                <option key={t} value={t}>
                  {TRANSFER_SHORT[t]}
                </option>
              ))}
            </select>
          </Field>
          <p className="text-xs text-muted-foreground">
            {TRANSFER_LABEL[transfer]}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Amenities</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {AMENITY_IDS.map((id) => {
              const Icon = AMENITY_ICONS[id];
              const on = amenities.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleAmenity(id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-center text-xs transition-colors",
                    on
                      ? "border-primary bg-primary/10 text-brand"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40",
                  )}
                >
                  <Icon className="size-5" />
                  {AMENITY_LABEL[id]}
                </button>
              );
            })}
          </div>
        </div>

        {unitType === "room" && (
          <section className="space-y-5 rounded-3xl border border-border p-5">
            <div>
              <h2 className="text-base font-semibold">Your household</h2>
              <p className="text-sm text-muted-foreground">
                Rate the people already living there. Students see how well it
                fits them.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Other people living there</p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <Chip
                    key={n}
                    active={household.roommates === n}
                    onClick={() => setH("roommates", n)}
                  >
                    {n}
                  </Chip>
                ))}
              </div>
            </div>
            {TRAITS.map((t) => (
              <RatingScale
                key={t.id}
                def={t}
                value={household[t.id]}
                onChange={(v) => setH(t.id, v)}
              />
            ))}
            <div className="space-y-2">
              <CheckRow
                checked={household.smokeFree}
                onChange={(v) => setH("smokeFree", v)}
              >
                Smoke-free home
              </CheckRow>
              <CheckRow
                checked={household.cat}
                onChange={(v) => setH("cat", v)}
              >
                There&apos;s a cat
              </CheckRow>
              <CheckRow
                checked={household.dog}
                onChange={(v) => setH("dog", v)}
              >
                There&apos;s a dog
              </CheckRow>
            </div>
          </section>
        )}

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
          <p className="text-sm font-medium">Property management company (optional)</p>
          <p className="text-xs text-muted-foreground">If a company manages the building, add it so students see its Google star rating on your listing.</p>
          <CompanyField value={company} onChange={setCompany} />
        </div>

        <div className="space-y-3">
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

          {/* appears once the landlord-consent box is ticked */}
          {consent && (
            <div className="animate-in space-y-5 rounded-2xl border border-border bg-card p-5 duration-300 fade-in slide-in-from-top-2">
              <Field label="What is the sublet fee? ($)">
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="0 if your landlord doesn't charge one"
                />
              </Field>

              {feeNum > 0 && (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <label htmlFor="fee-split" className="text-sm font-medium">
                      Will you split it? How much will you cover?
                    </label>
                    <span className="text-sm font-semibold text-brand">
                      {coverPct}%
                    </span>
                  </div>
                  <input
                    id="fee-split"
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={coverPct}
                    onChange={(e) => setCoverPct(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-muted p-3">
                      <p className="text-xs text-muted-foreground">You cover</p>
                      <p className="text-lg font-semibold tabular-nums">
                        {fmtMoney0(shares.tenant)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted p-3">
                      <p className="text-xs text-muted-foreground">
                        Subletter pays
                      </p>
                      <p className="text-lg font-semibold tabular-nums">
                        {fmtMoney0(shares.subletter)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Drag to 0% if the subletter pays all of it, or 100% if
                    you&apos;ll cover it yourself.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={posting}>
          {posting ? "Posting…" : "Post listing"}
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
            This is how students will see your listing in the deck. Add photos
            above to see yours here.
          </p>
        </div>
      </aside>
    </div>
  );
}
