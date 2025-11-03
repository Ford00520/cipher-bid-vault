import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Opt-in to React Router v7 behavior to silence future flag warnings
const router = createBrowserRouter(
  [
    { path: "/", element: <Index /> },
    // ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE
    { path: "*", element: <NotFound /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  },
);

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <RouterProvider
      router={router}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    />
  </TooltipProvider>
);

export default App;
