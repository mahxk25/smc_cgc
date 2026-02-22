import { Link } from 'react-router-dom';

/**
 * @param {{ items: Array<{ label: string, to?: string }> }} props
 */
export default function Breadcrumbs({ items }) {
  if (!items?.length) return null;
  return (
    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-slate-300">/</span>}
          {item.to != null ? (
            <Link to={item.to} className="hover:text-primary-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-700 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
