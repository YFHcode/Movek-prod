"use client";

import React, { useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    getFilteredRowModel,
} from "@tanstack/react-table";
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdminDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    searchPlaceholder?: string;
    onExport?: () => void;
    title?: string;
}

export function AdminDataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = "Rechercher...",
    onExport,
    title
}: AdminDataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            globalFilter,
        },
    });

    return (
        <div className="bg-[#0F2040] rounded-xl border border-[#1E3A5F] overflow-hidden flex flex-col h-full">
            {/* Header / Toolbar */}
            <div className="p-4 border-b border-[#1E3A5F] flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                    {title && <h2 className="text-lg font-bold text-white mb-2 sm:mb-0">{title}</h2>}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {searchKey && (
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={globalFilter ?? ""}
                                onChange={(event) => setGlobalFilter(String(event.target.value))}
                                className="pl-9 bg-[#0A1628] border-[#1E3A5F] text-white focus:border-[#FF6B00] w-full"
                            />
                        </div>
                    )}

                    {onExport && (
                        <Button
                            variant="outline"
                            onClick={onExport}
                            className="bg-[#0A1628] border-[#1E3A5F] text-slate-300 hover:text-white shrink-0"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Exporter CSV
                        </Button>
                    )}
                </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-[#0A1628] border-b border-[#1E3A5F]">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <th
                                            key={header.id}
                                            className="px-6 py-4 font-semibold whitespace-nowrap cursor-pointer hover:text-white transition-colors"
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div className="flex items-center gap-2">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                {{
                                                    asc: <ChevronUp className="w-4 h-4" />,
                                                    desc: <ChevronDown className="w-4 h-4" />,
                                                }[header.column.getIsSorted() as string] ?? null}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-[#1E3A5F]">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="hover:bg-white/5 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-12 text-center text-slate-400"
                                >
                                    Aucun résultat trouvé.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-[#1E3A5F] flex items-center justify-between bg-[#0A1628]">
                <div className="text-sm text-slate-400">
                    Page <span className="text-white font-medium">{table.getState().pagination.pageIndex + 1}</span> sur{" "}
                    <span className="text-white font-medium">{table.getPageCount() || 1}</span>
                    <span className="ml-4">
                        ({table.getFilteredRowModel().rows.length} enregistrements)
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="bg-[#0F2040] border-[#1E3A5F] text-slate-300 hover:text-white disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="bg-[#0F2040] border-[#1E3A5F] text-slate-300 hover:text-white disabled:opacity-50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
