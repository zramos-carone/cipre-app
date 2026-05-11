"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function SearchInput({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", "1")
    if (term) {
      params.set("query", term)
    } else {
      params.delete("query")
    }
    replace(`${pathname}?${params.toString()}`)
  }, 300)

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Buscar
      </label>
      <Search className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground peer-focus:text-primary" />
      <Input
        className="peer block w-full rounded-full border border-primary/20 py-[9px] pl-10 text-sm outline-2 placeholder:text-muted-foreground bg-background/50 backdrop-blur-sm focus-visible:ring-primary/50 shadow-inner"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("query")?.toString()}
      />
    </div>
  )
}
