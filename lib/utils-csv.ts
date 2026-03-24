export function downloadCSV(data: Record<string, unknown>[], filename: string) {
    if (!data || !data.length) return;

    // Extract headers
    const headers = Object.keys(data[0]);

    // Format rows
    const csvRows = [];

    // Add headers row
    csvRows.push(headers.join(';')); // Using semi-colon for French Excel compatibility

    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header];
            // Handle commas, newlines, and quotes by wrapping in quotes
            if (val === null || val === undefined) return '""';
            const strVal = String(val).replace(/"/g, '""'); // Escape inner quotes
            return `"${strVal}"`;
        });
        csvRows.push(values.join(';'));
    }

    // Create Blob with BOM for UTF-8 (forces Excel to read French characters correctly)
    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);

    // Trigger download
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
