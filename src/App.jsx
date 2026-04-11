import './index.css';
import ReactDOM from 'react-dom/client';
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wallet, Plus, Minus, ArrowLeft, Calendar, 
  Coffee, Target, CreditCard, X, RotateCcw, Lock, Pencil, Cloud, Trash2, Shield,
  Eye, EyeOff, Settings, Download, Upload, Filter, AlertTriangle, CheckCircle2, Sun, Moon, Globe, ChevronDown, List
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

// --- Конфигурация Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyA7CquLls_m6jf-zFDVVTDeOBgULNv0-HE",
  authDomain: "finance-tracker-by-abdu.firebaseapp.com",
  projectId: "finance-tracker-by-abdu",
  storageBucket: "finance-tracker-by-abdu.firebasestorage.app",
  messagingSenderId: "565509644207",
  appId: "1:565509644207:web:b63da0ff3c8d2aeffc995a",
  measurementId: "G-Y1WCVR66PY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'finance-tracker-by-abdu';

// --- Стили и Темы ---
const styles = `
  :root {
    --c-bg: #f8fafc; --c-card: #ffffff; --c-card-hover: #f1f5f9;
    --c-border: #e2e8f0; --c-text-main: #0f172a; --c-text-sub: #334155;
    --c-text-muted: #64748b; --c-modal: rgba(255, 255, 255, 0.9); --c-shadow: rgba(0, 0, 0, 0.05);
  }
  .dark {
    --c-bg: #0f172a; --c-card: rgba(30, 41, 59, 0.6); --c-card-hover: rgba(30, 41, 59, 0.9);
    --c-border: rgba(255, 255, 255, 0.1); --c-text-main: #ffffff; --c-text-sub: #e2e8f0;
    --c-text-muted: #94a3b8; --c-modal: rgba(2, 6, 23, 0.85); --c-shadow: rgba(0, 0, 0, 0.3);
  }
  body { background-color: var(--c-bg); color: var(--c-text-main); transition: background-color 0.3s ease; }
  .bg-app { background-color: var(--c-bg); }
  .bg-card { background-color: var(--c-card); }
  .border-main { border-color: var(--c-border); }
  .text-main { color: var(--c-text-main); }
  .blur-money { filter: blur(8px); transition: filter 0.3s ease; }
  .unblur-money { filter: blur(0px); transition: filter 0.3s ease; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { background: var(--c-border); border-radius: 10px; }
`;

// --- Словари ---
const DICT = {
  ru: {
    choose_year: "Выберите год", saved_cloud: "Ваши данные сохранены в облаке", open_year: "Открыть год",
    locked: "Заблокировано", back: "Назад", year: "Год", total_income: "Общий доход",
    wallet: "Доступно на месяц (70%)", close_month: "Закрыть месяц (Перевести остатки в Накопления)",
    close_month_confirm: "Закрыть месяц?", close_month_warn: "Все остатки средств будут переведены в ваши Накопления.",
    limit: "Лимит:", remainder: "Остаток:", history: "История", history_short: "История", income_history: "История пополнений", settings: "Настройки",
    theme_light: "Светлая тема", theme_dark: "Темная тема", lang: "Язык (Language)", currency_label: "Валюта",
    export: "Скачать Backup (JSON)", import: "Загрузить Backup",
    goal_title: "Финансовая цель", goal_name: "Название (напр. Машина)", goal_amount: "Сумма цели", goal_save: "Сохранить", goal_add: "Добавить цель",
    add_action: "Добавить", edit: "Изменить", income_word: "доход", expense_word: "расход", subtract_income: "вычет из дохода",
    title: "Что купили?", amount: "Сумма", day: "День", tags: "Тэги", add_tag: "Добавить тэг", desc: "Описание (необязательно)",
    save: "Сохранить", delete: "Удалить", cancel: "Отмена", reset_month: "Сбросить месяц?", reset_warn: "Все транзакции за этот месяц будут удалены.",
    reset_warn_transferred: "Внимание! Остатки за этот месяц уже были перенесены в Накопления. При сбросе месяца эти пополнения также будут удалены, чтобы баланс сошелся. Продолжить?",
    del_warn: "Вы действительно хотите удалить эту запись?", unsaved: "Закрыть без сохранения?", unsaved_warn: "Введенные данные будут утеряны.",
    avail_all: "Доступно (от всех доходов)", spend_from: "Потратить из",
    empty_targets: "Здесь будут крупные покупки", empty_reserve: "Траты на форс-мажоры",
    empty_useless: "Сюда записывай дофамин: энергетики, игры или любые капризы", empty_essential: "Тут всё важное: подписки, зал, здоровье и подарки близким",
    cat_useless: "На кайф", desc_useless: "Бесполезные траты", cat_essential: "Основные", desc_essential: "Реальные нужды",
    cat_savings_targets: "Накопления", desc_savings_targets: "Глобальные цели", cat_savings_reserve: "Резерв", desc_savings_reserve: "Подушка безопасности",
    months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    sort_title: "Сортировка", sort_new: "Сначала новые", sort_old: "Сначала старые", sort_exp: "Сначала дорогие", sort_chp: "Сначала дешевые",
    goal_pace: "При темпе", goal_reach: "Накопишь через", goal_reached: "Цель достигнута!", year_short: "г.", month_short: "мес.",
    year_1: "год", year_2: "года", year_5: "лет", month_1: "месяц", month_2: "месяца", month_5: "месяцев", and: "и"
  },
  en: {
    choose_year: "Choose Year", saved_cloud: "Data secured in cloud", open_year: "Open Year",
    locked: "Locked", back: "Back", year: "Year", total_income: "Total Income",
    wallet: "Monthly Available (70%)", close_month: "Close Month (Move remainder to Savings)",
    close_month_confirm: "Close Month?", close_month_warn: "Remaining funds will be transferred to your Savings.",
    limit: "Limit:", remainder: "Left:", history: "History", history_short: "History", income_history: "Income History", settings: "Settings",
    theme_light: "Light Theme", theme_dark: "Dark Theme", lang: "Language (Язык)", currency_label: "Currency",
    export: "Download Backup (JSON)", import: "Upload Backup",
    goal_title: "Financial Goal", goal_name: "Title (e.g. Car)", goal_amount: "Target Amount", goal_save: "Save", goal_add: "Add Goal",
    add_action: "Add", edit: "Edit", income_word: "income", expense_word: "expense", subtract_income: "income deduction",
    title: "What did you buy?", amount: "Amount", day: "Day", tags: "Tags", add_tag: "Add Tag", desc: "Description (optional)",
    save: "Save", delete: "Delete", cancel: "Cancel", reset_month: "Reset Month?", reset_warn: "All transactions for this month will be deleted.",
    reset_warn_transferred: "Warning! Remainder for this month has already been transferred to Savings. Resetting will also delete these transfers to keep the balance accurate. Continue?",
    del_warn: "Are you sure you want to delete this record?", unsaved: "Close without saving?", unsaved_warn: "Entered data will be lost.",
    avail_all: "Available (from all income)", spend_from: "Spend from",
    empty_targets: "Major purchases will appear here", empty_reserve: "Emergency expenses",
    empty_useless: "Record dopamine here: drinks, games, whims", empty_essential: "Important: subs, gym, health, gifts",
    cat_useless: "Dopamine", desc_useless: "Useless spending", cat_essential: "Essentials", desc_essential: "Real needs",
    cat_savings_targets: "Savings", desc_savings_targets: "Global goals", cat_savings_reserve: "Reserve", desc_savings_reserve: "Emergency fund",
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    sort_title: "Sort by", sort_new: "Newest first", sort_old: "Oldest first", sort_exp: "Expensive first", sort_chp: "Cheapest first",
    goal_pace: "At pace", goal_reach: "Reached in", goal_reached: "Goal reached!", year_short: "y.", month_short: "mo.",
    year_1: "year", year_2: "years", year_5: "years", month_1: "month", month_2: "months", month_5: "months", and: "and"
  },
  uz_latn: {
    choose_year: "Yilni tanlang", saved_cloud: "Ma'lumotlaringiz bulutda saqlanadi", open_year: "Yilni ochish",
    locked: "Bloklangan", back: "Orqaga", year: "Yil", total_income: "Umumiy daromad",
    wallet: "Oy uchun mavjud (70%)", close_month: "Oyni yopish (Qoldiqni Jamg'armaga o'tkazish)",
    close_month_confirm: "Oy yopilsinmi?", close_month_warn: "Barcha qoldiq mablag'lar Jamg'armaga o'tkaziladi.",
    limit: "Limit:", remainder: "Qoldiq:", history: "Tarix", history_short: "Tarix", income_history: "Kirim tarixi", settings: "Sozlamalar",
    theme_light: "Yorug' mavzu", theme_dark: "Qorong'i mavzu", lang: "Til (Language)", currency_label: "Valyuta",
    export: "Backup yuklab olish (JSON)", import: "Backup yuklash",
    goal_title: "Moliyaviy maqsad", goal_name: "Nomi (masalan, Mashina)", goal_amount: "Maqsad summasi", goal_save: "Saqlash", goal_add: "Maqsad qo'shish",
    add_action: "Qo'shish", edit: "Tahrirlash", income_word: "daromad", expense_word: "xarajat", subtract_income: "daromaddan chegirish",
    title: "Nima sotib oldingiz?", amount: "Summa", day: "Kun", tags: "Teglar", add_tag: "Teg qo'shish", desc: "Tavsif (ixtiyoriy)",
    save: "Saqlash", delete: "O'chirish", cancel: "Bekor qilish", reset_month: "Oy tozalanadimi?", reset_warn: "Ushbu oydagi barcha tranzaksiyalar o'chiriladi.",
    reset_warn_transferred: "Diqqat! Ushbu oy qoldiqlari Jamg'armaga o'tkazilgan. Balans to'g'ri bo'lishi uchun oyni tozalaganda bu o'tkazmalar ham o'chiriladi. Davom etasizmi?",
    del_warn: "Haqiqatan ham bu yozuvni o'chirmoqchimisiz?", unsaved: "Saqlamasdan yopilsinmi?", unsaved_warn: "Kiritilgan ma'lumotlar yo'qoladi.",
    avail_all: "Mavjud (barcha daromadlardan)", spend_from: "Sarflash",
    empty_targets: "Bu yerda yirik xaridlar bo'ladi", empty_reserve: "Fors-major xarajatlar",
    empty_useless: "Bu yerda dofamin: energetiklar, o'yinlar yoki injiqliklar", empty_essential: "Muhim xarajatlar: obunalar, zal, sog'liq va sovg'alar",
    cat_useless: "Kayf uchun", desc_useless: "Foydasiz xarajatlar", cat_essential: "Asosiy", desc_essential: "Haqiqiy ehtiyojlar",
    cat_savings_targets: "Jamg'arma", desc_savings_targets: "Global maqsadlar", cat_savings_reserve: "Zaxira", desc_savings_reserve: "Xavfsizlik yostig'i",
    months: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
    sort_title: "Saralash", sort_new: "Oldin yangilari", sort_old: "Oldin eskilari", sort_exp: "Oldin qimmatlari", sort_chp: "Oldin arzonlari",
    goal_pace: "Tezlik:", goal_reach: "Yetishish:", goal_reached: "Maqsadga erishildi!", year_short: "y.", month_short: "oy",
    year_1: "yil", year_2: "yil", year_5: "yil", month_1: "oy", month_2: "oy", month_5: "oy", and: "va"
  },
  uz_cyrl: {
    choose_year: "Йилни танланг", saved_cloud: "Маълумотларингиз булутда сақланади", open_year: "Йилни очиш",
    locked: "Блокланган", back: "Орқага", year: "Йил", total_income: "Умумий даромад",
    wallet: "Ой учун мавжуд (70%)", close_month: "Ойни ёпиш (Қолдиқни Жамғармага ўтказиш)",
    close_month_confirm: "Ой ёпилсинми?", close_month_warn: "Барча қолдиқ маблағлар Жамғармага ўтказилади.",
    limit: "Лимит:", remainder: "Қолдиқ:", history: "Тарих", history_short: "Тарих", income_history: "Кирим тарихи", settings: "Созламалар",
    theme_light: "Ёруғ мавзу", theme_dark: "Қоронғи мавзу", lang: "Тил (Language)", currency_label: "Валюта",
    export: "Backup юклаб олиш (JSON)", import: "Backup юклаш",
    goal_title: "Молиявий мақсад", goal_name: "Номи (масалан, Машина)", goal_amount: "Мақсад суммаси", goal_save: "Сақлаш", goal_add: "Мақсад қўшиш",
    add_action: "Қўшиш", edit: "Таҳрирлаш", income_word: "даромад", expense_word: "харажат", subtract_income: "даромаддан чегириш",
    title: "Нима сотиб олдингиз?", amount: "Сумма", day: "Кун", tags: "Тэглар", add_tag: "Тэг қўшиш", desc: "Тавсиф (ихтиёрий)",
    save: "Сақлаш", delete: "Ўчириш", cancel: "Бекор қилиш", reset_month: "Ой тозаланадими?", reset_warn: "Ушбу ойдаги барча транзакциялар ўчирилади.",
    reset_warn_transferred: "Диққат! Ушбу ой қолдиқлари Жамғармага ўтказилган. Баланс тўғри бўлиши учун ойни тозалаганда бу ўтказмалар ҳам ўчирилади. Давом этасизми?",
    del_warn: "Ҳақиқатан ҳам бу ёзувни ўчирмоқчимисиз?", unsaved: "Сақламасдан ёпилсинми?", unsaved_warn: "Киритилган маълумотлар йўқолади.",
    avail_all: "Мавжуд (барча даромадлардан)", spend_from: "Сарфлаш",
    empty_targets: "Бу ерда йирик харидлар бўлади", empty_reserve: "Форс-мажор харажатлар",
    empty_useless: "Бу ерда дофамин: энергетиклар, ўйинлар ёки инжиқликлар", empty_essential: "Муҳим харажатлар: обуналар, зал, соғлиқ ва совғалар",
    cat_useless: "Кайф учун", desc_useless: "Фойдасиз харажатлар", cat_essential: "Асосий", desc_essential: "Ҳақиқий эҳтиёжлар",
    cat_savings_targets: "Жамғарма", desc_savings_targets: "Глобал мақсадлар", cat_savings_reserve: "Захира", desc_savings_reserve: "Хавфсизлик ёстиғи",
    months: ['Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн', 'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр'],
    sort_title: "Саралаш", sort_new: "Олдин янгилари", sort_old: "Олдин эскилари", sort_exp: "Олдин қимматлари", sort_chp: "Олдин арзонлари",
    goal_pace: "Тезлик:", goal_reach: "Етишиш:", goal_reached: "Мақсадга эришилди!", year_short: "й.", month_short: "ой",
    year_1: "йил", year_2: "йил", year_5: "йил", month_1: "ой", month_2: "ой", month_5: "ой", and: "ва"
  }
};

const CATEGORIES = {
  useless: { id: 'useless', percent: 0.10, color: '#f43f5e', icon: Coffee, emptyKey: 'empty_useless' },
  essential: { id: 'essential', percent: 0.60, color: '#10b981', icon: CreditCard, emptyKey: 'empty_essential' }
};

const GLOBAL_CATEGORIES = {
  savings_targets: { id: 'savings_targets', percent: 0.20, color: '#3b82f6', icon: Target, emptyKey: 'empty_targets' },
  savings_reserve: { id: 'savings_reserve', percent: 0.10, color: '#8b5cf6', icon: Shield, emptyKey: 'empty_reserve' }
};

// --- Кастомный Dropdown ---
const CustomSelect = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center text-sm font-medium text-main bg-app px-4 py-2 rounded-xl border border-main focus:outline-none hover:bg-card-hover transition-colors">
        {selected?.label} <ChevronDown size={14} className="ml-2 opacity-50" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onPointerDown={(e) => { e.stopPropagation(); setOpen(false); }}></div>
          <div className="absolute right-0 mt-2 min-w-[150px] bg-modal backdrop-blur-xl border border-main rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
            {options.map(opt => (
              <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${value === opt.value ? 'bg-blue-500/10 text-blue-500 font-bold' : 'text-main hover:bg-card-hover'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
};

export default function App() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [userSettings, setUserSettings] = useState({ goals: [], theme: 'dark', lang: 'ru', currency: 'UZS' });
  const [loading, setLoading] = useState(true);

  // Навигация и UI-режимы
  const [view, setView] = useState('years');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [isAnon, setIsAnon] = useState(false);

  // Модальные окна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isIncomeHistoryOpen, setIsIncomeHistoryOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isCloseMonthModalOpen, setIsCloseMonthModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [unsavedWarning, setUnsavedWarning] = useState(false);
  const [txToDelete, setTxToDelete] = useState(null);
  
  // Состояние формы
  const [modalMode, setModalMode] = useState('add');
  const [editingTxId, setEditingTxId] = useState(null);
  const [modalType, setModalType] = useState('expense');
  const [modalCategory, setModalCategory] = useState('useless');
  const [formData, setFormData] = useState({ title: '', desc: '', amount: '', tags: [], day: new Date().getDate() });
  const [goalData, setGoalData] = useState({ id: '', name: '', amount: '' });
  
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [filters, setFilters] = useState({
    useless: { sort: 'date_desc', tags: [] },
    essential: { sort: 'date_desc', tags: [] },
    savings_targets: { sort: 'date_desc', tags: [] },
    savings_reserve: { sort: 'date_desc', tags: [] }
  });
  const [activeFilterDropdown, setActiveFilterDropdown] = useState(null);

  // --- Утилиты ---
  const vibrate = () => { if (navigator.vibrate) navigator.vibrate(10); };
  const t = (key) => DICT[userSettings.lang]?.[key] || DICT['ru'][key] || key;
  const monthNames = DICT[userSettings.lang]?.months || DICT['ru'].months;
  
  const formatMoney = (amount) => {
    const rates = { UZS: 1, USD: 100000 / 8.2, RUB: 100000 / 641, KZT: 100000 / 3800 };
    const symbols = { UZS: userSettings.lang === 'en' ? 'UZS' : 'сум', USD: '$', RUB: '₽', KZT: '₸' };
    const converted = amount / (rates[userSettings.currency] || 1);
    const fraction = userSettings.currency === 'UZS' ? 0 : 2;
    const localeFormat = ['ru', 'uz_latn', 'uz_cyrl'].includes(userSettings.lang) ? 'ru-RU' : 'en-US';
    return new Intl.NumberFormat(localeFormat, { maximumFractionDigits: fraction }).format(converted) + ' ' + symbols[userSettings.currency];
  };

  const formatDuration = (months) => {
    if (months === Infinity) return "∞";
    const y = Math.floor(months / 12);
    const m = months % 12;

    const pluralize = (n, form1, form2, form5) => {
      let idx;
      if (n % 10 === 1 && n % 100 !== 11) idx = form1;
      else if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) idx = form2;
      else idx = form5;
      return `${n} ${t(idx)}`;
    };

    let res = [];
    if (y > 0) res.push(pluralize(y, 'year_1', 'year_2', 'year_5'));
    if (m > 0 || y === 0) res.push(pluralize(m, 'month_1', 'month_2', 'month_5'));
    return res.join(` ${t('and')} `);
  };

  const MoneyText = ({ amount, className = "" }) => (
    <span className={`${isAnon ? 'blur-money' : 'unblur-money'} ${className}`}>{formatMoney(amount)}</span>
  );

  // --- Блокировка скролла ---
  useEffect(() => {
    document.body.style.overflow = (isModalOpen || isResetModalOpen || isDeleteModalOpen || isSettingsOpen || isGoalModalOpen || isIncomeHistoryOpen || isCloseMonthModalOpen || unsavedWarning) ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isModalOpen, isResetModalOpen, isDeleteModalOpen, isSettingsOpen, isGoalModalOpen, isIncomeHistoryOpen, isCloseMonthModalOpen, unsavedWarning]);

  // --- Инициализация ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
        else await signInAnonymously(auth);
      } catch (err) { console.error("Auth error:", err); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const txCollection = collection(db, 'artifacts', appId, 'users', user.uid, 'transactions');
    const settingsDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'config');
    
    const unsubTx = onSnapshot(txCollection, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    
    const unsubSettings = onSnapshot(settingsDoc, (docSnap) => {
      if (docSnap.exists()) setUserSettings(prev => ({ ...prev, ...docSnap.data() }));
    });

    return () => { unsubTx(); unsubSettings(); };
  }, [user]);

useEffect(() => {
    // 1. Создаем или обновляем контейнер для стилей анимаций
    let styleSheet = document.getElementById('app-animations-styles');
    if (!styleSheet) {
      styleSheet = document.createElement("style");
      styleSheet.id = 'app-animations-styles';
      document.head.appendChild(styleSheet);
    }
    styleSheet.innerText = styles;

    // 2. Правильное переключение темной темы
    if (userSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 3. Форсированная загрузка Tailwind (на случай тупняков браузера)
    if (!window.tailwind) {
      const twScript = document.createElement('script');
      twScript.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(twScript);
    }

    return () => {
      const oldStyle = document.getElementById('app-animations-styles');
      if (oldStyle) oldStyle.remove();
    };
  }, [userSettings.theme]);

  // --- Расчеты статистики ---
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth && t.type !== 'transfer_in';
    });
  }, [transactions, selectedYear, selectedMonth]);

  const monthTransfers = useMemo(() => {
    return transactions.filter(t => t.type === 'transfer_in' && new Date(t.date).getFullYear() === selectedYear && new Date(t.date).getMonth() === selectedMonth);
  }, [transactions, selectedYear, selectedMonth]);

  const stats = useMemo(() => {
    let income = 0;
    let expensesTotal = 0;
    const expByCategory = { useless: 0, essential: 0 };

    currentMonthTransactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else if (t.category === 'income_correction') income -= t.amount;
      else if (t.type === 'expense' && CATEGORIES[t.category]) {
        expensesTotal += t.amount;
        expByCategory[t.category] += t.amount;
      }
    });

    const capsuleStats = {};
    Object.keys(CATEGORIES).forEach(key => {
      const limit = income * CATEGORIES[key].percent;
      const spent = expByCategory[key];
      const remaining = limit - spent;
      const fillPercent = limit > 0 ? (spent / limit) * 100 : 0; 
      capsuleStats[key] = { limit, spent, remaining, fillPercent };
    });

    const availableIncome = income * 0.70; 
    return { income, expensesTotal, balance: availableIncome - expensesTotal, capsules: capsuleStats };
  }, [currentMonthTransactions]);

  const globalSavingsStats = useMemo(() => {
    let totalIncome = 0;
    let totalCorrection = 0;
    let transferredToTargets = 0;
    let spentTargets = 0;
    let spentReserve = 0;
    const txTargets = [];
    const txReserve = [];

    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      else if (t.category === 'income_correction') totalCorrection += t.amount;
      else if (t.type === 'transfer_in' && t.category === 'savings_targets') transferredToTargets += t.amount;
      else if (t.type === 'expense') {
        if (t.category === 'savings_targets') { spentTargets += t.amount; txTargets.push(t); }
        else if (t.category === 'savings_reserve') { spentReserve += t.amount; txReserve.push(t); }
      }
    });

    const netIncome = Math.max(0, totalIncome - totalCorrection);
    txTargets.sort((a, b) => new Date(b.date) - new Date(a.date));
    txReserve.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      savings_targets: {
        limit: (netIncome * GLOBAL_CATEGORIES.savings_targets.percent) + transferredToTargets,
        spent: spentTargets,
        remaining: ((netIncome * GLOBAL_CATEGORIES.savings_targets.percent) + transferredToTargets) - spentTargets,
        transactions: txTargets
      },
      savings_reserve: {
        limit: netIncome * GLOBAL_CATEGORIES.savings_reserve.percent,
        spent: spentReserve,
        remaining: (netIncome * GLOBAL_CATEGORIES.savings_reserve.percent) - spentReserve,
        transactions: txReserve
      }
    };
  }, [transactions]);

  const savingsPace = useMemo(() => {
    const activeMonths = new Set();
    let totalIncomeAllTime = 0;
    let totalCorrectionAllTime = 0;
    transactions.forEach(t => {
      if (t.type === 'income' || t.category === 'income_correction') {
        const d = new Date(t.date);
        activeMonths.add(`${d.getFullYear()}-${d.getMonth()}`);
        if (t.type === 'income') totalIncomeAllTime += t.amount;
        if (t.category === 'income_correction') totalCorrectionAllTime += t.amount;
      }
    });
    const monthsCount = Math.max(1, activeMonths.size);
    const avgMonthlyIncome = Math.max(0, (totalIncomeAllTime - totalCorrectionAllTime) / monthsCount);
    return avgMonthlyIncome * GLOBAL_CATEGORIES.savings_targets.percent;
  }, [transactions]);

  // --- Обработчики ---
  const handleOpenModal = (mode, type, category = 'useless', tx = null) => {
    vibrate();
    setModalMode(mode);
    setModalType(type);
    if (type === 'expense') setModalCategory(category);
    
    if (mode === 'edit' && tx) {
      setFormData({ 
        title: tx.title, desc: tx.desc || '', amount: tx.amount.toString(), 
        tags: tx.tags ? [...tx.tags] : [], day: new Date(tx.date).getDate() 
      });
      setEditingTxId(tx.id);
    } else {
      setFormData({ title: '', desc: '', amount: '', tags: [], day: new Date().getDate() });
      setEditingTxId(null);
    }
    setIsAddingTag(false);
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleCloseAttempt = () => {
    if (formData.amount || formData.title || formData.tags.length > 0) setUnsavedWarning(true);
    else setIsModalOpen(false);
  };

  const handleAmountChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val === '000') val = '';
    if (formData.amount === '' && val.length === 1) {
      setFormData({ ...formData, amount: val + '000' });
      setTimeout(() => { if (e.target) e.target.setSelectionRange(1, 1); }, 0);
    } else setFormData({ ...formData, amount: val });
  };

  const handleSaveTransaction = (e) => {
    e.preventDefault();
    if (!user || !formData.amount || (modalType === 'expense' && modalCategory !== 'income_correction' && !formData.title)) return;
    vibrate();

    const txId = modalMode === 'add' ? Date.now().toString() : editingTxId;
    const txDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', txId);

    let txDate;
    if (modalMode === 'add') {
      const d = new Date();
      d.setFullYear(selectedYear);
      d.setDate(1); 
      if (modalType === 'income' || (modalCategory !== 'savings_targets' && modalCategory !== 'savings_reserve')) {
        d.setMonth(selectedMonth);
      }
      const maxDaysInTargetMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      d.setDate(Math.min(Math.max(1, parseInt(formData.day) || 15), maxDaysInTargetMonth));
      d.setHours(12, 0, 0, 0);
      txDate = d.toISOString();
    } else {
      const oldDate = new Date(transactions.find(t => t.id === editingTxId).date);
      const maxDaysInTargetMonth = new Date(oldDate.getFullYear(), oldDate.getMonth() + 1, 0).getDate();
      oldDate.setDate(Math.min(Math.max(1, parseInt(formData.day) || oldDate.getDate()), maxDaysInTargetMonth));
      txDate = oldDate.toISOString();
    }

    let defaultTitle = formData.title;
    if (modalType === 'income') defaultTitle = t('add_action') + ' ' + t('income_word').toLowerCase();
    if (modalCategory === 'income_correction') defaultTitle = t('subtract_income');

    const txData = {
      type: modalType,
      amount: parseFloat(formData.amount),
      title: defaultTitle,
      desc: formData.desc || '',
      date: txDate,
      tags: formData.tags || []
    };

    if (modalType === 'expense') txData.category = modalCategory;

    setIsModalOpen(false);
    setUnsavedWarning(false);
    setDoc(txDocRef, txData, { merge: true }).catch(err => console.error("Save error:", err));
  };

  const openGoalModal = (goal = null) => {
    vibrate();
    if (goal) setGoalData(goal);
    else setGoalData({ id: Date.now().toString(), name: '', amount: '' });
    setIsGoalModalOpen(true);
  };

  const saveGoalSubmit = (e) => {
    e.preventDefault();
    if (!user || !goalData.name || !goalData.amount) return;
    vibrate();
    const currentGoals = userSettings.goals || [];
    let newGoals;
    if (currentGoals.find(g => g.id === goalData.id)) {
      newGoals = currentGoals.map(g => g.id === goalData.id ? { ...goalData, amount: parseFloat(goalData.amount) } : g);
    } else {
      newGoals = [...currentGoals, { ...goalData, amount: parseFloat(goalData.amount) }];
    }
    const newSettings = { ...userSettings, goals: newGoals };
    setUserSettings(newSettings);
    setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'config'), newSettings, { merge: true });
    setIsGoalModalOpen(false);
  };

  const deleteGoal = (goalId) => {
    vibrate();
    const newGoals = (userSettings.goals || []).filter(g => g.id !== goalId);
    const newSettings = { ...userSettings, goals: newGoals };
    setUserSettings(newSettings);
    setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'config'), newSettings, { merge: true });
  };

  const executeCloseMonth = async () => {
    if (!user) return;
    vibrate();
    const batch = writeBatch(db);
    let totalTransfer = 0;

    Object.keys(CATEGORIES).forEach(key => {
      const rem = stats.capsules[key].remaining;
      if (rem > 0) {
        totalTransfer += rem;
        const expenseRef = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'));
        batch.set(expenseRef, {
          type: 'expense', category: key, amount: rem, title: 'Перенос остатка',
          desc: 'Автоматическое закрытие месяца', date: new Date(selectedYear, selectedMonth, 28, 12, 0, 0).toISOString(), tags: ['Перенос']
        });
      }
    });

    if (totalTransfer > 0) {
      const transferInRef = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'));
      batch.set(transferInRef, {
        type: 'transfer_in', category: 'savings_targets', amount: totalTransfer, title: '',
        desc: `Сэкономлено за ${monthNames[selectedMonth]}`, date: new Date(selectedYear, selectedMonth, 28, 12, 0, 0).toISOString(), tags: [monthNames[selectedMonth]]
      });
      await batch.commit();
    }
    setIsCloseMonthModalOpen(false);
  };

  const toggleSetting = (key, value) => {
    vibrate();
    const newSettings = { ...userSettings, [key]: value };
    setUserSettings(newSettings);
    if (user) setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'config'), newSettings, { merge: true });
  };

  const toggleThemeWithAnimation = () => {
    vibrate();
    const nextTheme = userSettings.theme === 'dark' ? 'light' : 'dark';

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.backgroundColor = '#000000'; 
    overlay.style.zIndex = '99999';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.2s ease-in-out';
    overlay.style.pointerEvents = 'none';

    document.body.appendChild(overlay);

    void overlay.offsetWidth;
    overlay.style.opacity = '1';

    setTimeout(() => {
      toggleSetting('theme', nextTheme);
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(overlay)) document.body.removeChild(overlay);
        }, 200); 
      }, 50); 
    }, 250); 
  };

  const exportData = () => {
    const dataStr = JSON.stringify(transactions);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `finance_backup_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  const importData = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedTxs = JSON.parse(event.target.result);
        for (let i = 0; i < importedTxs.length; i += 400) {
          const chunk = importedTxs.slice(i, i + 400);
          const batch = writeBatch(db);
          chunk.forEach(tx => {
            const ref = doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', tx.id);
            batch.set(ref, tx, { merge: true });
          });
          await batch.commit();
        }
        alert(t('saved_cloud'));
      } catch (err) { alert("Error importing backup."); }
    };
    reader.readAsText(file);
  };

  const handleResetMonth = async () => {
    if (!user) return;
    vibrate();
    const toDelete = [...currentMonthTransactions, ...monthTransfers];
    try {
      const batch = writeBatch(db);
      for (const tx of toDelete) {
        batch.delete(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', tx.id));
      }
      await batch.commit();
      setIsResetModalOpen(false);
    } catch (err) { console.error("Reset error:", err); }
  };

  const handleDeleteTransaction = async () => {
    if (!user || !txToDelete) return;
    vibrate();
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', txToDelete.id));
      setIsDeleteModalOpen(false);
      setTxToDelete(null);
    } catch (err) { console.error("Delete error:", err); }
  };

  const existingExpenseTags = Array.from(new Set(transactions.filter(t => t.type === 'expense').flatMap(tx => tx.tags || []))).sort();
  const existingIncomeTags = Array.from(new Set(transactions.filter(t => t.type === 'income').flatMap(tx => tx.tags || []))).sort();
  const currentTagPool = modalType === 'income' ? existingIncomeTags : existingExpenseTags;

  // --- Компонент списка транзакций ---
  const renderTransactionList = (txList, categoryKey, emptyText) => {
    const catFilter = filters[categoryKey];
    const allTags = Array.from(new Set(txList.flatMap(tx => tx.tags || [])));
    let filteredList = txList.filter(tx => catFilter.tags.length === 0 || (tx.tags && tx.tags.some(t => catFilter.tags.includes(t))));

    filteredList.sort((a, b) => {
      if (catFilter.sort === 'date_desc') return new Date(b.date) - new Date(a.date);
      if (catFilter.sort === 'date_asc') return new Date(a.date) - new Date(b.date);
      if (catFilter.sort === 'amt_desc') return b.amount - a.amount;
      if (catFilter.sort === 'amt_asc') return a.amount - b.amount;
      return 0;
    });

    const toggleTag = (tag) => {
      vibrate();
      setFilters(prev => {
        const newTags = prev[categoryKey].tags.includes(tag) ? prev[categoryKey].tags.filter(t => t !== tag) : [...prev[categoryKey].tags, tag];
        return { ...prev, [categoryKey]: { ...prev[categoryKey], tags: newTags } };
      });
    };

    return (
      <div className="flex flex-col h-full relative">
        <div className="p-5 border-b border-main flex justify-between items-center z-20">
          <div className="flex items-center space-x-3">
            <h4 className="font-bold text-main flex items-center text-lg">
              {categoryKey.startsWith('savings') ? t('history_short') : t('history')}
            </h4>
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setActiveFilterDropdown(activeFilterDropdown === categoryKey ? null : categoryKey); }} 
                      className={`p-1.5 rounded-lg transition-colors flex items-center ${catFilter.tags.length > 0 ? 'bg-blue-500/20 text-blue-500' : 'bg-card text-muted hover:bg-card-hover border border-main'}`}>
                <Filter size={14} />
                {catFilter.tags.length > 0 && <span className="ml-1 text-[10px] font-bold">{catFilter.tags.length}</span>}
              </button>
              
              {activeFilterDropdown === categoryKey && (
                <>
                  <div className="fixed inset-0 z-40" onPointerDown={(e) => { e.stopPropagation(); setActiveFilterDropdown(null); }}></div>
                  <div className="absolute top-full left-0 mt-2 w-56 bg-modal backdrop-blur-xl border border-main rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-sm font-medium text-main mb-3">{t('sort_title')}</p>
                    <div className="space-y-1 mb-4">
                      {[
                        { id: 'date_desc', label: t('sort_new') }, { id: 'date_asc', label: t('sort_old') },
                        { id: 'amt_desc', label: t('sort_exp') }, { id: 'amt_asc', label: t('sort_chp') }
                      ].map(opt => (
                        <button key={opt.id} onClick={() => { vibrate(); setFilters(p => ({...p, [categoryKey]: {...p[categoryKey], sort: opt.id}})); }} 
                          className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${catFilter.sort === opt.id ? 'bg-blue-500/20 text-blue-500 font-bold' : 'text-sub hover:bg-card-hover'}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {allTags.length > 0 && (
                      <>
                        <p className="text-sm font-medium text-main mb-3">{t('tags')}</p>
                        <div className="flex flex-wrap gap-2">
                          {allTags.map(tag => (
                            <button key={tag} onClick={() => toggleTag(tag)}
                              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${catFilter.tags.includes(tag) ? 'bg-blue-500/20 border-blue-500 text-blue-500' : 'bg-card border-main text-muted hover:border-blue-500'}`}>
                              {tag}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          <button onClick={() => handleOpenModal('add', 'expense', categoryKey)} className="bg-card border border-main text-main hover:bg-card-hover p-2 rounded-xl transition-colors active:scale-95"><Plus size={18} /></button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 flex flex-col min-h-[120px] max-h-[450px] rounded-b-[2.5rem]" onClick={() => setActiveFilterDropdown(null)}>
          {filteredList.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <p className="text-muted text-center text-sm leading-relaxed">{t(emptyText)}</p>
            </div>
          ) : (
            filteredList.map(tx => {
              const isTransferIn = tx.type === 'transfer_in';
              const sign = isTransferIn ? '+' : '-';
              const colorClass = isTransferIn ? 'text-emerald-500' : 'text-main';

              const localeFormat = ['ru', 'uz_latn', 'uz_cyrl'].includes(userSettings.lang) ? 'ru-RU' : 'en-US';

              return (
                <div key={tx.id} className="p-4 mb-3 last:mb-0 rounded-2xl bg-card border border-main group flex justify-between items-center hover:shadow-md transition-all">
                  <div className="flex-1 pr-3">
                    <p className="text-main font-bold text-base line-clamp-1">{isTransferIn ? tx.desc : tx.title}</p>
                    {!isTransferIn && tx.desc && <p className="text-sm text-muted line-clamp-2 mt-1">{tx.desc}</p>}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs text-muted">{new Date(tx.date).toLocaleDateString(localeFormat)}</span>
                      {tx.tags && tx.tags.map(tag => (
                        <span key={tag} className="text-xs font-medium px-2 py-1 rounded-lg bg-app text-sub border border-main">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-end overflow-hidden">
                    <span className={`${colorClass} font-bold text-lg whitespace-nowrap`}>
                      {sign} <MoneyText amount={tx.amount} />
                    </span>
                    <div className="flex space-x-1.5 overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100 group-hover:ml-3">
                      <button onClick={() => handleOpenModal('edit', 'expense', categoryKey, tx)} className="p-2 rounded-xl bg-app border border-main text-muted hover:text-blue-500 transition-colors" title={t('edit')}><Pencil size={14} /></button>
                      <button onClick={() => { vibrate(); setTxToDelete(tx); setIsDeleteModalOpen(true); }} className="p-2 rounded-xl bg-app border border-main text-muted hover:text-red-500 transition-colors" title={t('delete')}><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0f172a' }} className="fixed inset-0 flex flex-col items-center justify-center z-[9999]">
        <div className="relative flex flex-col items-center">
          <Cloud size={60} className="text-blue-500 animate-pulse" />
          <div className="mt-4 text-blue-500/50 text-xs font-medium tracking-widest uppercase animate-pulse">
            Loading
          </div>
        </div>
      </div>
    );
  }

  // --- ЭКРАНЫ ---
  const renderYearsView = () => {
    const yearsList = Array.from({ length: 8 }, (_, i) => 2025 + i);
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-5xl mx-auto">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-main mb-4">{t('choose_year')}</h1>
          <p className="text-muted text-lg">{t('saved_cloud')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-4">
          {yearsList.map(y => (
            <button key={y} onClick={() => { vibrate(); setSelectedYear(y); setView('months'); }}
              className="relative overflow-hidden flex flex-col items-start justify-center py-10 px-8 rounded-3xl border border-main transition-all duration-300 text-left bg-card hover:bg-card-hover shadow-xl group active:scale-95">
              <span className="text-4xl font-bold tracking-wider mb-2 z-10 text-main">{y}</span>
              <span className="text-sm font-medium z-10 text-blue-500 opacity-80 group-hover:opacity-100 transition-opacity">{t('open_year')}</span>
              <Calendar size={90} className="absolute -right-6 -bottom-6 text-main opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-500 transform group-hover:-rotate-12 group-hover:scale-125" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthsView = () => (
    <div className="max-w-4xl mx-auto pt-10 animate-in fade-in slide-in-from-bottom-8 duration-500 px-4 pb-20">
      <div className="flex justify-between items-center mb-10">
        <button onClick={() => { vibrate(); setView('years'); }} className="flex items-center text-muted hover:text-main transition-colors"><ArrowLeft className="mr-2" size={20} /> {t('back')}</button>
        <div className="flex space-x-4 items-center">
          <button onClick={() => { vibrate(); setIsSettingsOpen(true); }} className="p-2 text-muted hover:text-main bg-card border border-main rounded-xl"><Settings size={18} /></button>
          <button onClick={() => { vibrate(); setIsAnon(!isAnon); }} className="p-2 text-muted hover:text-main bg-card border border-main rounded-xl">{isAnon ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
        </div>
      </div>

      <h1 className="text-4xl font-bold text-main mb-10">{t('year')}: <span className="text-blue-500">{selectedYear}</span></h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
        {monthNames.map((m, idx) => (
          <button key={idx} onClick={() => { vibrate(); setSelectedMonth(idx); setView('dashboard'); }} 
            className="p-6 rounded-2xl bg-card border border-main hover:bg-card-hover transition-all text-xl font-medium text-main active:scale-95 shadow-md">
            {m}
          </button>
        ))}
      </div>

      {/* --- ГЛОБАЛЬНЫЕ ФОНДЫ --- */}
      <div className="space-y-12 relative z-0">
        {Object.entries(GLOBAL_CATEGORIES).map(([key, cat]) => {
          const stats = globalSavingsStats[key];
          return (
            <div key={key} className="border-t border-main pt-10 first:border-t-0 first:pt-0">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-main flex items-center">
                  <cat.icon className="mr-3" style={{ color: cat.color }} size={28} />
                  {t(`cat_${key}`)}
                </h2>
                {key === 'savings_targets' && (
                  <button onClick={() => openGoalModal()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl shadow-md active:scale-95 transition-colors flex items-center text-sm font-bold">
                    <Plus size={16} className="mr-1" /> {t('goal_add')}
                  </button>
                )}
              </div>
              <p className="text-muted mb-6">{t(`desc_${key}`)}</p>
              
              <div className="rounded-[3rem] p-6 mb-6 overflow-hidden flex items-center justify-start shadow-md border" style={{ backgroundColor: `${cat.color}10`, borderColor: `${cat.color}30` }}>
                <div className="text-left pl-4">
                  <p className="text-sm font-bold mb-1" style={{ color: cat.color }}>{t('avail_all')} ({cat.percent * 100}%)</p>
                  <MoneyText amount={stats.remaining} className={`text-4xl md:text-5xl font-bold ${stats.remaining < 0 ? 'text-red-500' : 'text-main'}`} />
                </div>
              </div>

              {key === 'savings_targets' && userSettings.goals && userSettings.goals.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {userSettings.goals.map(g => {
                    const isReached = stats.remaining >= g.amount;
                    const remainingTarget = g.amount - stats.remaining;
                    const monthsLeft = savingsPace > 0 ? Math.ceil(remainingTarget / savingsPace) : Infinity;

                    return (
                      <div key={g.id} className="bg-card border border-main rounded-2xl p-5 shadow-lg relative group">
                        <button onClick={() => deleteGoal(g.id)} className="absolute top-3 right-3 text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={16} />
                        </button>
                        <button onClick={() => openGoalModal(g)} className="absolute top-3 right-10 text-muted hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Pencil size={16} />
                        </button>
                        <p className="text-sm font-bold text-blue-500 mb-1">{g.name}</p>
                        <MoneyText amount={g.amount} className="text-2xl font-bold text-main block mb-3" />
                        {isReached ? (
                          <p className="text-emerald-500 text-sm font-bold flex items-center"><CheckCircle2 className="mr-1" size={16}/> {t('goal_reached')}</p>
                        ) : (
                          <p className="text-xs text-sub font-medium leading-relaxed">
                            {t('goal_pace')} <MoneyText amount={savingsPace} className="font-bold text-blue-500"/>/{t('month_1')}<br/>
                            {t('goal_reach')} <span className="font-bold text-blue-500">{formatDuration(monthsLeft)}</span>
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <div className={`bg-card border border-main rounded-[2.5rem] flex flex-col shadow-lg min-h-[150px] max-h-[500px] transition-all duration-300 ${activeFilterDropdown === key ? 'relative z-50' : 'relative z-10'}`}>
                {renderTransactionList(stats.transactions, key, cat.emptyKey)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDashboard = () => {
    const hasRemainders = stats.capsules.useless.remaining > 0 || stats.capsules.essential.remaining > 0;

    return (
      <div className="max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-8 duration-500 px-4 relative z-0">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-main">
          <button onClick={() => { vibrate(); setView('months'); }} className="flex items-center text-muted hover:text-main transition-colors flex-1"><ArrowLeft className="mr-2" size={20} /> <span className="hidden sm:inline">{t('back')}</span></button>
          <h2 className="text-2xl font-bold text-main text-center flex-1">{monthNames[selectedMonth]} {selectedYear}</h2>
          <div className="flex-1 flex justify-end space-x-2">
            <button onClick={() => { vibrate(); setIsAnon(!isAnon); }} className="p-3 bg-card border border-main rounded-xl text-muted hover:text-main transition-colors">{isAnon ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
            <button onClick={() => { vibrate(); setIsResetModalOpen(true); }} className="p-3 bg-card border border-main rounded-xl text-muted hover:text-red-500 transition-colors"><RotateCcw size={18} /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-card border border-main rounded-[2rem] p-6 flex items-center justify-between shadow-lg">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-sub text-sm font-medium">{t('total_income')}</p>
                <button onClick={() => setIsIncomeHistoryOpen(true)} className="p-1 bg-app border border-main rounded-md hover:text-blue-500 transition-colors text-muted" title={t('income_history')}>
                  <List size={14} />
                </button>
              </div>
              <MoneyText amount={stats.income} className="text-3xl font-bold text-main" />
            </div>
            <div className="flex space-x-2">
              <button onClick={() => handleOpenModal('add', 'expense', 'income_correction')} className="bg-red-500 hover:bg-red-600 p-4 rounded-2xl text-white shadow-lg active:scale-95 transition-all"><Minus size={24} /></button>
              <button onClick={() => handleOpenModal('add', 'income')} className="bg-emerald-500 hover:bg-emerald-600 p-4 rounded-2xl text-white shadow-lg active:scale-95 transition-all"><Plus size={24} /></button>
            </div>
          </div>
          <div className="bg-card border border-main rounded-[2rem] p-6 relative overflow-hidden shadow-lg">
            <p className="text-sub text-sm mb-1 font-medium">{t('wallet')}</p>
            <MoneyText amount={stats.balance} className={`text-3xl font-bold ${stats.balance < 0 ? 'text-red-500' : 'text-main'}`} />
            <Wallet className="absolute right-[-20px] bottom-[-20px] text-muted opacity-10" size={120} />
          </div>
        </div>

        {hasRemainders && (
          <button onClick={() => { vibrate(); setIsCloseMonthModalOpen(true); }} className="w-full mb-12 p-6 rounded-3xl bg-blue-500/10 border border-blue-500/30 hover:border-blue-500/50 transition-all flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg shadow-sm active:scale-95 group">
            <Target className="mr-3 group-hover:scale-110 transition-transform" />
            {t('close_month')}
          </button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const catStats = stats.capsules[key];
            const isOverfill = catStats.fillPercent > 100;
            const glassColor = isOverfill ? '#ef4444' : cat.color;

            return (
              <div key={key} className={`bg-card border rounded-[2.5rem] p-8 flex flex-col items-center shadow-xl transition-colors duration-500 ${isOverfill ? 'border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.15)]' : 'border-main'}`}>
                <div className="text-center mb-8">
                  <div className={`inline-flex p-3 rounded-2xl mb-3 transition-colors duration-500`} style={{ backgroundColor: `${glassColor}20`, color: glassColor }}><cat.icon size={28} /></div>
                  <h3 className="text-xl font-bold text-main mb-1">{t(`cat_${key}`)}</h3>
                  <p className="text-sm font-medium text-muted">{t(`desc_${key}`)}</p>
                </div>

                <div className="relative mb-10 w-32 h-72 bg-app border-[3px] rounded-full overflow-hidden shadow-[inset_0_10px_20px_var(--c-shadow)] transition-colors duration-500" 
                     style={{ borderColor: `${glassColor}40` }}>
                  
                  {/* Текст над водой (Светлый/Темный) */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none rounded-full overflow-hidden">
                    <span className="text-2xl font-black text-main tracking-wide">{Math.round(catStats.fillPercent)}%</span>
                  </div>

                  {/* Контейнер с жидкостью */}
                  <div className="absolute bottom-0 left-0 w-full transition-all duration-1000 z-20 overflow-hidden rounded-b-full" style={{ height: `${Math.min(catStats.fillPercent, 100)}%` }}>
                    {catStats.fillPercent > 0 && (
                      <>
                        <div className={`absolute top-[-24px] left-0 w-[200%] h-6 z-0 ${isOverfill ? 'animate-wave-boil-2' : 'animate-wave-2'}`} style={{ color: glassColor, opacity: 0.4 }}>
                          <svg viewBox="0 0 800 40" preserveAspectRatio="none" className="w-full h-full fill-current">
                            <path d="M0,20 C150,40 250,0 400,20 C550,40 650,0 800,20 L800,40 L0,40 Z" />
                          </svg>
                        </div>
                        <div className={`absolute top-[-24px] left-0 w-[200%] h-6 z-10 ${isOverfill ? 'animate-wave-boil-1' : 'animate-wave-1'}`} style={{ color: glassColor, opacity: 0.85 }}>
                          <svg viewBox="0 0 800 40" preserveAspectRatio="none" className="w-full h-full fill-current">
                            <path d="M0,20 C100,0 300,40 400,20 C500,0 700,40 800,20 L800,40 L0,40 Z" />
                          </svg>
                        </div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-10 blur-xl" style={{ backgroundColor: glassColor, opacity: 0.5 }}></div>
                        <div className="absolute inset-0" style={{ backgroundColor: glassColor, opacity: 0.85 }}></div>
                        
                        {/* Текст под водой (Всегда Белый) */}
                        <div className="absolute bottom-0 left-0 w-32 h-72 flex items-center justify-center pointer-events-none">
                          <span className="text-2xl font-black text-white tracking-wide">{Math.round(catStats.fillPercent)}%</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="w-full space-y-2 text-sm font-medium">
                  <div className="flex justify-between px-5 py-4 rounded-2xl bg-app border border-main">
                     <span className="text-muted">{t('limit')}</span><MoneyText amount={catStats.limit} className="text-main" />
                  </div>
                  <div className={`flex justify-between px-5 py-4 rounded-2xl bg-app border transition-colors ${isOverfill ? 'bg-red-500/10 border-red-500/30' : 'border-main'}`}>
                     <span className="text-muted">{t('remainder')}</span><MoneyText amount={catStats.remaining} className={isOverfill ? 'text-red-500' : 'text-main'} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <div key={key} className={`bg-card border border-main rounded-[2.5rem] shadow-lg flex flex-col min-h-[150px] max-h-[500px] transition-all duration-300 ${activeFilterDropdown === key ? 'relative z-50' : 'relative z-10'}`}>
              {renderTransactionList(currentMonthTransactions.filter(t => t.type === 'expense' && t.category === key), key, cat.emptyKey)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`${userSettings.theme === 'dark' ? 'dark' : ''} min-h-screen bg-app text-main font-sans selection:bg-blue-500/30 transition-colors duration-0 relative`}>
      <div className="py-10">{view === 'years' ? renderYearsView() : view === 'months' ? renderMonthsView() : renderDashboard()}</div>
      
      {/* Модалка Добавления Цели */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200" onPointerDown={() => setIsGoalModalOpen(false)}>
          <div className="bg-modal border border-main rounded-[2rem] w-full max-w-sm p-8 shadow-2xl" onPointerDown={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-main tracking-tight">{t('goal_title')}</h2>
              <button type="button" onClick={() => setIsGoalModalOpen(false)} className="bg-card border border-main p-2 rounded-full text-muted hover:text-main transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={saveGoalSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-sub mb-2 block">{t('goal_name')}</label>
                <input type="text" required value={goalData.name} onChange={e => setGoalData({...goalData, name: e.target.value})} 
                       className="w-full h-12 bg-transparent border-b-2 border-main focus:border-blue-500 px-2 text-main text-lg font-medium focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-sm font-medium text-sub mb-2 block">{t('goal_amount')} ({userSettings.lang === 'ru' || userSettings.lang.startsWith('uz') ? 'сум' : 'UZS'})</label>
                <input type="text" inputMode="numeric" required value={goalData.amount} onChange={e => setGoalData({...goalData, amount: e.target.value.replace(/\D/g, '')})} 
                       className="w-full h-12 bg-transparent border-b-2 border-main focus:border-blue-500 px-2 text-main text-2xl font-bold focus:outline-none transition-colors" />
              </div>
              <button type="submit" className="w-full py-4 mt-6 rounded-2xl bg-blue-500 text-white font-bold text-lg shadow-xl active:scale-95 transition-all">
                {t('save')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Модалка Истории Доходов */}
      {isIncomeHistoryOpen && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200" onPointerDown={() => setIsIncomeHistoryOpen(false)}>
          <div className="bg-modal border border-main rounded-[2rem] w-full max-w-lg h-[80vh] flex flex-col shadow-2xl" onPointerDown={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-main">
              <h2 className="text-xl font-bold text-main">{t('income_history')}</h2>
              <button onClick={() => setIsIncomeHistoryOpen(false)} className="bg-card border border-main p-2 rounded-full text-muted hover:text-main transition-colors"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {transactions.filter(t => t.type === 'income' && new Date(t.date).getFullYear() === selectedYear && new Date(t.date).getMonth() === selectedMonth).sort((a,b) => new Date(b.date) - new Date(a.date)).length === 0 ? (
                <div className="flex-1 flex items-center justify-center h-full">
                  <p className="text-muted text-center text-sm">{t('empty_targets')}</p>
                </div>
              ) : (
                transactions.filter(t => t.type === 'income' && new Date(t.date).getFullYear() === selectedYear && new Date(t.date).getMonth() === selectedMonth).sort((a,b) => new Date(b.date) - new Date(a.date)).map(tx => (
                  <div key={tx.id} className="p-4 rounded-2xl bg-card border border-main group flex justify-between items-center hover:shadow-md transition-all">
                    <div className="flex-1 pr-3">
                      <p className="text-main font-bold text-base capitalize">
                        {new Date(tx.date).toLocaleDateString(['ru', 'uz_latn', 'uz_cyrl'].includes(userSettings.lang) ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      {tx.desc && <p className="text-sm text-muted line-clamp-2 mt-1">{tx.desc}</p>}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {tx.tags && tx.tags.map(tag => (
                          <span key={tag} className="text-xs font-medium px-2 py-1 rounded-lg bg-app text-sub border border-main">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-end overflow-hidden">
                      <span className="text-emerald-500 font-bold text-lg whitespace-nowrap">
                        + <MoneyText amount={tx.amount} />
                      </span>
                      <div className="flex space-x-1.5 overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100 group-hover:ml-3">
                        <button onClick={() => handleOpenModal('edit', 'income', 'income', tx)} className="p-2 rounded-xl bg-app border border-main text-muted hover:text-blue-500 transition-colors" title={t('edit')}><Pencil size={14} /></button>
                        <button onClick={() => { vibrate(); setTxToDelete(tx); setIsDeleteModalOpen(true); }} className="p-2 rounded-xl bg-app border border-main text-muted hover:text-red-500 transition-colors" title={t('delete')}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Модалка Транзакции */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200" onPointerDown={handleCloseAttempt}>
          <div className="bg-modal border border-main rounded-[2rem] w-full max-w-md p-8 space-y-5 shadow-[0_0_60px_rgba(0,0,0,0.5)]" onPointerDown={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-main tracking-tight">
                {modalMode === 'edit' ? t('edit') : t('add_action')} {modalType === 'income' ? t('income_word').toLowerCase() : (modalCategory === 'income_correction' ? t('subtract_income').toLowerCase() : t('expense_word').toLowerCase())}
              </h2>
              <button type="button" onClick={handleCloseAttempt} className="bg-card border border-main p-2 rounded-full text-muted hover:text-main transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-5">
              {modalType === 'expense' && modalCategory !== 'income_correction' && (
                <div>
                  <label className="text-sm font-medium text-sub mb-2 block">{t('title')}</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
                         className="w-full h-12 bg-transparent border-b-2 border-main focus:border-blue-500 px-2 text-main text-lg focus:outline-none transition-colors" />
                </div>
              )}
              
              <div className="flex space-x-6 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium text-sub mb-2 block">{t('amount')} ({userSettings.lang === 'ru' || userSettings.lang.startsWith('uz') ? 'сум' : 'UZS'})</label>
                  <input type="text" inputMode="numeric" required value={formData.amount} 
                         onChange={handleAmountChange} 
                         onWheel={(e) => {
                           e.preventDefault();
                           const current = parseInt(formData.amount.toString().replace(/\D/g, '') || '0', 10);
                           const delta = e.deltaY < 0 ? (e.shiftKey ? 100000 : 1000) : (e.shiftKey ? -100000 : -1000);
                           const next = Math.max(0, current + delta);
                           setFormData(prev => ({ ...prev, amount: next === 0 ? '' : next.toString() }));
                         }}
                         className="w-full h-12 bg-transparent border-b-2 border-main focus:border-blue-500 px-2 text-main text-2xl font-bold focus:outline-none transition-colors" />
                </div>
                {(modalType === 'income' || (modalType === 'expense' && modalCategory !== 'savings_targets' && modalCategory !== 'savings_reserve')) && modalMode === 'add' && (
                  <div className="w-24">
                    <label className="text-sm font-medium text-sub mb-2 block">{t('day')}</label>
                    <input type="text" inputMode="numeric" value={formData.day} 
                           onChange={e => {
                             let val = e.target.value.replace(/\D/g, '');
                             const maxDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
                             if (val !== '' && parseInt(val) > maxDays) val = maxDays.toString();
                             setFormData({...formData, day: val});
                           }} 
                           onWheel={(e) => {
                             e.preventDefault();
                             const maxDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
                             const current = parseInt(formData.day || '1', 10);
                             const delta = e.deltaY < 0 ? 1 : -1;
                             const next = Math.min(Math.max(1, current + delta), maxDays);
                             setFormData(prev => ({ ...prev, day: next }));
                           }}
                           className="w-full h-12 bg-transparent border-b-2 border-main focus:border-blue-500 px-2 text-main text-2xl text-center font-bold focus:outline-none transition-colors" />
                  </div>
                )}
              </div>

              {modalCategory !== 'income_correction' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-sub mb-2 block">{t('tags')}</label>
                    <div className="flex flex-wrap gap-2 items-center mb-3">
                      {formData.tags.map(tag => (
                        <span key={tag} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-xl text-sm flex items-center font-medium">
                          {tag} 
                          <button type="button" onClick={() => setFormData({...formData, tags: formData.tags.filter(t => t !== tag)})} className="ml-2 hover:text-red-500 transition-colors"><X size={14}/></button>
                        </span>
                      ))}
                      <button type="button" onClick={() => setIsAddingTag(!isAddingTag)} className={`px-3 py-1.5 border border-main text-muted rounded-xl text-sm font-medium transition-colors ${isAddingTag ? 'bg-card' : 'bg-transparent border-dashed hover:text-main'}`}>
                        + {t('add_tag')}
                      </button>
                    </div>
                    {isAddingTag && (
                      <input autoFocus value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="..."
                             onBlur={() => {
                               if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) setFormData({...formData, tags: [...formData.tags, tagInput.trim()]});
                               setIsAddingTag(false); setTagInput('');
                             }}
                             onKeyDown={e => {
                               if (e.key === 'Enter') {
                                 e.preventDefault();
                                 if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) setFormData({...formData, tags: [...formData.tags, tagInput.trim()]});
                                 setIsAddingTag(false); setTagInput('');
                               }
                             }}
                             className="w-full h-12 bg-card border border-main focus:border-blue-500 rounded-xl px-4 text-main text-sm focus:outline-none transition-colors" />
                    )}
                    {currentTagPool.filter(t => !formData.tags.includes(t)).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-main">
                        {currentTagPool.filter(t => !formData.tags.includes(t)).map(tag => (
                          <button type="button" key={tag} onClick={() => { vibrate(); setFormData({...formData, tags: [...formData.tags, tag]}); }} 
                                  className="px-3 py-1.5 bg-card border border-main text-muted rounded-xl text-xs font-medium hover:border-blue-500 hover:text-blue-500 transition-colors">
                            + {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-sub mb-2 block">{t('desc')}</label>
                    <textarea value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} 
                              className="w-full bg-card border border-main rounded-xl px-4 py-3 text-main text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors" rows="2" />
                  </div>
                </>
              )}

              <button type="submit" className="w-full py-4 mt-6 rounded-2xl text-white font-bold text-lg shadow-xl active:scale-95 transition-all" 
                      style={{ backgroundColor: modalType === 'income' ? '#10b981' : (modalCategory === 'income_correction' ? '#ef4444' : (CATEGORIES[modalCategory] || GLOBAL_CATEGORIES[modalCategory]).color) }}>
                {t('save')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Warning Modal (Unsaved changes) */}
      {unsavedWarning && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-modal border border-main rounded-3xl p-8 text-center max-w-sm shadow-2xl">
            <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
            <h2 className="text-xl font-bold text-main mb-2">{t('unsaved')}</h2>
            <p className="text-muted text-sm mb-8">{t('unsaved_warn')}</p>
            <div className="flex space-x-3">
              <button onClick={() => setUnsavedWarning(false)} className="flex-1 py-3 bg-card border border-main rounded-xl font-medium text-main">{t('cancel')}</button>
              <button onClick={() => { setUnsavedWarning(false); setIsModalOpen(false); vibrate(); }} className="flex-1 py-3 bg-red-500 rounded-xl font-bold text-white">Закрыть</button>
            </div>
          </div>
        </div>
      )}

      {/* Настройки (Тема, Язык, Валюта, Экспорт/Импорт) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200" onPointerDown={() => setIsSettingsOpen(false)}>
          <div className="bg-modal border border-main rounded-[2rem] w-full max-w-md p-8 space-y-6 shadow-2xl" onPointerDown={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-main">{t('settings')}</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="bg-card border border-main p-2 rounded-full text-muted hover:text-main transition-colors"><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-card border border-main rounded-2xl">
                <span className="flex items-center font-medium text-main">
                  {userSettings.theme === 'dark' ? <Moon className="mr-3 text-blue-500"/> : <Sun className="mr-3 text-yellow-500"/>} 
                  {userSettings.theme === 'dark' ? t('theme_dark') : t('theme_light')}
                </span>
                <button onClick={toggleThemeWithAnimation} className={`w-12 h-6 rounded-full p-1 transition-colors ${userSettings.theme === 'dark' ? 'bg-blue-500' : 'bg-slate-300'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${userSettings.theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-card border border-main rounded-2xl relative z-20">
                <span className="flex items-center font-medium text-main"><Globe className="mr-3 text-emerald-500"/> {t('lang')}</span>
                <CustomSelect value={userSettings.lang} options={[
                  {value: 'ru', label: 'Русский'}, 
                  {value: 'en', label: 'English'},
                  {value: 'uz_latn', label: "O'zbekcha (Latn)"},
                  {value: 'uz_cyrl', label: "Ўзбекча (Кир)"}
                ]} onChange={(v) => toggleSetting('lang', v)} />
              </div>

              <div className="flex items-center justify-between p-4 bg-card border border-main rounded-2xl relative z-10">
                <span className="flex items-center font-medium text-main"><Wallet className="mr-3 text-purple-500"/> {t('currency_label')}</span>
                <CustomSelect value={userSettings.currency} options={[{value: 'UZS', label: 'UZS (Сум)'}, {value: 'USD', label: 'USD ($)'}, {value: 'RUB', label: 'RUB (₽)'}, {value: 'KZT', label: 'KZT (₸)'}]} onChange={(v) => toggleSetting('currency', v)} />
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-main">
              <button onClick={exportData} className="w-full py-4 bg-card border border-main hover:bg-card-hover rounded-xl font-medium text-main flex items-center justify-center transition-colors">
                <Download size={18} className="mr-2" /> {t('export')}
              </button>
              <label className="w-full py-4 bg-card border border-main hover:bg-card-hover rounded-xl font-medium text-main flex items-center justify-center transition-colors cursor-pointer">
                <Upload size={18} className="mr-2" /> {t('import')}
                <input type="file" accept=".json" className="hidden" onChange={importData} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Модалка закрытия месяца */}
      {isCloseMonthModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200" onPointerDown={() => setIsCloseMonthModalOpen(false)}>
          <div className="bg-modal border border-main rounded-3xl p-8 text-center max-w-sm shadow-2xl" onPointerDown={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-main mb-2">{t('close_month_confirm')}</h2>
            <p className="text-muted text-sm mb-8">{t('close_month_warn')}</p>
            <div className="flex space-x-3">
              <button onClick={() => setIsCloseMonthModalOpen(false)} className="flex-1 py-3 bg-card border border-main rounded-xl font-medium text-main transition-colors">{t('cancel')}</button>
              <button onClick={executeCloseMonth} className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all">{t('add_action')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка сброса */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200" onPointerDown={() => setIsResetModalOpen(false)}>
          <div className="bg-modal border border-red-500/30 rounded-3xl p-8 text-center max-w-sm shadow-2xl" onPointerDown={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-main mb-2">{t('reset_month')}</h2>
            <p className={`text-sm mb-8 ${monthTransfers.length > 0 ? 'text-yellow-500 font-medium' : 'text-muted'}`}>
              {monthTransfers.length > 0 ? t('reset_warn_transferred') : t('reset_warn')}
            </p>
            <div className="flex space-x-3">
              <button onClick={() => setIsResetModalOpen(false)} className="flex-1 py-3 bg-card border border-main rounded-xl font-medium text-main transition-colors">{t('cancel')}</button>
              <button onClick={handleResetMonth} className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all">{t('delete')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка удаления */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200" onPointerDown={() => setIsDeleteModalOpen(false)}>
          <div className="bg-modal border border-main rounded-3xl p-8 text-center max-w-sm shadow-2xl" onPointerDown={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-main mb-2">{t('delete')}?</h2>
            <p className="text-muted text-sm mb-8">{t('del_warn')}</p>
            <div className="flex space-x-3">
              <button onClick={() => { setIsDeleteModalOpen(false); setTxToDelete(null); }} className="flex-1 py-3 bg-card border border-main rounded-xl font-medium text-main transition-colors">{t('cancel')}</button>
              <button onClick={handleDeleteTransaction} className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all">{t('delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
