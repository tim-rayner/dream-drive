import { useAuth } from "@/context/AuthContext";
import { secureState, UIState } from "@/lib/secureState";
import { useCallback, useEffect, useState } from "react";

export function useSecureState() {
  const { user } = useAuth();
  const [state, setState] = useState<UIState>({});

  // Load state when user changes
  useEffect(() => {
    if (user) {
      const userState = secureState.getState(user.id);
      setState(userState);
    } else {
      setState({});
    }
  }, [user]);

  // Update state in secure storage
  const updateState = useCallback(
    (newState: Partial<UIState>) => {
      if (!user) return;

      const updatedState = { ...state, ...newState };
      setState(updatedState);
      secureState.setState(user.id, updatedState);
    },
    [user, state]
  );

  // Update specific state property
  const updateStateProperty = useCallback(
    (key: keyof UIState, value: unknown) => {
      if (!user) return;

      const updatedState = { ...state, [key]: value };
      setState(updatedState);
      secureState.updateState(user.id, key, value);
    },
    [user, state]
  );

  // Clear state
  const clearState = useCallback(() => {
    if (!user) return;

    setState({});
    secureState.clearState(user.id);
  }, [user]);

  return {
    state,
    updateState,
    updateStateProperty,
    clearState,
  };
}
