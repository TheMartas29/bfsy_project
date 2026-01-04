import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./index.css";

import en from "./lang/en.json";
import cs from "./lang/cs.json";

const currentUser = "User 1 (me)";

const INITIAL_LISTS = [
  {
    id: 1,
    title: "My shopping list 1",
    owner: "User 1 (me)",
    createdAt: "25/10/2025",
    archived: false
  },
  {
    id: 2,
    title: "My shopping list 2",
    owner: "User 2",
    createdAt: "25/10/2025",
    archived: false
  },
  {
    id: 3,
    title: "My shopping list 3",
    owner: "User 3",
    createdAt: "25/10/2025",
    archived: false
  },
  {
    id: 4,
    title: "My shopping list 1",
    owner: "User 1 (me)",
    createdAt: "25/10/2025",
    archived: true
  }
];

function formatToday() {
  return new Date().toLocaleDateString("en-GB");
}

function getSystemTheme() {
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(themeSetting) {
  // themeSetting = "system" | "light" | "dark"
  const finalTheme = themeSetting === "system" ? getSystemTheme() : themeSetting;

  document.body.classList.remove("theme-light", "theme-dark");
  document.body.classList.add(`theme-${finalTheme}`);
}

export default function ShoppingListOverview() {
  const [lists, setLists] = useState(INITIAL_LISTS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");
  const texts = lang === "en" ? en : cs;
  const t = (key) => texts[key] ?? key;
  const [themeSetting, setThemeSetting] = useState(
    () => localStorage.getItem("theme") || "system"
  );

  useEffect(() => {
    localStorage.setItem("theme", themeSetting);
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
      // older browsers
      mq.addListener(handleChange);
      return () => mq.removeListener(handleChange);
    }
  }, [themeSetting]);

  const activeLists = lists.filter((l) => !l.archived);
  const archivedLists = lists.filter((l) => l.archived);

  const openCreate = () => {
    setNewTitle("");
    setIsCreateOpen(true);
  };

  const createList = () => {
    if (!newTitle.trim()) return;

    const newList = {
      id: Date.now(),
      title: newTitle.trim(),
      owner: currentUser,
      createdAt: formatToday(),
      archived: false
    };

    setLists([...lists, newList]);
    setIsCreateOpen(false);
  };

  const deleteList = () => {
    if (!listToDelete) return;

    setLists(
      lists.map((l) =>
        l.id === listToDelete.id ? { ...l, archived: true } : l
      )
    );

    setListToDelete(null);
  };

  const toggleLang = () => {
    setLang((prev) => {
      const next = prev === "en" ? "cs" : "en";
      localStorage.setItem("lang", next);
      return next;
    });
  };

  const cycleTheme = () => {
    setThemeSetting((prev) => {
      if (prev === "system") return "light";
      if (prev === "light") return "dark";
      return "system";
    });
  };

  const themeLabel =
    themeSetting === "system"
      ? "System"
      : themeSetting === "light"
      ? "Light"
      : "Dark";

  return (
    <div className="page list-page">
      <div className="overview-topbar">
        <h1 className="app-title">{t("appTitle")}</h1>

        <div className="topbar-actions">
          <button className="lang-btn" onClick={toggleLang}>
            {lang === "en" ? "EN" : "CZ"}
          </button>

          <button className="theme-btn" onClick={cycleTheme}>
            {themeLabel}
          </button>
        </div>
      </div>

      <section className="list-section">
        <h2 className="section-title">{t("active")}</h2>

        <div className="card-grid">
          {activeLists.map((list) => (
            <div className="list-card" key={list.id}>
              <Link to={`/list/${list.id}`} className="card-main">
                <div className="card-title">{list.title}</div>
              </Link>

              <div className="card-footer">
                <span className="card-owner">{list.owner}</span>
                <span className="card-date">
                  {t("createdOn")} {list.createdAt}
                </span>
              </div>

              {list.owner === currentUser && (
                <button
                  className="card-delete"
                  onClick={() => setListToDelete(list)}
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="list-section">
        <h2 className="section-title">{t("archived")}</h2>

        <div className="card-grid">
          {archivedLists.map((list) => (
            <div className="list-card" key={list.id}>
              <Link to={`/list/${list.id}`} className="card-main">
                <div className="card-title">{list.title}</div>
              </Link>

              <div className="card-footer">
                <span className="card-owner">{list.owner}</span>
                <span className="card-date">
                  {t("createdOn")} {list.createdAt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <button className="fab" onClick={openCreate}>
        +
      </button>

      {isCreateOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{t("createNewList")}</h2>

            <label className="modal-label">
              {t("listTitle")}
              <input
                className="modal-input"
                placeholder={t("myShoppingList")}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createList()}
              />
            </label>

            <div className="modal-buttons">
              <button className="btn" onClick={createList}>
                {t("create")}
              </button>
              <button
                className="btn secondary"
                onClick={() => setIsCreateOpen(false)}
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {listToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{t("archiveListQuestion")}</h2>
            <p>
              {t("archiveListTextStart")}{" "}
              <strong>{listToDelete.title}</strong>{" "}
              {t("archiveListTextEnd")}
            </p>

            <div className="modal-buttons">
              <button className="btn danger" onClick={deleteList}>
                {t("archive")}
              </button>
              <button
                className="btn secondary"
                onClick={() => setListToDelete(null)}
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}