const navItems = ['Agenda', 'Patients', 'Messages', 'Reports', 'Settings']

export default function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col bg-slate-900 text-slate-200">
      <div className="px-6 py-5 text-lg font-semibold text-white">Clinic Agenda</div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => (
          <a
            key={item}
            href="#"
            className={`block rounded-md px-3 py-2 text-sm ${
              item === 'Agenda' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800'
            }`}
          >
            {item}
          </a>
        ))}
      </nav>

      <div className="border-t border-slate-700 px-6 py-4 text-sm">
        <div className="font-medium text-white">Dr. Anna Lewis</div>
        <div className="text-slate-400">General Practice</div>
      </div>
    </aside>
  )
}
