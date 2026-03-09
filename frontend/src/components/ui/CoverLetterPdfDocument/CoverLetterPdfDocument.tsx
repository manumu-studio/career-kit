"use client";

/** Professional letter-format PDF for cover letter export. */
import { Document, Page, Text } from "@react-pdf/renderer";
import type { CoverLetterPdfDocumentProps } from "./CoverLetterPdfDocument.types";

const styles = {
  page: { padding: 60, fontSize: 11, fontFamily: "Helvetica" },
  greeting: { marginBottom: 16, fontWeight: "bold" },
  paragraph: { marginBottom: 12, lineHeight: 1.5 },
  signOff: { marginTop: 24, fontWeight: "bold" },
};

export function CoverLetterPdfDocument({
  coverLetter,
}: CoverLetterPdfDocumentProps) {
  return (
    <Document title="Cover Letter">
      <Page size="A4" style={styles.page}>
        <Text style={styles.greeting}>{coverLetter.greeting}</Text>
        <Text style={styles.paragraph}>{coverLetter.opening_paragraph}</Text>
        {coverLetter.body_paragraphs.map((para, i) => (
          <Text key={i} style={styles.paragraph}>
            {para}
          </Text>
        ))}
        <Text style={styles.paragraph}>{coverLetter.closing_paragraph}</Text>
        <Text style={styles.signOff}>{coverLetter.sign_off}</Text>
      </Page>
    </Document>
  );
}
