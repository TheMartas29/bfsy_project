import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./index.css";

import en from "./lang/en.json";
import cs from "./lang/cs.json";

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
                <button
                  className="delete-btn"
                  onClick={() => removeMember(m)}
                >
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