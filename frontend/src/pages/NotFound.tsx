import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <h1 className="font-display text-6xl font-bold text-foreground">404</h1>
      <p className="mt-3 text-muted-foreground">Səhifə tapılmadı</p>
      <Link to="/" className="mt-6 inline-block text-primary hover:underline">
        Ana səhifəyə qayıt
      </Link>
    </div>
  </div>
);

export default NotFound;
