import { BrowserRouter, Link, Route, Routes } from "react-router";
import { Layout } from "./components/Layout";
import { emptyLink } from "./components/ui";
import { ProfileProvider } from "./hooks/useProfile";
import { useTitle } from "./hooks/useTitle";
import { Catalog } from "./pages/Catalog";
import { MovieDetail } from "./pages/MovieDetail";
import { MyRentals } from "./pages/MyRentals";
import { AdminOnly } from "./pages/admin/AdminPage";
import { CustomerForm } from "./pages/admin/CustomerForm";
import { Customers } from "./pages/admin/Customers";
import { GenreForm } from "./pages/admin/GenreForm";
import { Genres } from "./pages/admin/Genres";
import { MovieForm } from "./pages/admin/MovieForm";
import { Movies } from "./pages/admin/Movies";
import { Rentals } from "./pages/admin/Rentals";

function NotFound() {
    useTitle("Página não encontrada");

    return (
        <div className="py-16 text-center text-sm text-[#678]">
            Página não encontrada.
            <Link to="/" className={emptyLink}>Ver o catálogo</Link>
        </div>
    );
}

export function App() {
    return (
        <ProfileProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<Layout />}>
                        {/* Perfil Usuário */}
                        <Route index element={<Catalog />} />
                        <Route path="movies/:id" element={<MovieDetail />} />
                        <Route path="my-rentals" element={<MyRentals />} />

                        {/* Perfil Admin */}
                        <Route path="admin/genres" element={<AdminOnly><Genres /></AdminOnly>} />
                        <Route path="admin/genres/new" element={<AdminOnly><GenreForm /></AdminOnly>} />
                        <Route path="admin/genres/:id/edit" element={<AdminOnly><GenreForm /></AdminOnly>} />
                        <Route path="admin/movies" element={<AdminOnly><Movies /></AdminOnly>} />
                        <Route path="admin/movies/new" element={<AdminOnly><MovieForm /></AdminOnly>} />
                        <Route path="admin/movies/:id/edit" element={<AdminOnly><MovieForm /></AdminOnly>} />
                        <Route path="admin/customers" element={<AdminOnly><Customers /></AdminOnly>} />
                        <Route path="admin/customers/new" element={<AdminOnly><CustomerForm /></AdminOnly>} />
                        <Route path="admin/customers/:id/edit" element={<AdminOnly><CustomerForm /></AdminOnly>} />
                        <Route path="admin/rentals" element={<AdminOnly><Rentals /></AdminOnly>} />

                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ProfileProvider>
    );
}
