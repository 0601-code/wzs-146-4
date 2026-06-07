import { NavLink, useLocation } from 'react-router-dom';
import { Train, Layers, Clock, Map, Database, TrainFront } from 'lucide-react';

const navItems = [
  { path: '/runlogs', label: '运行日志', icon: Clock },
  { path: '/vehicles', label: '车辆档案', icon: Train },
  { path: '/consists', label: '编组方案', icon: Layers },
  { path: '/trackmap', label: '轨道图', icon: Map },
  { path: '/data', label: '数据管理', icon: Database },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-rail-900/80 backdrop-blur-sm border-r border-rail-700/50 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-rail-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-copper-500/20 flex items-center justify-center">
            <TrainFront className="w-6 h-6 text-copper-400" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-copper-400 tracking-wide">
              铁路记录板
            </h1>
            <p className="text-xs text-rail-500">Railway Logbook</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path !== '/runlogs' && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-rail-700/50">
        <p className="text-xs text-rail-500 text-center">
          数据保存在本地浏览器
        </p>
      </div>
    </aside>
  );
}
