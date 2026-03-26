const Footer = () => (
  <footer className="border-t border-slate-200 bg-white">
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6">
      <p>© {new Date().getFullYear()} Parking Spot Finder. All rights reserved.</p>
      <p>Built for smart city parking and seamless booking.</p>
    </div>
  </footer>
);

export default Footer;
