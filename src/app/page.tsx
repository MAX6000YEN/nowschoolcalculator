'use client';

import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Packer } from 'docx';

// Types
type Formation = {
  id: string;
  name: string;
  duration: string;
};

type TravelZone = {
  id: string;
  name: string;
  description: string;
  pricing: string;
};

// Constants
const FORMATIONS: Formation[] = [
  { id: "cyber-2h", name: "Formation Cybersécurité", duration: "2 heures" },
  { id: "cyber-half", name: "Formation Cybersécurité", duration: "½ journée" },
  { id: "m365", name: "Formation aux Outils Collaboratifs M365", duration: "1 journée" },
  { id: "ai-half", name: "Formation IA", duration: "½ journée" },
  { id: "ai-full", name: "Formation IA", duration: "1 journée" },
];

const TRAVEL_ZONES: TravelZone[] = [
  {
    id: "local",
    name: "Local",
    description: "Demi-journée possible, pas de frais de déplacement, jusqu'à 1h de trajet maximum",
    pricing: "0"
  },
  {
    id: "regional",
    name: "Régional",
    description: "Demi-journée possible, 180 € HT / jour, de 1h à 2h30 de trajet maximum (sauf Paris)",
    pricing: "180"
  },
  {
    id: "distant",
    name: "Distante",
    description: "Minimum une journée complète, tarification spéciale pour plusieurs jours",
    pricing: "300"
  }
];

export default function Home() {
  const [formData, setFormData] = useState({
    formation: "",
    mode: "",
    sessions: "1",
    travelZone: "",
    tjm: "1000",
  });

  const [showExport, setShowExport] = useState(false);
  const [clientName, setClientName] = useState("");

  const calculateTotal = () => {
    if (!formData.formation || !formData.mode || !formData.sessions || (formData.mode === "presentiel" && !formData.travelZone)) {
      return null;
    }

    const selectedFormation = FORMATIONS.find(f => f.id === formData.formation);
    const daysPerSession = selectedFormation?.duration.includes("journée") ? 1 : 0.25;
    const totalDays = Number(formData.sessions) * daysPerSession;
    
    let travelCost = 0;
    if (formData.mode === "presentiel" && formData.travelZone) {
      const zone = TRAVEL_ZONES.find(z => z.id === formData.travelZone);
      if (zone) {
        if (zone.id === "distant") {
          if (totalDays > 1) {
            travelCost = 300 + (220 * (totalDays - 2)) + 300;
          } else {
            travelCost = 300;
          }
        } else {
          travelCost = Number(zone.pricing) * Math.ceil(totalDays);
        }
      }
    }

    const tjm = Number(formData.tjm);
    const totalHT = (tjm * totalDays) + travelCost;

    return {
      formation: selectedFormation?.name + " - " + selectedFormation?.duration,
      mode: formData.mode === "presentiel" ? "Présentiel" : "Distanciel",
      sessions: formData.sessions,
      travelZone: formData.mode === "presentiel" ? TRAVEL_ZONES.find(z => z.id === formData.travelZone)?.name : "N/A",
      travelCost: travelCost,
      tjm: tjm,
      totalHT: totalHT
    };
  };

  const handleExport = async () => {
    if (!total || !clientName) return;

    const { generateDoc } = await import('@/lib/generate-doc');
    const doc = await generateDoc({
      clientName,
      formation: total.formation,
      mode: total.mode,
      sessions: total.sessions,
      travelZone: total.travelZone,
      travelCost: total.travelCost,
      tjm: total.tjm,
      totalHT: total.totalHT,
    });

    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([new Uint8Array(buffer)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Devis_${clientName}_${total.formation.split(" - ")[0].replace(/\s+/g, "_")}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    setShowExport(false);
  };

  const total = calculateTotal();

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center gradient-text mb-8">Calculateur d'offres de formation</h1>
      {/* Section 1: Formation */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-2xl font-bold text-white mb-4">Choix de la formation</h2>
        <RadioGroup
          value={formData.formation}
          onValueChange={(value) => setFormData({ ...formData, formation: value })}
          className="space-y-3"
        >
          {FORMATIONS.map((formation) => (
            <div key={formation.id} className="flex items-center space-x-3 text-white p-2 hover:bg-white/5 rounded-lg">
              <RadioGroupItem value={formation.id} id={formation.id} className="border-white/50" />
              <label htmlFor={formation.id} className="flex-grow cursor-pointer">
                {formation.name} – {formation.duration}
              </label>
            </div>
          ))}
        </RadioGroup>
        <div className="mt-4 p-4 bg-yellow-500/20 rounded-lg text-yellow-200">
          ⚠️ Si la demande ne correspond pas au catalogue, vous devez obligatoirement vous rapprocher du responsable de la formation.
        </div>
        <div className="mt-2 p-4 bg-yellow-500/20 rounded-lg text-yellow-200">
          Une session de formation ne peut pas dépasser 10 apprenants. Au-delà, rapprochez-vous du responsable de la formation.
        </div>
      </div>

      {/* Section 2: Mode */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-2xl font-bold text-white mb-4">Mode de formation</h2>
        <RadioGroup
          value={formData.mode}
          onValueChange={(value) => setFormData({ ...formData, mode: value })}
          className="space-y-3"
        >
          <div className="flex items-center space-x-3 text-white p-2 hover:bg-white/5 rounded-lg">
            <RadioGroupItem value="presentiel" id="presentiel" className="border-white/50" />
            <label htmlFor="presentiel" className="flex-grow cursor-pointer">Présentiel</label>
          </div>
          <div className="flex items-center space-x-3 text-white p-2 hover:bg-white/5 rounded-lg">
            <RadioGroupItem value="distanciel" id="distanciel" className="border-white/50" />
            <label htmlFor="distanciel" className="flex-grow cursor-pointer">Distanciel</label>
          </div>
        </RadioGroup>
        <p className="text-white/80 italic">
          Nous préconisons fortement une formation en présentiel, car elle améliore considérablement l&apos;expérience et les résultats des apprenants.
        </p>
      </div>

      {/* Section 3: Sessions */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-2xl font-bold text-white mb-4">Nombre de sessions</h2>
        <Input
          type="number"
          min="1"
          value={formData.sessions}
          onChange={(e) => setFormData({ ...formData, sessions: e.target.value })}
          className="glass-input text-white"
        />
        <p className="text-white/80 italic">
          Toutes les formations comprennent ½ journée de préparation obligatoire.
        </p>
      </div>

      {/* Section 4: Travel Zone (Conditional) */}
      {formData.mode === "presentiel" && (
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4">Forfait déplacement</h2>
          <RadioGroup
            value={formData.travelZone}
            onValueChange={(value) => setFormData({ ...formData, travelZone: value })}
          className="space-y-3"
        >
            {TRAVEL_ZONES.map((zone) => (
              <div key={zone.id} className="flex items-center space-x-3 text-white p-2 hover:bg-white/5 rounded-lg">
                <RadioGroupItem value={zone.id} id={zone.id} className="border-white/50" />
                <label htmlFor={zone.id} className="flex flex-col flex-grow cursor-pointer">
                  <span className="font-bold">{zone.name}</span>
                  <span className="text-sm text-white/80">{zone.description}</span>
                </label>
              </div>
            ))}
          </RadioGroup>
          <div className="mt-4 text-white/80">
            <p>Le point de départ est toujours Lyon.</p>
            <p>Les forfaits couvrent le temps de déplacement, l'hébergement et les repas.</p>
          </div>
        </div>
      )}

      {/* Section 5: TJM */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-2xl font-bold text-white mb-4">TJM (€ HT/jour)</h2>
        <Input
          type="number"
          min="1000"
          value={formData.tjm}
          onChange={(e) => setFormData({ ...formData, tjm: e.target.value })}
          className="glass-input text-white"
        />
        {Number(formData.tjm) < 1000 && (
          <p className="text-red-400">Le TJM minimum est de 1000 € HT.</p>
        )}
      </div>

      {/* Section 6: Calculate */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-2xl font-bold mb-4 text-white">Récapitulatif</h3>
        {!formData.formation ? (
          <p className="text-yellow-200">Vous devez choisir une formation</p>
        ) : !formData.mode ? (
          <p className="text-yellow-200">Vous devez choisir un mode de formation</p>
        ) : formData.mode === "presentiel" && !formData.travelZone ? (
          <p className="text-yellow-200">Vous devez choisir un forfait de déplacement</p>
        ) : total && (
          <div className="space-y-4 text-white">
            <div className="space-y-2">
              <p><strong>Formation :</strong> {total.formation}</p>
              <p><strong>Mode :</strong> {total.mode}</p>
              <p><strong>Nombre de sessions :</strong> {total.sessions}</p>
              {total.mode === "Présentiel" && (
                <>
                  <p><strong>Zone de déplacement :</strong> {total.travelZone}</p>
                  <div className="mt-2 p-4 bg-white/5 rounded-lg">
                    <p className="font-bold mb-2">Détail des frais de déplacement :</p>
                    {total.travelZone === "Local" && (
                      <p>Pas de frais de déplacement pour cette zone.</p>
                    )}
                    {total.travelZone === "Régional" && (
                      <p>Frais de déplacement : {total.travelCost} € HT ({Math.ceil(Number(total.sessions))} jour(s) × 180 € HT)</p>
                    )}
                    {total.travelZone === "Distante" && (
                      <>
                        <p>Frais de déplacement : {total.travelCost} € HT</p>
                        <p className="text-sm text-white/80 mt-1">
                          {Number(total.sessions) > 1
                            ? `Détail : Premier jour (300 €) + ${Math.max(0, Number(total.sessions) - 2)} jour(s) intermédiaire(s) (${Math.max(0, Number(total.sessions) - 2)} × 220 €) + Dernier jour (300 €)`
                            : "Forfait journée : 300 € HT"}
                        </p>
                      </>
                    )}
                  </div>
                </>
              )}
              <p><strong>TJM appliqué :</strong> {total.tjm} € HT</p>
              <p className="text-xl font-bold mt-4 pt-4 border-t border-white/20">Total HT estimé : {total.totalHT} € HT</p>
            </div>
            <Button
              onClick={() => setShowExport(true)}
              className="w-full bg-gradient-to-r from-[#FFBE98] to-[#3A2AF5] hover:opacity-90 mt-6"
              disabled={!total || Number(formData.tjm) < 1000}
            >
              Générer le devis
            </Button>
          </div>
        )}
      </div>

      {/* Export Dialog */}
      <Dialog open={showExport} onOpenChange={setShowExport}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="text-white">Exporter le chiffrage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm">Nom du client</label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="glass-input text-white mt-1"
                placeholder="Nom du client"
              />
            </div>
            {clientName && total && (
              <p className="text-white/80">
                Nom de fichier suggéré: Devis_{clientName}_{total.formation.split(" - ")[0].replace(/\s+/g, "_")}.docx
              </p>
            )}
            <Button
              onClick={handleExport}
              className="w-full bg-gradient-to-r from-[#FFBE98] to-[#3A2AF5] hover:opacity-90"
              disabled={!clientName}
            >
              Télécharger le document
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
