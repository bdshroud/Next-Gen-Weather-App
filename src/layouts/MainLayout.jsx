import { Outlet } from "react-router";

const MainLayout = () => {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-6 px-4">
      <Outlet />
    </div>
  );
};

export default MainLayout;
