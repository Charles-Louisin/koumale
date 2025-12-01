"use client";

import React, { useState } from "react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Bonjour ! Je suis l'assistant VendTout. Comment puis-je vous aider aujourd'hui ?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input
    };
    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simuler une réponse de l'IA (dans une vraie application, ce serait un appel API)
    setTimeout(() => {
      const aiResponses: Record<string, string> = {
        "bonjour": "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
        "comment": "Je peux vous aider à trouver des produits, vous renseigner sur les vendeurs ou vous guider dans votre navigation sur VendTout.",
        "produit": "Nous avons une large gamme de produits dans différentes catégories. Que recherchez-vous spécifiquement ?",
        "vendeur": "Vous pouvez consulter tous nos vendeurs vérifiés dans la section 'Boutiques'. Cherchez-vous un type de vendeur en particulier ?",
        "prix": "Les prix varient selon les produits et les vendeurs. Vous pouvez utiliser les filtres de prix sur la page des produits pour trouver ce qui correspond à votre budget.",
        "livraison": "La livraison dépend du vendeur. Chaque vendeur précise ses conditions de livraison sur sa page boutique.",
        "paiement": "VendTout accepte plusieurs méthodes de paiement, notamment les cartes bancaires, PayPal et les virements bancaires.",
        "inscription": "Pour vous inscrire, cliquez sur 'Inscription' en haut à droite de la page. Vous pouvez créer un compte client ou vendeur.",
        "contact": "Vous pouvez contacter directement les vendeurs via les informations sur leur page boutique, ou nous contacter à support@vendtout.com pour toute question générale."
      };

      // Trouver une réponse appropriée basée sur des mots-clés
      const userInput = input.toLowerCase();
      let response = "Je ne suis pas sûr de comprendre votre question. Pouvez-vous préciser ce que vous recherchez ?";
      
      for (const [keyword, reply] of Object.entries(aiResponses)) {
        if (userInput.includes(keyword)) {
          response = reply;
          break;
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
      {/* Bouton de chat flottant */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 rounded-full h-14 w-14 p-0 shadow-lg flex items-center justify-center bg-primary text-white"
        aria-label="Ouvrir le chat"
      >
        {isOpen ? "×" : "?"}
      </button>

      {/* Fenêtre de chat */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 md:w-96 shadow-lg animate-fade-in border rounded-lg bg-white">
          <div className="bg-primary text-white rounded-t-lg px-4 py-3 font-semibold">
            Assistant VendTout
          </div>
          <div className="p-0">
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user" ? "bg-primary text-white" : "bg-gray-100"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100">
                    ...
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="p-2 border-t">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Posez votre question..."
                className="flex-1 rounded-md border border-black/20 px-3 py-2 text-sm"
              />
              <button type="submit" className="rounded-md bg-primary px-3 py-2 text-sm text-white hover:opacity-90">
                Envoyer
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
