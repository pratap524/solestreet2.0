"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Ruler, Footprints, CheckCircle2 } from "lucide-react";

interface SizeGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: string;
}

const SIZE_CHART = [
  { usMen: "6.0", usWomen: "7.5", uk: "5.5", eu: "38.5", cm: "24.0" },
  { usMen: "6.5", usWomen: "8.0", uk: "6.0", eu: "39.0", cm: "24.5" },
  { usMen: "7.0", usWomen: "8.5", uk: "6.0", eu: "40.0", cm: "25.0" },
  { usMen: "7.5", usWomen: "9.0", uk: "6.5", eu: "40.5", cm: "25.5" },
  { usMen: "8.0", usWomen: "9.5", uk: "7.0", eu: "41.0", cm: "26.0" },
  { usMen: "8.5", usWomen: "10.0", uk: "7.5", eu: "42.0", cm: "26.5" },
  { usMen: "9.0", usWomen: "10.5", uk: "8.0", eu: "42.5", cm: "27.0" },
  { usMen: "9.5", usWomen: "11.0", uk: "8.5", eu: "43.0", cm: "27.5" },
  { usMen: "10.0", usWomen: "11.5", uk: "9.0", eu: "44.0", cm: "28.0" },
  { usMen: "10.5", usWomen: "12.0", uk: "9.5", eu: "44.5", cm: "28.5" },
  { usMen: "11.0", usWomen: "12.5", uk: "10.0", eu: "45.0", cm: "29.0" },
  { usMen: "11.5", usWomen: "13.0", uk: "10.5", eu: "45.5", cm: "29.5" },
  { usMen: "12.0", usWomen: "13.5", uk: "11.0", eu: "46.0", cm: "30.0" },
  { usMen: "13.0", usWomen: "14.5", uk: "12.0", eu: "47.5", cm: "31.0" },
  { usMen: "14.0", usWomen: "15.5", uk: "13.0", eu: "48.5", cm: "32.0" },
];

export function SizeGuideModal({
  open,
  onOpenChange,
  brand = "SoleStreet",
}: SizeGuideModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 rounded-3xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-zinc-900">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center">
              <Ruler className="h-5 w-5 text-zinc-900" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight">
              {brand} Sneaker Size Guide
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-zinc-500">
            Find your precise fit across international sizing standards. All measurements are in centimeters (CM).
          </DialogDescription>
        </DialogHeader>

        {/* Fit recommendations badge */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 mt-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-700 leading-relaxed">
            <span className="font-bold text-zinc-950">Fit Recommendation: </span>
            This model fits true to size. If you have wider feet or prefer a relaxed feel for thick running socks, we suggest ordering half a size up.
          </div>
        </div>

        {/* Sizing Table */}
        <div className="mt-4 border border-zinc-200/90 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead>
                <tr className="bg-zinc-900 text-white font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">US Men</th>
                  <th className="py-3 px-3">US Women</th>
                  <th className="py-3 px-3">UK</th>
                  <th className="py-3 px-3">EU</th>
                  <th className="py-3 px-3 bg-zinc-800">CM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 font-medium">
                {SIZE_CHART.map((row, idx) => (
                  <tr
                    key={row.usMen}
                    className={`hover:bg-zinc-50/80 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-zinc-50/40"
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-zinc-950">{row.usMen}</td>
                    <td className="py-2.5 px-3 text-zinc-700">{row.usWomen}</td>
                    <td className="py-2.5 px-3 text-zinc-600">{row.uk}</td>
                    <td className="py-2.5 px-3 text-zinc-600">{row.eu}</td>
                    <td className="py-2.5 px-3 font-semibold text-zinc-900 bg-zinc-100/60">
                      {row.cm}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* How to measure */}
        <div className="mt-6 pt-5 border-t border-zinc-200">
          <div className="flex items-center gap-2 mb-3">
            <Footprints className="h-4 w-4 text-zinc-900" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              How to Measure Your Foot Length
            </h4>
          </div>
          <ol className="space-y-2 text-xs text-zinc-600 list-decimal list-inside leading-relaxed">
            <li>Place a sheet of paper on a hard floor against a flat wall.</li>
            <li>Stand upright with your heel touching the wall.</li>
            <li>Mark the furthest point of your longest toe on the paper.</li>
            <li>Measure the distance from the edge of the paper to the mark in centimeters (CM).</li>
            <li>Match your measurement with the CM column above to find your exact US size.</li>
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
}
