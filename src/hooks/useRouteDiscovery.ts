import { useState, useCallback, useEffect } from 'react';
import type { Route, PaymentData } from '../types';
import { AppPayAPI } from '../services/AppPayAPI';

export interface UseRouteDiscoveryReturn {
  routes: Route[];
  selectedRoute: Route | null;
  isDiscoveringRoutes: boolean;
  routeDiscoveryError: string | null;
  discoverRoutes: (paymentData: PaymentData) => Promise<{ routes: Route[] } | null>;
  setSelectedRoute: (route: Route | null) => void;
}

export function useRouteDiscovery(api: AppPayAPI): UseRouteDiscoveryReturn {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isDiscoveringRoutes, setIsDiscoveringRoutes] = useState(false);
  const [routeDiscoveryError, setRouteDiscoveryError] = useState<string | null>(null);

  const discoverRoutes = useCallback(async (paymentData: PaymentData) => {
    setIsDiscoveringRoutes(true);
    setRouteDiscoveryError(null);

    try {
      const result = await api.discoverRoutes({
        fromChainId: paymentData.userWalletChain,
        toChainId: paymentData.sellerPreferredToken.chainId,
        fromToken: 'USDC', // Would be determined by wallet balance
        toToken: paymentData.sellerPreferredToken.symbol,
        amount: paymentData.amount,
      });

      setRoutes(result.routes);

      // Auto-select the first/best route
      if (result.routes.length > 0) {
        const bestRoute = result.routes.find(r => r.isOptimal) || result.routes[0];
        setSelectedRoute(bestRoute);
      }

      return { routes: result.routes };
    } catch (error: any) {
      console.error('Route discovery failed:', error);
      setRouteDiscoveryError(error.message || 'Failed to discover payment routes');
      return null;
    } finally {
      setIsDiscoveringRoutes(false);
    }
  }, [api]);

  return {
    routes,
    selectedRoute,
    isDiscoveringRoutes,
    routeDiscoveryError,
    discoverRoutes,
    setSelectedRoute,
  };
}
