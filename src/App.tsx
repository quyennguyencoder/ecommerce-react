
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-300 px-5 py-10 text-slate-900">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">
          Browse products and manage your orders from one place.
        </p>
      </main>
      <Footer />
    </div>
  );
}

export default App;
