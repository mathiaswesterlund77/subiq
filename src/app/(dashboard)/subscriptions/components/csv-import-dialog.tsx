"use client";

import { useRef, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { importSubscriptions } from "../actions";

const TEMPLATE_CSV =
  "software_name,price,currency,billing_cycle,seats,next_renewal_date,status\nSlack,99,USD,monthly,20,2026-05-15,active";

const ACCEPTED_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const ACCEPTED_EXTENSIONS = [".csv", ".xls", ".xlsx"];

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row;
  });
}

function getFileExtension(name: string) {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

function findDuplicates(rows: Record<string, string>[]): number[] {
  const seen = new Set<string>();
  const dupeIndices: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    const key = `${rows[i].software_name?.trim().toLowerCase()}|${rows[i].price}|${rows[i].currency?.trim().toLowerCase()}|${rows[i].billing_cycle?.trim().toLowerCase()}`;
    if (seen.has(key)) {
      dupeIndices.push(i);
    } else {
      seen.add(key);
    }
  }
  return dupeIndices;
}

export function CsvImportDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [duplicateRows, setDuplicateRows] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function resetState() {
    setPreview([]);
    setFileName("");
    setFileError("");
    setDuplicateRows([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError("");
    setDuplicateRows([]);

    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      setFileError("Only one file can be imported at a time.");
      e.target.value = "";
      return;
    }

    const file = files[0];
    const ext = getFileExtension(file.name);

    if (!ACCEPTED_EXTENSIONS.includes(ext) && !ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Invalid file type. Only CSV and Excel files (.csv, .xls, .xlsx) are accepted.");
      e.target.value = "";
      return;
    }

    if (ext === ".xls" || ext === ".xlsx") {
      setFileError("Excel files must be saved as CSV before importing. Please export as .csv and try again.");
      e.target.value = "";
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCsv(text);

      if (rows.length === 0) {
        setFileError("File is empty or has no data rows.");
        setPreview([]);
        return;
      }

      const dupes = findDuplicates(rows);
      setDuplicateRows(dupes);
      if (dupes.length > 0) {
        setFileError(
          `${dupes.length} duplicate row${dupes.length > 1 ? "s" : ""} found (same name, price, currency, cycle). Duplicates will be skipped.`
        );
      }

      setPreview(rows);
    };
    reader.readAsText(file);
  }

  function handleImport() {
    const rowsToImport = preview.filter((_, i) => !duplicateRows.includes(i));
    if (rowsToImport.length === 0) return;

    startTransition(async () => {
      const result = await importSubscriptions(rowsToImport);
      if (result.success) {
        const msgs: string[] = [];
        if (result.imported > 0)
          msgs.push(
            `${result.imported} subscription${result.imported > 1 ? "s" : ""} imported`
          );
        if (result.skipped.length > 0)
          msgs.push(
            `${result.skipped.length} row${result.skipped.length > 1 ? "s" : ""} skipped`
          );
        toast.success(msgs.join(", ") || "Import complete");

        if (result.skipped.length > 0) {
          result.skipped.forEach((s) =>
            toast.error(`Row ${s.row}: ${s.reason}`)
          );
        }
        setOpen(false);
        resetState();
      } else {
        toast.error(result.error ?? "Import failed");
      }
    });
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "subscriptions-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const importableCount = preview.length - duplicateRows.length;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) resetState();
      }}
    >
      <DialogTrigger
        render={
          <Button className="border border-white/15 bg-black text-gray-300 hover:bg-white/10 hover:text-white">
            <Upload className="size-4" data-icon="inline-start" />
            Import CSV
          </Button>
        }
      />
      <DialogContent className="border border-white/15 bg-black sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white">
            Import Subscriptions from CSV
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Upload a CSV file to bulk-add subscriptions.
          </p>
        </DialogHeader>

        <div className="grid gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadTemplate}
            className="w-fit text-yellow-400 hover:text-yellow-300"
          >
            <FileSpreadsheet className="size-4" data-icon="inline-start" />
            Download template
          </Button>

          {/* File drop zone */}
          <label
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-6 transition-colors ${
              fileError && !preview.length
                ? "border-red-500/50 hover:border-red-500"
                : "border-white/20 hover:border-yellow-400/50"
            }`}
          >
            <Upload className="size-6 text-gray-500" />
            <span className="text-sm text-gray-400">
              {fileName || "Click to select a CSV file"}
            </span>
            <span className="text-xs text-gray-600">
              Accepted: .csv only (one file at a time)
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFile}
              className="hidden"
            />
          </label>

          {/* Error message */}
          {fileError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
              <p className="text-xs text-red-400">{fileError}</p>
            </div>
          )}

          {/* File loaded indicator */}
          {fileName && preview.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="size-4 text-yellow-400" />
                <span className="text-sm text-white">{fileName}</span>
                <span className="text-xs text-gray-500">
                  ({preview.length} row{preview.length !== 1 ? "s" : ""}
                  {duplicateRows.length > 0 && (
                    <>, {duplicateRows.length} duplicate{duplicateRows.length !== 1 ? "s" : ""}</>
                  )}
                  )
                </span>
              </div>
              <button
                type="button"
                onClick={resetState}
                className="text-gray-500 transition-colors hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* Preview table */}
          {preview.length > 0 && (
            <div className="max-h-48 overflow-auto rounded-lg border border-white/10 bg-white/5">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-2 py-1.5 text-left font-medium text-gray-500">#</th>
                    {Object.keys(preview[0]).map((h) => (
                      <th
                        key={h}
                        className="px-2 py-1.5 text-left font-medium text-gray-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {preview.slice(0, 10).map((row, i) => {
                    const isDupe = duplicateRows.includes(i);
                    return (
                      <tr key={i} className={isDupe ? "opacity-40 line-through" : ""}>
                        <td className="px-2 py-1 text-gray-500">{i + 1}</td>
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="px-2 py-1 text-gray-300">
                            {v}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {preview.length > 10 && (
                <p className="p-2 text-center text-xs text-gray-500">
                  ... and {preview.length - 10} more rows
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-2 flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            className="text-gray-400 hover:text-white"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={isPending || importableCount === 0}
            className="bg-yellow-400 font-semibold text-black hover:bg-yellow-300 disabled:opacity-50"
          >
            {isPending
              ? "Importing..."
              : `Import ${importableCount} row${importableCount !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
