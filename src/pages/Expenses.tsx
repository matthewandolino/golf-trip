import { useState } from 'react';
import {
  Receipt, Plus, X, Utensils, Beer, Car, Home, Flag, Package,
  TrendingUp, TrendingDown, ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';
import BackgroundPage from '../components/BackgroundPage';
import { useStore } from '../store/useStore';
import { BACKGROUND_IMAGES, PLAYERS } from '../lib/constants';
import { isValidAmount, sanitize } from '../lib/sanitize';
import type { Expense } from '../lib/types';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const CATEGORIES: { value: Expense['category']; label: string; icon: typeof Receipt }[] = [
  { value: 'greens-fees', label: 'Greens Fees', icon: Flag },
  { value: 'meals', label: 'Meals', icon: Utensils },
  { value: 'drinks', label: 'Drinks', icon: Beer },
  { value: 'lodging', label: 'Lodging', icon: Home },
  { value: 'transport', label: 'Transport', icon: Car },
  { value: 'other', label: 'Other', icon: Package },
];

function getCategoryIcon(cat: Expense['category']) {
  const found = CATEGORIES.find((c) => c.value === cat);
  return found ? found.icon : Package;
}

// ── New Expense Form ────────────────────────────────────────────────
function NewExpenseForm({ onClose, quickPayer }: { onClose: () => void; quickPayer?: string }) {
  const addExpense = useStore((s) => s.addExpense);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(quickPayer ?? '1');
  const [splitBetween, setSplitBetween] = useState<string[]>(PLAYERS.map((p) => p.id));
  const [category, setCategory] = useState<Expense['category']>('meals');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [error, setError] = useState('');

  const toggleSplit = (id: string) => {
    setSplitBetween((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const submit = () => {
    const amt = parseFloat(amount);
    if (!desc.trim()) { setError('Enter a description'); return; }
    if (!amount || isNaN(amt) || !isValidAmount(amt)) {
      setError('Enter a valid positive amount (max 2 decimals)');
      return;
    }
    if (splitBetween.length === 0) { setError('Select at least 1 person to split with'); return; }
    setError('');

    const expense: Expense = {
      id: uid(),
      description: sanitize(desc.trim()),
      amount: amt,
      paidBy,
      splitBetween,
      date,
      category,
    };
    addExpense(expense);
    onClose();
  };

  return (
    <div className="glass rounded-2xl p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Add Expense</h3>
        <button onClick={onClose} className="p-1"><X size={20} /></button>
      </div>

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      <label className="block text-sm text-white/70 mb-1">Description</label>
      <input
        type="text"
        maxLength={100}
        placeholder="e.g. Dinner at the clubhouse"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white mb-3 text-sm"
      />

      <div className="flex gap-3 mb-3">
        <div className="flex-1">
          <label className="block text-sm text-white/70 mb-1">Amount ($)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-white/70 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white text-sm"
          />
        </div>
      </div>

      <label className="block text-sm text-white/70 mb-1">Category</label>
      <div className="flex flex-wrap gap-2 mb-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              category === cat.value
                ? 'bg-[#c9a84c] text-[#1a3c2a]'
                : 'bg-white/10 text-white/50'
            }`}
          >
            <cat.icon size={12} /> {cat.label}
          </button>
        ))}
      </div>

      <label className="block text-sm text-white/70 mb-1">Paid by</label>
      <select
        value={paidBy}
        onChange={(e) => setPaidBy(e.target.value)}
        className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white mb-3 text-sm"
      >
        {PLAYERS.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <label className="block text-sm text-white/70 mb-2">Split between</label>
      <div className="flex flex-wrap gap-2 mb-4">
        {PLAYERS.map((p) => (
          <button
            key={p.id}
            onClick={() => toggleSplit(p.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              splitBetween.includes(p.id)
                ? 'bg-[#c9a84c] text-[#1a3c2a]'
                : 'bg-white/10 text-white/50'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <button
        onClick={submit}
        className="w-full py-2.5 rounded-xl bg-[#c9a84c] text-[#1a3c2a] font-semibold text-sm"
      >
        Add Expense
      </button>
    </div>
  );
}

// ── Expense List Item ───────────────────────────────────────────────
function ExpenseItem({ expense }: { expense: Expense }) {
  const deleteExpense = useStore((s) => s.deleteExpense);
  const payer = PLAYERS.find((p) => p.id === expense.paidBy);
  const Icon = getCategoryIcon(expense.category);

  return (
    <div className="glass rounded-xl p-3 mb-2 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-[#c9a84c]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium truncate">{expense.description}</h4>
          <span className="text-sm font-bold text-[#c9a84c] shrink-0 ml-2">${expense.amount.toFixed(2)}</span>
        </div>
        <p className="text-xs text-white/50">
          {payer?.name} paid &middot; split {expense.splitBetween.length} ways &middot;{' '}
          {format(new Date(expense.date + 'T00:00:00'), 'MMM d')}
        </p>
      </div>
      <button onClick={() => deleteExpense(expense.id)} className="text-white/30 hover:text-red-400 shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

// ── Settlement (Minimum Transactions) ───────────────────────────────
function computeSettlement(expenses: Expense[]): { from: string; to: string; amount: number }[] {
  const balances = new Map<string, number>();
  for (const exp of expenses) {
    const share = exp.amount / exp.splitBetween.length;
    // Payer is owed by the group
    balances.set(exp.paidBy, (balances.get(exp.paidBy) ?? 0) + exp.amount);
    // Each participant owes their share
    for (const pid of exp.splitBetween) {
      balances.set(pid, (balances.get(pid) ?? 0) - share);
    }
  }

  // Separate into debtors and creditors
  const debtors: { id: string; amount: number }[] = [];
  const creditors: { id: string; amount: number }[] = [];
  for (const [id, bal] of balances) {
    if (bal < -0.005) debtors.push({ id, amount: -bal });
    else if (bal > 0.005) creditors.push({ id, amount: bal });
  }

  // Greedy settlement
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions: { from: string; to: string; amount: number }[] = [];
  let di = 0;
  let ci = 0;
  while (di < debtors.length && ci < creditors.length) {
    const settled = Math.min(debtors[di].amount, creditors[ci].amount);
    if (settled > 0.005) {
      transactions.push({
        from: debtors[di].id,
        to: creditors[ci].id,
        amount: Math.round(settled * 100) / 100,
      });
    }
    debtors[di].amount -= settled;
    creditors[ci].amount -= settled;
    if (debtors[di].amount < 0.005) di++;
    if (creditors[ci].amount < 0.005) ci++;
  }

  return transactions;
}

function SettlementView() {
  const expenses = useStore((s) => s.expenses);
  if (expenses.length === 0) return null;

  const transactions = computeSettlement(expenses);
  if (transactions.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-4 mb-4">
      <h3 className="text-base font-semibold mb-3">Who Owes Who</h3>
      <div className="space-y-2">
        {transactions.map((t, i) => {
          const from = PLAYERS.find((p) => p.id === t.from);
          const to = PLAYERS.find((p) => p.id === t.to);
          return (
            <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-red-400 font-medium">{from?.name}</span>
                <ArrowRight size={14} className="text-white/30" />
                <span className="text-green-400 font-medium">{to?.name}</span>
              </div>
              <span className="text-sm font-bold text-[#c9a84c]">${t.amount.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Per-Person Balance ──────────────────────────────────────────────
function BalanceSummary() {
  const expenses = useStore((s) => s.expenses);
  if (expenses.length === 0) return null;

  const paid = new Map<string, number>();
  const owed = new Map<string, number>();
  for (const exp of expenses) {
    paid.set(exp.paidBy, (paid.get(exp.paidBy) ?? 0) + exp.amount);
    const share = exp.amount / exp.splitBetween.length;
    for (const pid of exp.splitBetween) {
      owed.set(pid, (owed.get(pid) ?? 0) + share);
    }
  }

  return (
    <div className="glass rounded-2xl p-4 mb-4">
      <h3 className="text-base font-semibold mb-3">Balances</h3>
      <div className="space-y-2">
        {PLAYERS.map((p) => {
          const paidAmt = paid.get(p.id) ?? 0;
          const owedAmt = owed.get(p.id) ?? 0;
          const net = paidAmt - owedAmt;
          if (Math.abs(paidAmt) < 0.005 && Math.abs(owedAmt) < 0.005) return null;
          return (
            <div key={p.id} className="flex items-center justify-between text-sm">
              <span className="text-white/80">{p.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40">paid ${paidAmt.toFixed(2)}</span>
                <span className={`font-bold flex items-center gap-1 ${
                  net >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {net >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {net >= 0 ? '+' : ''}${net.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Expenses Page ──────────────────────────────────────────────
export default function Expenses() {
  const expenses = useStore((s) => s.expenses);
  const activePlayerId = useStore((s) => s.activePlayerId);
  const [showForm, setShowForm] = useState(false);
  const [quickAdd, setQuickAdd] = useState(false);

  const total = expenses.reduce((a, e) => a + e.amount, 0);

  return (
    <BackgroundPage backgroundImage={BACKGROUND_IMAGES.expenses}>
      <div className="max-w-md mx-auto px-4 pt-6 pb-28">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Expenses</h2>
            {expenses.length > 0 && (
              <p className="text-sm text-white/50">Total: ${total.toFixed(2)}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setQuickAdd(true); setShowForm(true); }}
              className="text-xs bg-white/10 text-white/70 px-3 py-2 rounded-xl font-medium"
            >
              I Paid
            </button>
            <button
              onClick={() => { setQuickAdd(false); setShowForm(!showForm); }}
              className="flex items-center gap-1.5 text-sm bg-[#c9a84c] text-[#1a3c2a] px-3.5 py-2 rounded-xl font-semibold"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        {showForm && (
          <NewExpenseForm
            onClose={() => setShowForm(false)}
            quickPayer={quickAdd ? activePlayerId : undefined}
          />
        )}

        <SettlementView />
        <BalanceSummary />

        {expenses.length === 0 && !showForm && (
          <div className="glass rounded-2xl p-8 text-center">
            <Receipt size={40} className="mx-auto mb-3 text-white/30" />
            <p className="text-white/50 text-sm">No expenses yet. Add your first expense to start tracking.</p>
          </div>
        )}

        {[...expenses].reverse().map((exp) => (
          <ExpenseItem key={exp.id} expense={exp} />
        ))}
      </div>
    </BackgroundPage>
  );
}
