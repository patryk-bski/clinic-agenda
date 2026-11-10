import { Plus } from 'lucide-react'

export default function BookButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-[6px] bg-[#C2410C] px-3 py-2 text-sm font-normal text-white hover:bg-[#9A3412]"
    >
      <Plus size={15} strokeWidth={1.75} />
      Book appointment
    </button>
  )
}
