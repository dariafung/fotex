import { useEffect } from "react";
import { SplitLayout } from "./layout/SplitLayout";
import { useProjectStore } from "../state/useProjectStore";

function App() {
  const loadModels = useProjectStore((s) => s.loadModels);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  return <SplitLayout />;
}

export default App;
