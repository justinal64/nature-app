import * as Network from 'expo-network';

// Only treat as offline when we're sure there's no link — isInternetReachable
// is frequently false/undefined on simulators even when actually online, so
// don't let it alone force the offline path.
export async function hasNetwork(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();
    return state.isConnected !== false;
  } catch {
    return true;
  }
}
