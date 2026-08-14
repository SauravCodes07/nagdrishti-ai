

import { useState, useMemo } from "react";
import { Component, Search as SearchIcon } from 'lucide-react';

import SimpleBar from "simplebar-react";
import SidebarContent from "../../vertical/sidebar/sidebaritems";


import { Input } from "@/components/ui/input";
import { Link } from "react-router";

function Search() {
  const [query, setQuery] = useState("");

  // 🔍 Recursive search through menu
  const searchItems = (items: any[], q: string, parentPath = "") => {
    let results: any[] = [];

    items.forEach((item) => {
      const currentPath = parentPath
        ? `${parentPath} → ${item.name}`
        : item.name;

      // If match found
      if (
        item.name &&
        item.url &&
        item.name.toLowerCase().includes(q.toLowerCase())
      ) {
        results.push({
          name: item.name,
          url: item.url,
          path: currentPath,
          icon: item.icon,
        });
      }

      // Search deeper children
      if (item.items) {
        results = [...results, ...searchItems(item.items, q, currentPath)];
      }
    });

    return results;
  };

  // Memoize filtered results
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchItems(SidebarContent, query);
  }, [query]);

  return (
    <div className="relative w-full">
      <div className="flex items-center relative w-xs mx-auto ">
        <SearchIcon size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search NagDrishti AI crisis modules..."
          className="rounded-lg pl-10! bg-[#F7F7F7] dark:bg-[#0B1320] border-[#E5E5E5] dark:border-white/10 text-xs text-[#111111] dark:text-white focus:ring-1 focus:ring-[#FF8A00]"
          required
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div
        className={`absolute w-full bg-white dark:bg-[#111C2E] rounded-md top-11 z-10 start-0 shadow-md border border-[#E5E5E5] dark:border-white/10 ${Boolean(query) ? "block" : "hidden"
          }`}
      >
        <SimpleBar className="h-72 p-4 custom-scroll">
          {Boolean(results.length) ? (
            results.map((item, i) => (
              <Link
                key={i}
                to={item.url}
                onClick={() => setQuery("")}
                className="p-2 mb-1.5 last:mb-0 flex items-center bg-[#F7F7F7] dark:bg-[#0B1320] gap-2 text-sm font-medium rounded-md hover:bg-[#FFF8E1] dark:hover:bg-slate-800 text-[#111111] dark:text-white w-full overflow-hidden"
              >
                <div className="flex items-center">
                  <Component width={18} height={18} className="text-[#FF8A00]" />
                  <div className="ps-3">
                    <h5 className="mb-0.5 text-sm font-bold text-[#111111] dark:text-white">
                      {item.name}
                    </h5>
                    <span className="text-xs text-[#666666] dark:text-gray-400 block truncate max-w-60">
                      {item.url}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <h1 className="text-medium font-medium ">
                No Components Found!
              </h1>
            </div>
          )}
        </SimpleBar>
      </div>
    </div>
  );
}

export default Search;
