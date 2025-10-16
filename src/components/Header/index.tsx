import { useState, type ChangeEvent } from "react";
import { Bell, Search } from "lucide-react";
import type { ActivityDTO } from "../../types";
interface HeaderProps {
  onSearch: (search: string) => void;
  lateActivities: ActivityDTO[];
}

export function Header({ onSearch, lateActivities }: HeaderProps) {
  const [search, setSearch] = useState("");

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    onSearch(e.target.value);
  }

  return (
    <header className="flex items-center justify-between bg-indigo-600 px-4 py-3 shadow-md">
      <div className="flex items-center gap-2 bg-white rounded-md px-2 py-1 w-72">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Localizar atividade..."
          className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
          value={search}
          onChange={handleChange}
        />
      </div>

      <div className="relative">
        <button className="p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition">
          <Bell size={20} className="text-white" />
        </button>

        {lateActivities.length > 0 && (
          <div>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5">
              1
            </span>

            <div className="absolute right-0 mt-2 bg-white border border-gray-200 text-xs text-gray-700 rounded-md shadow-lg p-2 w-max">
              Existe(m) {lateActivities.length} atividade(s) com atraso na entrega
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
