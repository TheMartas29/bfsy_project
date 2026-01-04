import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./index.css";

import en from "./lang/en.json";
import cs from "./lang/cs.json";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";

const INITIAL_DATA = {
  title: "My shopping list 1",
  items: [
    { id: 1, name: "Bread", done: false },
    { id: 2, name: "Butter", done: false },
    { id: 3, name: "Cheese", done: true }
  ],
  members: ["Anna", "Roman", "Peter"]
};

function getSystemTheme() {
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(themeSetting) {
  const finalTheme = themeSetting === "system" ? getSystemTheme() : themeSetting;

  document.body.classList.remove("theme-light", "theme-dark");
  document.body.classList.add(`theme-${finalTheme}`);
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const p = payload[0];
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "10px 12px",
        boxShadow: "0 10px 30px var(--shadow)",
        color: "var(--text)"
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
    </div>
  );
}

export default function ShoppingListDetail() {
  const [data, setData] = useState(INITIAL_DATA);
  const [newItem, setNewItem] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempTitle, setTempTitle] = useState(data.title);
  const titleInputRef = useRef(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [newMember, setNewMember] = useState("");

  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");
  const texts = lang === "en" ? en : cs;
  const t = (key) => texts[key] ?? key;

  const [themeSetting, setThemeSetting] = useState(
    () => localStorage.getItem("theme") || "system"
  );

  const [chartColors, setChartColors] = useState({
    done: "#0070f3",
    todo: "#b0b0b0"
  });

  useEffect(() => {
    applyTheme(themeSetting);
  }, [themeSetting]);

  useEffect(() => {
    if (!window.matchMedia) return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (themeSetting === "system") {
        applyTheme("system");
      }
    };

    if (mq.addEventListener) {
      mq.addEventListener("change", handleChange);
      return () => mq.removeEventListener("change", handleChange);
    } else {
      mq.addListener(handleChange);
      return () => mq.removeListener(handleChange);
    }
  }, [themeSetting]);

  useEffect(() => {
    if (isRenaming && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    const reloadSettings = () => {
      setLang(localStorage.getItem("lang") || "en");
      setThemeSetting(localStorage.getItem("theme") || "system");
    };

    window.addEventListener("focus", reloadSettings);
    return () => window.removeEventListener("focus", reloadSettings);
  }, []);

  useEffect(() => {
    const updateColorsFromCss = () => {
      const style = getComputedStyle(document.body);
      const doneColor = style.getPropertyValue("--link").trim() || "#0070f3";
      const todoColor =
        style.getPropertyValue("--muted-2").trim() || "#b0b0b0";
      setChartColors({ done: doneColor, todo: todoColor });
    };

    updateColorsFromCss();

    const mq =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    if (mq) {
      const handler = () => updateColorsFromCss();

      if (mq.addEventListener) {
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
      } else {
        mq.addListener(handler);
        return () => mq.removeListener(handler);
      }
    }
  }, [themeSetting]);

  const saveRename = () => {
    if (!tempTitle.trim()) return;
    setData({ ...data, title: tempTitle });
    setIsRenaming(false);
  };

  const toggle = (id) => {
    setData({
      ...data,
      items: data.items.map((x) =>
        x.id === id ? { ...x, done: !x.done } : x
      )
    });
  };

  const removeItem = (id) => {
    setData({
      ...data,
      items: data.items.filter((x) => x.id !== id)
    });
  };

  const addItem = () => {
    if (!newItem.trim()) return;

    setData({
      ...data,
      items: [...data.items, { id: Date.now(), name: newItem, done: false }]
    });
    setNewItem("");
  };

  const addMember = () => {
    if (!newMember.trim()) return;

    setData({
      ...data,
      members: [...data.members, newMember]
    });

    setNewMember("");
  };

  const removeMember = (name) => {
    setData({
      ...data,
      members: data.members.filter((m) => m !== name)
    });
  };

  const todo = data.items.filter((x) => !x.done);
  const done = data.items.filter((x) => x.done);

  const chartData = [
    { name: "Done", value: done.length },
    { name: "Todo", value: todo.length }
  ];

  const total = done.length + todo.length;
  const donePercent = total === 0 ? 0 : Math.round((done.length / total) * 100);

  return (
    <div className="page responsive-align">
      <Link to="/" className="back back-top">
        ← {t("back")}
      </Link>

      <header className="header">
        {!isRenaming ? (
          <h1>{data.title}</h1>
        ) : (
          <input
            ref={titleInputRef}
            className="title-input"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={saveRename}
            onKeyDown={(e) => e.key === "Enter" && saveRename()}
          />
        )}

        <div className="actions actions-right">
          <button className="dots" onClick={() => setMenuOpen(!menuOpen)}>
            •••
          </button>

          {menuOpen && (
            <div className="menu">
              <div
                className="menu-item"
                onClick={() => {
                  setIsRenaming(true);
                  setMenuOpen(false);
                }}
              >
                {t("rename")} ✏️
              </div>

              <div
                className="menu-item"
                onClick={() => {
                  setMembersOpen(true);
                  setMenuOpen(false);
                }}
              >
                {t("members")} 👥
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="section">
        <h3>Progress</h3>

        <div
          style={{
            width: "100%",
            maxWidth: 520,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 6px 20px var(--shadow)"
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 18,
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ width: 260, maxWidth: "100%", flex: "1 1 220px" }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    <Cell fill={chartColors.done} />
                    <Cell fill={chartColors.todo} />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ flex: "1 1 180px", minWidth: 180 }}>
              <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1 }}>
                {donePercent}%
              </div>
              
              <div style={{ marginTop: 14, color: "var(--muted)" }}>
                <div>
                  {t("completed")}:{" "}
                  <strong style={{ color: "var(--text)" }}>{done.length}</strong>
                </div>
                <div style={{ marginTop: 6 }}>
                  {t("todo")}:{" "}
                  <strong style={{ color: "var(--text)" }}>{todo.length}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h3>{t("todo")}</h3>

        {todo.map((item) => (
          <div className="item-row" key={item.id}>
            <label className="check-wrapper">
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggle(item.id)}
              />
              <span>{item.name}</span>
            </label>

            <button className="delete-btn" onClick={() => removeItem(item.id)}>
              🗑️
            </button>
          </div>
        ))}

        <div className="add-row">
          <button className="plus">＋</button>
          <input
            placeholder={t("addNew")}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
          />
        </div>
      </section>

      {done.length > 0 && (
        <section className="section">
          <h3>{t("completed")}</h3>

          {done.map((item) => (
            <div className="item-row done" key={item.id}>
              <label className="check-wrapper">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggle(item.id)}
                />
                <span>{item.name}</span>
              </label>

              <button
                className="delete-btn"
                onClick={() => removeItem(item.id)}
              >
                🗑️
              </button>
            </div>
          ))}
        </section>
      )}

      {membersOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{t("members")}</h2>

            {data.members.map((m) => (
              <div key={m} className="item-row">
                <span>{m}</span>
                <button className="delete-btn" onClick={() => removeMember(m)}>
                  🗑️
                </button>
              </div>
            ))}

            <div className="add-row modal-add">
              <input
                placeholder={t("addMember")}
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addMember()}
                className="modal-input"
              />
              <button className="btn small" onClick={addMember}>
                {t("add")}
              </button>
            </div>

            <div className="modal-buttons">
              <button
                className="btn secondary wide"
                onClick={() => setMembersOpen(false)}
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}