"use client";

import { pdf } from "@react-pdf/renderer";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10 },
  title: { fontSize: 16, marginBottom: 20, fontWeight: "bold" },
  row: { flexDirection: "row", borderBottom: "1px solid #ccc", paddingVertical: 6 },
  header: { flexDirection: "row", borderBottom: "2px solid #000", paddingVertical: 6, fontWeight: "bold" },
  cell: { flex: 1 },
  summary: { marginTop: 20, fontSize: 12, fontWeight: "bold" },
});

interface ReportPdfProps {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  summary?: string;
}

function ReportPdf({ title, headers, rows, summary }: ReportPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.header}>
          {headers.map((h) => (
            <Text key={h} style={styles.cell}>{h}</Text>
          ))}
        </View>
        {rows.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((cell, j) => (
              <Text key={j} style={styles.cell}>{String(cell)}</Text>
            ))}
          </View>
        ))}
        {summary && <Text style={styles.summary}>{summary}</Text>}
      </Page>
    </Document>
  );
}

export async function exportToPdf(
  filename: string,
  title: string,
  headers: string[],
  rows: (string | number)[][],
  summary?: string
) {
  const blob = await pdf(
    <ReportPdf title={title} headers={headers} rows={rows} summary={summary} />
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
