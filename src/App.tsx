import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import VehiclesPage from '@/pages/vehicles';
import ConsistsPage from '@/pages/consists';
import RunLogsPage from '@/pages/runlogs';
import TrackMapPage from '@/pages/trackmap';
import DataPage from '@/pages/data';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/runlogs" replace />} />

        <Route
          path="/runlogs"
          element={
            <AppLayout>
              <RunLogsPage />
            </AppLayout>
          }
        />

        <Route
          path="/vehicles"
          element={
            <AppLayout>
              <VehiclesPage />
            </AppLayout>
          }
        />

        <Route
          path="/consists"
          element={
            <AppLayout>
              <ConsistsPage />
            </AppLayout>
          }
        />

        <Route path="/trackmap" element={<TrackMapPage />} />

        <Route
          path="/data"
          element={
            <AppLayout>
              <DataPage />
            </AppLayout>
          }
        />

        <Route path="*" element={<Navigate to="/runlogs" replace />} />
      </Routes>
    </Router>
  );
}
