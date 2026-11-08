import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, FolderPlus, Layers } from 'lucide-react';
import { Deck, Subject } from '../types';

interface DeckManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
  decks: Deck[];
  cardCounts: Record<string, number>;
  onCreateDeck: (name: string, description?: string) => void;
  onRenameDeck: (deckId: string, newName: string) => void;
  onDeleteDeck: (deckId: string) => void;
}

export const DeckManagerModal: React.FC<DeckManagerModalProps> = ({
  isOpen,
  onClose,
  subject,
  decks,
  cardCounts,
  onCreateDeck,
  onRenameDeck,
  onDeleteDeck,
}) => {
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  if (!isOpen) return null;

  const subjectDecks = decks.filter((d) => d.subject === subject);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    onCreateDeck(newDeckName.trim(), newDeckDesc.trim() || undefined);
    setNewDeckName('');
    setNewDeckDesc('');
  };

  const startRename = (deck: Deck) => {
    setEditingDeckId(deck.id);
    setEditingName(deck.name);
  };

  const handleSaveRename = (deckId: string) => {
    if (editingName.trim()) {
      onRenameDeck(deckId, editingName.trim());
    }
    setEditingDeckId(null);
  };

  const subjectLabel =
    subject === 'chinese'
      ? '🇨🇳 Chinese'
      : subject === 'english'
      ? '🇬🇧 English'
      : '➗ Mathematics';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Manage Decks · {subjectLabel}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create Deck Form */}
        <form onSubmit={handleCreate} className="space-y-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <FolderPlus className="w-3.5 h-3.5 text-indigo-500" />
            <span>Create New Deck</span>
          </div>
          <input
            type="text"
            required
            placeholder="Deck name (e.g. Chapter 4 Vocab)"
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newDeckDesc}
            onChange={(e) => setNewDeckDesc(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Deck</span>
          </button>
        </form>

        {/* Existing Decks List */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Existing Decks ({subjectDecks.length})
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {subjectDecks.map((deck) => {
              const count = cardCounts[deck.id] || 0;
              const isEditing = editingDeckId === deck.id;

              return (
                <div
                  key={deck.id}
                  className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 px-2 py-1 text-xs rounded border border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(deck.id)}
                          className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {deck.name}
                        </div>
                        {deck.description && (
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {deck.description}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1">
                          {count} {count === 1 ? 'card' : 'cards'}
                        </div>
                      </div>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startRename(deck)}
                        title="Rename deck"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete deck "${deck.name}"? The cards inside will remain in the subject.`
                            )
                          ) {
                            onDeleteDeck(deck.id);
                          }
                        }}
                        title="Delete deck"
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
