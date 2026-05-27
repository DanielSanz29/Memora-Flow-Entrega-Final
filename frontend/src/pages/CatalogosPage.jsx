import { useEffect, useMemo, useState } from 'react';
import Alert from '../components/Alert.jsx';
import Loading from '../components/Loading.jsx';
import { api } from '../services/api.js';
import ataudesImage from '../assets/catalogos/ataudes.svg';
import floresImage from '../assets/catalogos/flores.svg';
import urnasImage from '../assets/catalogos/urnas.svg';

const categories = [
  {
    key: 'ataudes',
    title: 'Ataúdes',
    description: 'Opciones de inhumación con diferentes acabados y prestaciones.',
    image: ataudesImage
  },
  {
    key: 'flores',
    title: 'Flores',
    description: 'Arreglos florales para ceremonia, velatorio o despedida.',
    image: floresImage
  },
  {
    key: 'urnas',
    title: 'Urnas',
    description: 'Modelos disponibles para servicios de incineración.',
    image: urnasImage
  }
];

function money(value) {
  return `${Number(value || 0).toFixed(2)} €`;
}

function CategoryCard({ category, total, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(category.key)}
      className={`group overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#456265] ${active ? 'border-[#456265] ring-1 ring-[#d4dfdc]' : 'border-slate-200'}`}
    >
      <img src={category.image} alt={`Catálogo de ${category.title.toLowerCase()}`} className="h-44 w-full object-cover" />
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">{category.title}</h2>
          <span className="rounded-full bg-[#ecf1ef] px-2.5 py-1 text-xs font-semibold text-[#314b4c]">{total} productos</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-500">{category.description}</p>
        <p className="mt-3 text-sm font-semibold text-[#314b4c]">Ver catálogo <span aria-hidden="true">→</span></p>
      </div>
    </button>
  );
}

export default function CatalogosPage() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ataudes');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await api.productos();
        setProducts(response.data.filter((product) => categories.some((category) => category.key === product.categoria)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const selected = categories.find((category) => category.key === selectedCategory);
  const shownProducts = useMemo(
    () => products.filter((product) => product.categoria === selectedCategory),
    [products, selectedCategory]
  );

  if (loading) return <Loading text="Cargando catálogos..." />;

  return (
    <div className="space-y-6">
      <section className="surface p-6 lg:p-8">
        <p className="eyebrow">Consulta comercial</p>
        <h1 className="page-title mt-3">Catálogos funerarios</h1>
        <p className="page-description">Consulta los productos disponibles antes de preparar una orden. Los importes se incorporan al presupuesto cuando el asesor selecciona el artículo dentro de una orden.</p>
      </section>
      <Alert type="error">{error}</Alert>
      <section aria-label="Categorías de catálogo" className="grid gap-4 md:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard
            key={category.key}
            category={category}
            total={products.filter((product) => product.categoria === category.key).length}
            active={selectedCategory === category.key}
            onSelect={setSelectedCategory}
          />
        ))}
      </section>
      <section className="surface p-6 lg:p-7">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">{selected?.title}</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Productos disponibles</h2>
          </div>
          <p className="text-sm text-slate-500">{shownProducts.length} artículos activos</p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shownProducts.map((product) => (
            <article key={product.id} className="surface-muted flex h-full flex-col p-5">
              <p className="data-label">{selected?.title}</p>
              <h3 className="mt-2 text-base font-semibold text-slate-900">{product.nombre}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{product.descripcion}</p>
              <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Precio base</p>
                <p className="mt-1 text-xl font-semibold text-[#314b4c]">{money(product.precio_base)}</p>
              </div>
            </article>
          ))}
          {shownProducts.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500">
              No hay productos activos en esta categoría.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
