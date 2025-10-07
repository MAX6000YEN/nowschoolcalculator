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
    description: "Minimum une journée complète, 300 € HT premier et dernier jour, 220 € HT par jour intermédiaire",
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
    const isHalfDay = selectedFormation?.duration.includes("½");
    let totalDays;

    if (formData.mode === "presentiel" && formData.travelZone === "distant") {
      // Pour le forfait distant, une demi-journée compte comme une journée complète
      if (isHalfDay) {
        // Pour les sessions de demi-journée en distant :
        // 1-2 sessions = 1 jour, 3-4 sessions = 2 jours, etc.
        totalDays = Math.ceil(Number(formData.sessions) / 2);
      } else {
        // Pour les sessions d'une journée, pas de changement
        totalDays = Number(formData.sessions);
      }
    } else {
      // Pour tous les autres cas
      totalDays = Number(formData.sessions) * (isHalfDay ? 0.5 : 1);
    }
    
    let travelCost = 0;
    if (formData.mode === "presentiel" && formData.travelZone) {
      const zone = TRAVEL_ZONES.find(z => z.id === formData.travelZone);
      if (zone) {
        if (zone.id === "distant") {
          if (totalDays > 1) {
            // Pour le forfait distant : 300€ premier jour + 220€ par jour intermédiaire + 300€ dernier jour
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
    const tva = totalHT * 0.20;
    const totalTTC = totalHT + tva;

    return {
      formation: selectedFormation?.name + " - " + selectedFormation?.duration,
      mode: formData.mode === "presentiel" ? "Présentiel" : "Distanciel",
      sessions: formData.sessions,
      travelZone: formData.mode === "presentiel" ? TRAVEL_ZONES.find(z => z.id === formData.travelZone)?.name : "N/A",
      travelCost: travelCost,
      tjm: tjm,
      totalHT: totalHT,
      totalDays: totalDays,
      tva: tva,
      totalTTC: totalTTC
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
      <h1 className="text-4xl font-bold text-center gradient-text mb-8">Calculateur d&apos;offres de formation</h1>
      {/* Section 1: Formation */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-2xl gradient-text mb-4">CHOIX DE LA FORMATION</h2>
        <RadioGroup
          value={formData.formation}
          onValueChange={(value) => setFormData({ ...formData, formation: value })}
          className="space-y-3"
        >
          {FORMATIONS.map((formation) => (
            <div key={formation.id} className="flex items-center space-x-3 text-gray-900 p-2 hover:bg-gray-100 rounded-lg">
              <RadioGroupItem value={formation.id} id={formation.id} className="border-gray-400 text-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
              <label htmlFor={formation.id} className="flex-grow cursor-pointer">
                {formation.name} – {formation.duration}
              </label>
            </div>
          ))}
        </RadioGroup>
        <div className="mt-4 p-4 bg-amber-100 rounded-lg text-amber-600">
          ⚠️ Si la demande ne correspond pas au catalogue, vous devez obligatoirement vous rapprocher du responsable de la formation.
        </div>
        <div className="mt-2 p-4 bg-amber-100 rounded-lg text-amber-600">
          Une session de formation ne peut pas dépasser 10 apprenants. Au-delà, rapprochez-vous du responsable de la formation.
        </div>
      </div>

      {/* Section 2: Mode */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-2xl gradient-text mb-4">MODE DE FORMATION</h2>
        <RadioGroup
          value={formData.mode}
          onValueChange={(value) => setFormData({ ...formData, mode: value })}
          className="space-y-3"
        >
          <div className="flex items-center space-x-3 text-gray-900 p-2 hover:bg-gray-100 rounded-lg">
            <RadioGroupItem value="presentiel" id="presentiel" className="border-gray-400 text-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
            <label htmlFor="presentiel" className="flex-grow cursor-pointer">Présentiel</label>
          </div>
          <div className="flex items-center space-x-3 text-gray-900 p-2 hover:bg-gray-100 rounded-lg">
            <RadioGroupItem value="distanciel" id="distanciel" className="border-gray-400 text-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
            <label htmlFor="distanciel" className="flex-grow cursor-pointer">Distanciel</label>
          </div>
        </RadioGroup>
        <p className="text-gray-600 italic">
          Nous préconisons fortement une formation en présentiel, car elle améliore considérablement l&apos;expérience et les résultats des apprenants.
        </p>
      </div>

      {/* Section 3: Sessions */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-2xl gradient-text mb-4">NOMBRE DE SESSIONS</h2>
        <Input
          type="number"
          min="1"
          value={formData.sessions}
          onChange={(e) => setFormData({ ...formData, sessions: e.target.value })}
          placeholder="Nombre de sessions"
          className="glass-input"
        />
        <p className="text-gray-600 italic">
          Toutes les formations comprennent ½ journée de préparation obligatoire.
        </p>
      </div>

      {/* Section 4: Travel Zone (Conditional) */}
      {formData.mode === "presentiel" && (
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-2xl gradient-text mb-4">FORFAIT DÉPLACEMENT</h2>
          <RadioGroup
            value={formData.travelZone}
            onValueChange={(value) => setFormData({ ...formData, travelZone: value })}
            className="space-y-3"
          >
            {TRAVEL_ZONES.map((zone) => (
              <div key={zone.id} className="flex items-center space-x-3 text-gray-900 p-2 hover:bg-gray-100 rounded-lg">
                <RadioGroupItem value={zone.id} id={zone.id} className="border-gray-400 text-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                <label htmlFor={zone.id} className="flex flex-col flex-grow cursor-pointer">
                  <span className="font-bold">{zone.name}</span>
                  <span className="text-sm text-gray-600">{zone.description}</span>
                </label>
              </div>
            ))}
          </RadioGroup>
          <div className="mt-4 text-gray-600">
            <p>Le point de départ est toujours Lyon.</p>
            <p>Les forfaits couvrent le temps de déplacement, l&apos;hébergement et les repas.</p>
          </div>
        </div>
      )}

      {/* Section 5: TJM */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-2xl gradient-text mb-4">TJM (€ HT/JOUR)</h2>
        <Input
            type="number"
            min="1000"
            value={formData.tjm}
            onChange={(e) => setFormData({ ...formData, tjm: e.target.value })}
            placeholder="Entrez votre TJM"
            className="glass-input"
        />
        {Number(formData.tjm) < 1000 && (
          <p className="warning-text">Le TJM minimum est de 1000 € HT.</p>
        )}
      </div>

      {/* Section 6: Calculate */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-2xl gradient-text mb-4">RÉCAPITULATIF</h2>
        {!formData.formation ? (
          <p className="warning-text">Vous devez choisir une formation</p>
        ) : !formData.mode ? (
          <p className="warning-text">Vous devez choisir un mode de formation</p>
        ) : formData.mode === "presentiel" && !formData.travelZone ? (
          <p className="warning-text">Vous devez choisir un forfait de déplacement</p>
        ) : total && (
          <>
            <div className="space-y-4 text-gray-900">
              <div className="flex justify-between items-center">
                <span>Formation :</span>
                <span className="font-bold">{total.formation}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Mode :</span>
                <span className="font-bold">{total.mode}</span>
              </div>
              {total.mode === "Présentiel" && (
                <div className="flex justify-between items-center">
                  <span>Zone de déplacement :</span>
                  <span className="font-bold">{total.travelZone}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>Nombre de sessions :</span>
                <span className="font-bold">{total.sessions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Nombre de jours facturés :</span>
                <span className="font-bold">{total.totalDays} {total.totalDays <= 1 ? "jour" : "jours"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>TJM :</span>
                <span className="font-bold">{total.tjm} € HT</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Frais de déplacement :</span>
                <span className="font-bold">{total.travelCost} € HT</span>
              </div>
              {formData.travelZone !== "local" && (
                <div className="text-sm text-gray-500 mt-1">
                  {formData.travelZone === "regional" ? (
                    `180 € x ${total.totalDays} ${total.totalDays <= 1 ? "jour" : "jours"} = ${total.travelCost} €`
                  ) : (
                    total.totalDays <= 1 ? 
                    "300 € (forfait journée)" :
                    `300 € (J1) + ${total.totalDays > 2 ? `220 € x ${total.totalDays - 2} j. + ` : ""}300 € (dernier J) = ${total.travelCost} €`
                  )}
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>Total HT :</span>
                <span className="font-bold">{total.totalHT} € HT</span>
              </div>
              <div className="flex justify-between items-center">
                <span>TVA (20%) :</span>
                <span className="font-bold">{total.tva} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total TTC :</span>
                <span className="font-bold">{total.totalTTC} € TTC</span>
              </div>
            </div>
            <Button
              onClick={() => setShowExport(true)}
              className="w-full bg-gradient-to-r from-[#FFBE98] to-[#3A2AF5] hover:opacity-90 mt-6 text-white"
              disabled={!total || Number(formData.tjm) < 1000}
            >
              Générer le devis
            </Button>
          </>
        )}
      </div>

      {/* Export Dialog */}
      <Dialog open={showExport} onOpenChange={setShowExport}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="gradient-text">EXPORTER LE CHIFFRAGE</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-gray-900 text-sm">Nom du client</label>
              <Input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="glass-input mt-1"
                placeholder="Nom du client"
              />
            </div>
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
