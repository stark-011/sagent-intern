import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

const NotFoundPage = () => (
  <div className="mx-auto max-w-md">
    <Card className="text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">404</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-1 text-sm text-slate-500">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-4 inline-block">
        <Button>Go Home</Button>
      </Link>
    </Card>
  </div>
);

export default NotFoundPage;
