import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat, convertInchesToTwip } from 'docx';

type ExportData = {
  clientName: string;
  formation: string;
  mode: string;
  sessions: string;
  travelZone?: string;
  travelCost?: number;
  tjm: number;
  totalHT: number;
  totalDays: number;
  tva: number;
  totalTTC: number;
};

export const generateDoc = async (data: ExportData): Promise<Document> => {
  const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} €`;
  const currentDate = new Date().toLocaleDateString('fr-FR');

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: [
          // En-tête
          new Paragraph({
            text: "DEVIS FORMATION",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Date : ", bold: true }),
              new TextRun({ text: currentDate }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Client : ", bold: true }),
              new TextRun({ text: data.clientName }),
            ],
            spacing: { after: 400 },
          }),

          // Détails de la formation
          new Paragraph({
            text: "DÉTAILS DE LA FORMATION",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Formation : ", bold: true }),
              new TextRun({ text: data.formation + "\n\n" }),
              new TextRun({ text: "Mode : ", bold: true }),
              new TextRun({ text: data.mode + "\n\n" }),
              new TextRun({ text: "Nombre de sessions : ", bold: true }),
              new TextRun({ text: data.sessions + "\n\n" }),
              new TextRun({ text: "Nombre de jours facturés : ", bold: true }),
              new TextRun({ text: `${data.totalDays} ${data.totalDays <= 1 ? "jour" : "jours"}\n\n` }),
              new TextRun({ text: "TJM : ", bold: true }),
              new TextRun({ text: formatCurrency(data.tjm) + " HT\n\n" }),
            ],
          }),

          // Frais de déplacement (si présentiel)
          ...(data.mode === "Présentiel" ? [
            new Paragraph({
              text: "FRAIS DE DÉPLACEMENT",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Zone de déplacement : ", bold: true }),
                new TextRun({ text: data.travelZone + "\n\n" }),
                new TextRun({ text: "Montant : ", bold: true }),
                new TextRun({ text: formatCurrency(data.travelCost || 0) + " HT\n" }),
              ],
            }),
          ] : []),

          // Conditions
          new Paragraph({
            text: "CONDITIONS",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            bullet: {
              level: 0,
            },
            children: [
              new TextRun("Toutes les formations comprennent ½ journée de préparation obligatoire"),
            ],
          }),
          new Paragraph({
            bullet: {
              level: 0,
            },
            children: [
              new TextRun("Une session de formation ne peut pas dépasser 10 apprenants"),
            ],
          }),
          ...(data.mode === "Présentiel" ? [
            new Paragraph({
              bullet: {
                level: 0,
              },
              children: [
                new TextRun("Le point de départ est toujours Lyon"),
              ],
            }),
            new Paragraph({
              bullet: {
                level: 0,
              },
              children: [
                new TextRun("Les forfaits couvrent le temps de déplacement, l'hébergement et les repas"),
              ],
              spacing: { after: 400 },
            }),
          ] : []),

          // Récapitulatif financier
          new Paragraph({
            text: "RÉCAPITULATIF FINANCIER",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Total HT : ", bold: true }),
              new TextRun({ text: formatCurrency(data.totalHT) + " HT\n\n" }),
              new TextRun({ text: "TVA (20%) : ", bold: true }),
              new TextRun({ text: formatCurrency(data.tva) + "\n\n" }),
              new TextRun({ text: "Total TTC : ", bold: true, size: 28 }),
              new TextRun({ text: formatCurrency(data.totalTTC) + " TTC", size: 28 }),
            ],
            spacing: { before: 200 },
          }),

          // Pied de page
          new Paragraph({
            text: "NowBrains - 2025",
            alignment: AlignmentType.CENTER,
            spacing: { before: 800 },
          }),
        ],
      },
    ],
  });

  return doc;
};