"use client";

/** ATS-friendly PDF document for optimized CV export. */
import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { CvPdfDocumentProps } from "./CvPdfDocument.types";

const styles = {
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  heading: { fontSize: 14, marginBottom: 8, fontWeight: "bold" },
  section: { marginBottom: 16 },
  body: { marginBottom: 6, lineHeight: 1.4 },
  changes: { fontSize: 9, color: "#666", marginTop: 4, fontStyle: "italic" as const },
};

export function CvPdfDocument({ optimizationResult }: CvPdfDocumentProps) {
  return (
    <Document title="Optimized CV">
      <Page size="A4" style={styles.page}>
        {optimizationResult.sections.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            <Text style={styles.body}>{section.optimized}</Text>
            {section.changes_made.length > 0 ? (
              <Text style={styles.changes}>
                Changes: {section.changes_made.join("; ")}
              </Text>
            ) : null}
          </View>
        ))}
      </Page>
    </Document>
  );
}
