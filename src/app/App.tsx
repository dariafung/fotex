import { useEffect } from "react";
import { SplitLayout } from "./layout/SplitLayout";
import { useProjectStore } from "../state/useProjectStore";

const DEBOUNCE_COMPILE_MS = 1000;

function App() {
  const loadModels = useProjectStore((s) => s.loadModels);
  const loadTempTex = useProjectStore((s) => s.loadTempTex);
  const texContent = useProjectStore((s) => s.texContent);
  const dirty = useProjectStore((s) => s.dirty);

  useEffect(() => {
    loadModels();
    loadTempTex();
  }, [loadModels, loadTempTex]);

  // Left edit → debounced compile → right PDF refreshes
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      useProjectStore.getState().compile();
    }, DEBOUNCE_COMPILE_MS);
    return () => clearTimeout(t);
  }, [texContent, dirty]);

  return <SplitLayout />;
}

export default App;
