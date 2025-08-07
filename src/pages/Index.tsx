import { PhishingDashboard } from "@/components/PhishingDashboard";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const Index = () => {
  return (
    <ProtectedRoute>
      <PhishingDashboard />
    </ProtectedRoute>
  );
};

export default Index;
