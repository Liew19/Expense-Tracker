import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe } from "lucide-react";
import { useI18n } from "@/lib/I18nProvider";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { t, locale, setLocale, locales } = useI18n();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const switchLocale = (code) => {
    setLocale(code);
    setLangOpen(false);
  };

  return (
    <nav className="border-b">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1
          className="text-xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          {t("app.title")}
        </h1>

        {/* Desktop menu */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Language switcher */}
          <div className="relative">
            <button
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground p-1"
              onClick={() => setLangOpen(!langOpen)}
              aria-label="Switch language"
            >
              <Globe className="h-4 w-4" />
              <span className="uppercase">{locale}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-popover border rounded-md shadow-md z-50 min-w-[100px]">
                {locales.map((code) => (
                  <button
                    key={code}
                    className={`block w-full text-left px-3 py-2 text-sm hover:bg-accent ${
                      code === locale ? "font-bold" : ""
                    }`}
                    onClick={() => switchLocale(code)}
                  >
                    {code === "en" ? "English" : "中文"}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-sm text-muted-foreground">
            {user.username}
          </span>
          <Button variant="outline" onClick={handleLogout}>
            {t("nav.logout")}
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden border-t px-4 py-3 flex flex-col gap-3">
          {/* Language switcher */}
          <div className="flex gap-2">
            {locales.map((code) => (
              <button
                key={code}
                className={`flex-1 px-3 py-2 text-sm rounded-md border ${
                  code === locale
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border"
                }`}
                onClick={() => switchLocale(code)}
              >
                {code === "en" ? "English" : "中文"}
              </button>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {user.username}
          </span>
          <Button variant="outline" onClick={handleLogout} className="w-full">
            {t("nav.logout")}
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;