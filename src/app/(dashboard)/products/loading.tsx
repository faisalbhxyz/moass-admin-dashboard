export default function ProductsLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" aria-hidden />
      <p className="mt-3 text-sm text-gray-500">Loading products…</p>
    </div>
  );
}
