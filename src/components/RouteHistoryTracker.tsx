import { useRecordSettledRoute } from '../hooks/routeHistory';

/**
 * Drives the route record. Renders nothing; mount it inside the router.
 */
function RouteHistoryTracker() {
  useRecordSettledRoute();
  return null;
}

export default RouteHistoryTracker;
