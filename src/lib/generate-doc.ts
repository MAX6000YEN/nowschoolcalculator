import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

type ExportData = {
  clientName: string;
  formation: string;
  mode: string;
  sessions: string;
  travelZone?: string;
  travelCost?: number;
  tjm: number;
  totalHT: number;
};

export const generateDoc = async (data: ExportData): Promise<Document> => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "Devis Formation NowBrains",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Client : ${data.clientName}`,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Détails de la formation", bold: true }),
              new TextRun({ text: "\n\n", size: 24 }),
              new TextRun({ text: `Formation : ${data.formation}\n` }),
              new TextRun({ text: `Mode : ${data.mode}\n` }),
              new TextRun({ text: `Nombre de sessions : ${data.sessions}\n` }),
              ...(data.mode === "Présentiel" ? [
                new TextRun({ text: `Zone de déplacement : ${data.travelZone}\n` }),
                new TextRun({ text: `Frais de déplacement : ${data.travelCost} € HT\n` }),
              ] : []),
              new TextRun({ text: `TJM appliqué : ${data.tjm} € HT\n` }),
            ],
          }),
          new Paragraph({
            text: "\nConditions",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Toutes les formations comprennent ½ journée de préparation obligatoire.\n" }),
              new TextRun({ text: "• Une session de formation ne peut pas dépasser 10 apprenants.\n" }),
              ...(data.mode === "Présentiel" ? [
                new TextRun({ text: "• Le point de départ est toujours Lyon.\n" }),
                new TextRun({ text: "• Les forfaits couvrent le temps de déplacement, l'hébergement et les repas.\n" }),
              ] : []),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `\nTotal HT : ${data.totalHT} € HT`,
                bold: true,
                size: 28,
              }),
            ],
            spacing: { before: 400 },
          }),
        ],
      },
    ],
  });

  return doc;
};